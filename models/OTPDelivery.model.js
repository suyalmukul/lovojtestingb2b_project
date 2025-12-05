const mongoose = require('mongoose');

const OTPDeliverySchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    // enum: ['startOtp', 'endOtp']
  },
  otp: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
}, {
  timestamps : true,
});

const OTPDelivery = mongoose.model('OTPDelivery', OTPDeliverySchema);

module.exports = OTPDelivery;
