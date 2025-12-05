const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
  {
    mobileNumber: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    otp_key: {
      type: String,
      required: true,
    },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'orders',},
    //678794b1ccabb6ad369be552
    used: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("otp", tokenSchema);
