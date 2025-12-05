const { required } = require("joi");
const mongoose = require("mongoose");

const customDesignSchema = new mongoose.Schema(
  {
    customDesignId: {
      type: String,
      required: [true, "CustomDesignId is required"],
    },
    link: { type: String },
    gender: {
      type: String,
      enum: ['men', 'women'],
    },
    productCategory: {type: String},
    step: {
      type: String,
      // required: [true, "Step is required"]
    },
    uploadDesigns: [
      {
        front: {
          type: Array,
        },
        back: {
          type: Array,
        },
        side: {
          type: Array,
        },
        others: {
          type: Array,
        },
      },
    ],
    fabricChoice: {
      type: String,
      // enum: ['Same', 'Different','DoesntMatter'],
    },
    fabricForDesigner: {
      type: Boolean,
    },

    fabricPreference: {
      type: String,
    },


  },
  {
    // timestamps: true,
    timestamps: { createdAt: true, updatedAt: true },
  }
);


const CustomDesign = mongoose.model(
  "CustomDesign",
  customDesignSchema
);

module.exports = CustomDesign;
