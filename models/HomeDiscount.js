const mongoose = require("mongoose");

const HomeDiscountSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fabAddName: {
    type: String,
  },
  fabAddImage: {
    type: String,
  },
  fabAddDiscount: {
    type: String,
  },
  fabAddDescription: {
    type: String,
  },
  fabAddCode: {
    type: String,
  },
  storeNumber: {
    type: String,
    required: true,
  },
  flag:{
    type: Boolean,
    default:false,
  },
}, { timestamps: true });

const  HomeDiscount= mongoose.model("homeDiscount", HomeDiscountSchema);

module.exports = HomeDiscount;