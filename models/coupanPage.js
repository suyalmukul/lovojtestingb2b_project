const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CouponSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },

  CouponName: {
    type: String,
    required: true,
  },
  PrecentageAmount: {
    type: String,
    // required: true,
  },
  PriceAmount: {
    type: String,
    // required: true,
  },
  ValidiyFrom: {
    type: Date,
    // required: true,
  },
  ValidiyTo: {
    type: Date,
    // required: true,
  },

  totalCoupon: {
    type: Number,
    // required: true,
  },
  remainingCoupon: {
    type: Number,
    // required: true,
  },

  CategoryType: {
    type: String,
    // required: true,
  },

  ProductType: {
    type: String,
    // required: true,
  },
  applicablePrice:{
    type:Number,
  },

  cuponCode: {
    type: String,
  },

}, {
  timestamps: true,
});

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;
