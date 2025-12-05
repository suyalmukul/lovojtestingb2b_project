const mongoose = require("mongoose");

const SpecialInstructionSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: [String], 
      default: [],
    },
    notes: {
      type: [String],
      default: [],
    },
    voice: {
      type: [String],
      default: [],
    },
    hand_notes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const SpecialInstruction = mongoose.model("SpecialInstruction", SpecialInstructionSchema);

module.exports = SpecialInstruction;
