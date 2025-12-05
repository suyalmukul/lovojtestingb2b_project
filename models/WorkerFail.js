const mongoose = require("mongoose");

const WorkerFailSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workers",
      required: [true, "store ID is required"],
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workers",
      required: [true, "Workers ID is required"],
    },
    type: {
      type: String,
      enum: ['Offline', 'Online']
    },
    orderStatus: { type: Boolean, default: false },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    orderId: { type:mongoose.Schema.Types.ObjectId },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    productNumber: {
      type: String,
    },
    problem: {
      type: Boolean,
      default: false,
    },
    role: { type: String },
    
    problemStatements: [{
      notFound: {
        type: Boolean,
        default: false,
      },
      notEnough: {
        type: Boolean,
        default: false,
      },
      quantity: {
        type: Number,
      },
      Other: {
        type: Boolean,
        default: false,
      },
      voicerecording: {
        type: String,
      },
}],
  },
  {
    timestamps: true,
  }
);

const WorkerFail = mongoose.model(
  "WorkerFail",
  WorkerFailSchema
);

module.exports = WorkerFail;
