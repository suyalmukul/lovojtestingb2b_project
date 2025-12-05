const mongoose = require("mongoose");

const mesurmentProductSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Store ID is required"],
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  // orderNumber: {
  //   type: Number,
  //   required: true,
  // },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
        required: true,
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
  timestamps: {
    type: Date,
    default: Date.now,
  },
},{
  timestamps: true,
});

const CustomerMesurmentOnline = mongoose.model(
  "CustomerMesurmentOnline",
  mesurmentProductSchema
);

module.exports = CustomerMesurmentOnline;
