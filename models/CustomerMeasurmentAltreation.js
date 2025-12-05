const mongoose = require("mongoose");


const mesurmentProductAlterationSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Store ID is required"],
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      MeasurmentType: {
        type: String,
      },
      MeasurmentVoiceRecording: {
        type: String,
      },
      MeasurmentSizePreference: {
        type: String,
      },
      name: {
        type: String,
      },
      mesurments: [
        {
          mesurmentName: {
            type: String,
          },
          mesurmentNumber: {
            type: String,
          },
          mesurmentImage: {
            type: String,
          },
          customerOwnMeasurmentImage: {
            type: String,
          },
          size: {
            type: String,
          },
          alt1: {
            type: String,
          },
          alt2: {
            type: String,
          },
        },
      ],
    },
  ],
},{
  timestamps: true,
});

const CustomerMesurmentAlteration = mongoose.model(
  "CustomerMesurmentAlteration",
  mesurmentProductAlterationSchema
);

module.exports = CustomerMesurmentAlteration;






