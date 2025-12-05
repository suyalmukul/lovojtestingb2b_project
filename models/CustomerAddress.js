const mongoose = require("mongoose");

const customer_addressesSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "onlinecustomers",
    required: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  mobile_number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: null,
  },
  address_1: {
    type: String,
    required: true,
  },
  address_2: {
    type: String,
  },
  address_3: {
    type: String,
  },
  landmark: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  city_name: {
    type: String,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "india",
  },
  default_address: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

module.exports = mongoose.model("customer_addresses", customer_addressesSchema);
