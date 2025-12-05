const mongoose = require("mongoose");

const WorkerLogsSchema = new mongoose.Schema(
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
    workVideo: {
      type: String,
    },
    workPhoto: {
      type: String,
    },
    type: {
      type: String,
      enum: ['Offline', 'Online']
    },
    orderStatus: { type: Boolean, default: false },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId },
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
    qcLog: {
      productCheckStatus: Boolean,
      reAlign: {
        masterTailorName : String,
        masterTailorId : {
          type: mongoose.Schema.Types.ObjectId,
        }, 
        role: String,
        reverted : {
          type: Boolean,
          default: false,
        }
      },
      styles: [
        {
          styleName: {
            type: String,
          },
          qcCheck: {
            type: Boolean,
          },
        }
      ],
      mesurments: [
        {
          mesurmentName: {
            type: String,
          },
          qcCheck: {
            type: Boolean,
          },
        },
      ],
      contrastStyles: [
        {
          styleName: {
            type: String,
          },
          qcCheck: {
            type: Boolean,
          },
        }
      ],
      stylesPercentage: {
        type: String,
      },
      measurementsPercentage: {
        type: String,
      },
      contrastStylesPercentage: {
        type: String,
      },
      overallPercentage: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
  );
  
  const WorkerLogs = mongoose.model(
    "WorkerLogs",
    WorkerLogsSchema
    );
    
    module.exports = WorkerLogs;
    