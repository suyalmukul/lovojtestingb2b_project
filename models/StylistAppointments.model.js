const mongoose = require('mongoose');


const stylistAppointmentSchema = new mongoose.Schema({
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  stylist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnlineCustomers',
    required: true
  },
  appointment_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['unassigned', 'pending', 'started', "reached", 'cancelled', 'completed']
  },
  notification_status: {
    type: Number
  },
  note: {
    type: String,
  },
  location: {
    type: {
      type: String, // 'Point' is required for GeoJSON data
      enum: ['Point'],
      default: "Point",
      required: true
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: true
    }
  },
  address_id: {
    type: mongoose.Types.ObjectId,
    ref: "customer_addresses",
  },
  order_id: {
    type: mongoose.Types.ObjectId,
    ref: "Order",
    default: null
  },
  type: {
    type: String,
    default: "measurement"
  }
}, { timestamps: true });

stylistAppointmentSchema.index({ location: '2dsphere' });
stylistAppointmentSchema.index({ appointment_date: 1, stylistId: 1 });


const StylistAppointment = mongoose.model('StylistAppointment', stylistAppointmentSchema);
module.exports = StylistAppointment;