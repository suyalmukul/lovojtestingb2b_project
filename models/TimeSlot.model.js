const mongoose = require("mongoose");
// Schema definition
const timeSlotSchema = new mongoose.Schema(
    {
      start_time: {
        type: Date, // Use Date type to store timestamps
        required: true,
      },
      end_time: {
        type: Date, // Use Date type to store timestamps
        required: true,
      },
    },
    {
      timestamps: true, // Automatically track creation and update times
    }
  );


timeSlotSchema.pre('save', function (next) {
    if (this.isModified('start_time') || this.isModified('end_time')) {
      // Ensure the start time is always before the end time
      if (this.start_time >= this.end_time) {
        return next(new Error("Start time must be before end time"));
      }
    }
    next();
  });
const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
module.exports= TimeSlot