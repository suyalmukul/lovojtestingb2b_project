const mongoose = require('mongoose');

const OTPStylishSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['startOtp', 'endOtp']
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

const OTPStylish = mongoose.model('OTPStylish', OTPStylishSchema);

module.exports = OTPStylish;
