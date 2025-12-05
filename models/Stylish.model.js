const mongoose = require("mongoose");

const SylishLogsSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stores",
      // required: [true, "store ID is required"],
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workers",
      // required: [true, "Workers ID is required"],
    },
    type: {
      type: String,
      enum: ['InPerson', 'Online']
    },
    orderStatus: { type: Boolean, default: false },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    orderId: { type:mongoose.Schema.Types.ObjectId },
    orderNumber: { type: String },
    appointmentId: { type: mongoose.Schema.Types.ObjectId },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const StylishLogs = mongoose.model(
  "StylishLogs",
  SylishLogsSchema
);

module.exports = StylishLogs;
