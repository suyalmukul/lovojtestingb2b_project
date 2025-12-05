const express = require('express');
const { jwtAuthAdmin } = require("../middleware/jwtAuth");
const StylistUnavailability = require('../models/StylistUnavailability.model');
const TimeSlot = require('../models/TimeSlot.model');
const StylistAvailabilityPreference = require('../models/StylistAvailabilityPreference.model');
const {  checkOverlappingSlots, normalizeToStandardGMT } = require('../utils/date');
const { catchAsyncError } = require('../middleware/catchAsyncError');
const Cart = require('../models/cart');
const User = require('../models/user');
const StylistAppointment = require('../models/StylistAppointments.model');


exports.addUnavailability = catchAsyncError(async (req, res) => {
  try {
    const { stylist_id, date, start_time, end_time, reason } = req.body;

    // Validate that stylist_id, date, start_time, and end_time are provided
    if (!stylist_id || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'stylist_id, Date, start_time, and end_time are required' });
    }

    // Convert date and start_time/end_time to JavaScript Date objects (if they're strings)
    const parsedDate = new Date(date);
    const parsedstart_time = new Date(start_time);
    const parsedend_time = new Date(end_time);

    // Check if the Date conversion was successful (invalid Date object check)
    if (isNaN(parsedDate) || isNaN(parsedstart_time) || isNaN(parsedend_time)) {
      return res.status(400).json({ error: 'Invalid Date format' });
    }

    // Optional: Validate reason is a string (default is 'Not Available')
    const validatedReason = reason || 'Not Available';

    // Create the unavailability document
    const newUnavailability = new StylistUnavailability({
      stylist_id,
      date: parsedDate,
      start_time: parsedstart_time,
      end_time: parsedend_time,
      reason: validatedReason,
    });

    // Save the new unavailability record to the database
    await newUnavailability.save();

    // Return a success response
    res.status(201).json({
      message: 'Unavailability added successfully',
      data: newUnavailability,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding unavailability' });
  }
});
exports.addPreference = catchAsyncError(async (req, res) => {
  const { stylist_id, availability } = req.body;

  if (!stylist_id || !Array.isArray(availability)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    for (const { day, slots } of availability) {
      if (!day || !Array.isArray(slots)) {
        return res.status(400).json({ message: 'Invalid format for availability' });
      }

      const isOverlapping = checkOverlappingSlots(slots);

      if (isOverlapping) {
        return res.status(400).json({
          message: `Time slots for ${day} are overlapping. Please fix them.`,
        });
      }

      // Delete all existing records for this day
      await StylistAvailabilityPreference.deleteMany({ stylist_id, day });

      // Add new slots
      const newSlots = slots.map(slot => {
        const start_time = normalizeToStandardGMT(slot.start_time)
        const end_time = normalizeToStandardGMT(slot.end_time)
        return {
          stylist_id,
          day,
          start_time,
          end_time,
        }
      })
      await StylistAvailabilityPreference.insertMany(newSlots);
    }

    res.status(200).json({ message: 'Stylist availability updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// exports.getPreference = catchAsyncError(async (req, res) => {
//   const { stylist_id } = req.params;
//   try {
//     // Fetch all availability preferences for the user, sorted by day and start_time
//     const {day}= req.query
//   const dbQuery= {stylist_id}
//     if(day){
//       dbQuery.day= day
//     }
//     console.log(day)

//     const preferences = await StylistAvailabilityPreference.find(dbQuery)
//       .sort({ day: 1, start_time: 1 });

//     if (!preferences.length) {
//       return res.status(404).json({ message: 'No availability found for the user.' });
//     }

//     // Group slots by day
//     const availability = preferences.reduce((acc, slot) => {
//       let dayEntry = acc.find(entry => entry.day === slot.day);
//       if (!dayEntry) {
//         dayEntry = { day: slot.day, slots: [] };
//         acc.push(dayEntry);
//       }

//       dayEntry.slots.push({
//         start_time: slot.start_time,
//         end_time: slot.end_time,
//       });

//       return acc;
//     }, []);

//     // Sort slots within each day
//     availability.forEach(day => {
//       day.slots.sort((a, b) => {
//         const timeA = new Date(a.start_item);
//         const timeB = new Date(b.start_time)
//         return timeA - timeB;
//       });
//     });

//     res.status(200).json({ success: true, stylist_id, availability });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
exports.getPreference = catchAsyncError(async (req, res) => {
  const { stylist_id } = req.params;
  const { day } = req.query;
  const dbQuery = { stylist_id };

  if (day) {
    dbQuery.day = day.toLowerCase();  // Ensure day in query is lowercase
  }

  try {
    const preferences = await StylistAvailabilityPreference.find(dbQuery)
      .sort({ day: 1, start_time: 1 });

    // Initialize availability with lowercase days of the week
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const availability = daysOfWeek.map(dayName => ({ day: dayName, slots: [] }));

    preferences.forEach(slot => {
      const dayEntry = availability.find(entry => entry.day === slot.day.toLowerCase());
      if (dayEntry) {
        dayEntry.slots.push({
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
      }
    });

    availability.forEach(day => {
      day.slots.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.start_time}Z`);
        const timeB = new Date(`1970-01-01T${b.start_time}Z`);
        return timeA - timeB;
      });
    });

    res.status(200).json({ success: true, stylist_id, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
exports.getAvailableTimeSlot = catchAsyncError(async (req, res, next) => {
  try {
    let { requested_date, city,gender } = req.query
    if (!requested_date  || !city) {
      return res.status(400).send("Required requested_date, state")
    }
    let requiredState=1
    const customer_id = req.user._id

    const store_id = req.params.store_id
    if(store_id){
      let carts = await Cart.find({ customer_id, created_by: "customer", is_selected: true })
      .populate({
        path: 'product_id',
        match: { store_id: store_id }
      });
    if (carts.length > 0) {
      carts = carts.filter(cart => cart.product_id !== null);
      requiredState = categorizeProducts(carts)
    }
    }else if(gender){
      requiredState=gender=='male'||gender=="men"?1:2 
    }

    const seperateDate = requested_date.split("T")[0]
    const dayName = new Date(seperateDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    requested_date = new Date(requested_date)
    let requested_next_date = new Date(requested_date)
    requested_next_date.setDate(requested_next_date.getDate() + 1);
    const userQuery = { role: 'stylish', working_locations: city };
    const [timeSlots, stylistPreferences, unavailableStylists, existingAppointments, users] = await Promise.all([
      TimeSlot.find().select('start_time end_time'),
      StylistAvailabilityPreference.find({ day: dayName }).select('stylist_id day start_time end_time'),
      StylistUnavailability.find({
        date: {
          $gte: requested_date,
          $lte: requested_next_date
        }
      }).select('stylist_id start_time end_time'),
      StylistAppointment.find({
        appointment_date: {
          $gte: requested_date,
          $lte: requested_next_date
        }
      }).select('start_time end_time stylist_id'),
      User.find(userQuery).select('_id gender role'),
    ]);
    const stylistIds = users.map(user => user._id.toString());
    // Filter stylist preferences based on the stylist IDs
    const stylistPreferenceMap = stylistPreferences
      .filter(preference => stylistIds.includes(preference.stylist_id.toString()))
      .reduce((acc, pref) => {
        if (!acc[pref.stylist_id]) acc[pref.stylist_id] = [];
        acc[pref.stylist_id].push({ start_time: pref.start_time, end_time: pref.end_time });
        return acc;
      }, {});

    // Collect unavailable and appointment times for stylists
    const unavailableMap = unavailableStylists.reduce((acc, { stylist_id, start_time, end_time }) => {
      if (!acc[stylist_id]) acc[stylist_id] = [];
      acc[stylist_id].push({ start_time: start_time, end_time: end_time });
      return acc;
    }, {});

    const appointmentMap = existingAppointments.reduce((acc, { stylist_id, start_time, end_time }) => {
      if (!acc[stylist_id]) acc[stylist_id] = [];
      acc[stylist_id].push({ start_time, end_time });
      return acc;
    }, {});

    // Initialize all time slots with availability status and list of stylists
    const availableSlots = timeSlots.map(({ start_time, end_time }) => {
      const maleStylists = [];
      const femaleStylists = [];
      const availableStylists = [];
      const seperateStartTime = start_time.toISOString().split('T')[1]
      const seperateEndTime = end_time.toISOString().split('T')[1]
      const joinedupdateStartTime = seperateDate + "T" + seperateStartTime
      const joinedupdateEndTime = seperateDate + "T" + seperateEndTime
      for (const user of users) {
        const userId = user._id.toString();
        // Check stylist preference
        const hasPreference = stylistPreferenceMap[userId]?.some(pref =>
          pref.start_time <= start_time && pref.end_time >= end_time
        );
        const selectedStartTime = new Date(joinedupdateStartTime)
        const selectedEndTime = new Date(joinedupdateEndTime)
        // Check stylist unavailability
        const isUnavailable = unavailableMap[userId]?.some(unavail => {
          const result =
            (selectedStartTime >= unavail.start_time && selectedStartTime < unavail.end_time) ||
            (selectedEndTime > unavail.start_time && selectedEndTime <= unavail.end_time)
          return result
        }
        );
        // Check existing appointments

        const hasAppointment = appointmentMap[userId]?.some(appt =>
          (selectedStartTime >= appt.start_time && selectedStartTime < appt.end_time) ||
          (selectedEndTime > appt.start_time && selectedEndTime <= appt.end_time)
        );
        // Add stylist to the respective gender list if they are available
        if (hasPreference && !isUnavailable && !hasAppointment) {
          if (user.gender === 'male') maleStylists.push(user);
          if (user.gender === 'female') femaleStylists.push(user);
        }
      }

      // Populate `availableStylists` based on `requiredState`
      if (requiredState == 1 && maleStylists.length > 0) {
        availableStylists.push(maleStylists[0]); // Only one male stylist
      } else if (requiredState == 2 && femaleStylists.length > 0) {
        availableStylists.push(femaleStylists[0]); // Only one female stylist
      } else if (requiredState == 3 && maleStylists.length > 0 && femaleStylists.length > 0) {
        availableStylists.push(maleStylists[0]); // One male stylist
        availableStylists.push(femaleStylists[0]); // One female stylist
      }

      return {
        start_time,
        end_time,
        available: availableStylists.length > 0,
        availableStylists: availableStylists,
      };
    });

    res.status(200).json({
      message: 'Available slots retrieved successfully',
      slots: availableSlots,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving available slots', success: false });
  }
});
exports.createTimeSlot = catchAsyncError(async (req, res) => {
  const { start_time, end_time } = req.body;

  // Ensure both start_time and end_time are provided
  if (!start_time || !end_time) {
    return res.status(400).send({ error: 'Start time and end time are required' });
  }

  try {
    // Parse start_time and end_time into Date objects
    let startDate = new Date(start_time);
    let endDate = new Date(end_time);

    // Validate that the provided times are valid Date objects
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send({ error: 'Invalid date format. Provide ISO strings or valid date formats.' });
    }
    startDate = normalizeToStandardGMT(startDate)
    endDate = normalizeToStandardGMT(endDate)

    // Ensure the start time is before the end time
    if (startDate >= endDate) {
      return res.status(400).send({ error: 'Start time must be before end time' });
    }

    // Check if the time slot already exists
    const alreadyExist = await TimeSlot.findOne({ start_time: startDate, end_time: endDate });
    if (alreadyExist) {
      return res.status(409).send({ message: 'Time slot already exists', success: false });
    }


    // Create a new time slot
    const newTimeSlot = new TimeSlot({ start_time: startDate, end_time: endDate });
    await newTimeSlot.save();

    return res.status(201).send({ message: 'Time slot added', timeSlot: newTimeSlot });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});
exports.getAllTimeSlots = catchAsyncError(async (req, res) => {
  try {
    const slots = await TimeSlot.find().sort({ start_time_obj: 1 });
    return res.status(200).send({ timeSlots: slots, });
  } catch (error) {
    console.error('Error retrieving time slots:', error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});
exports.updateTimeSlot = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time } = req.body;
  const timeFormat = /^(0?[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;
  if (!start_time || !end_time) {
    return res.status(400).send({ error: 'Start time and end time are required' });
  }
  if (!timeFormat.test(start_time) || !timeFormat.test(end_time)) {
    return res.status(400).send({ error: 'Invalid time format. Use "HH:mm AM/PM"' });
  }
  try {
    const alreadyExist = await TimeSlot.findOne({ start_time, end_time })
    if (alreadyExist) {
      return res.status(402).send({ message: "Already Exist", success: false })
    }
    const startDate = normalizeToStandardGMT(start_time);
    const endDate = normalizeToStandardGMT(end_time);
    if (startDate >= endDate) {
      return res.status(400).send({ error: 'Start time must be before end time' });
    }

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      id,
      { start_time, end_time },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).send({ error: 'Time slot not found' });
    }

    return res.status(200).send({ message: 'Time slot updated', timeSlot: updatedSlot });
  } catch (error) {
    console.error('Error updating time slot:', error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});
exports.deleteTimeSlot = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSlot = await TimeSlot.findByIdAndDelete(id);

    if (!deletedSlot) {
      return res.status(404).send({ error: 'Time slot not found' });
    }

    return res.status(200).send({ message: 'Time slot deleted' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});
