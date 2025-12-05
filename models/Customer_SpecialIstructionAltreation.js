/*********************** */

const mongoose = require('mongoose');

const specialInstructionAltreationSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required'],
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  products: [
    {
      productId: {
      type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
        // required: true,
      },
      specialInstructions: [
        {
          instructionPhoto: {
            type: Array,
          },
          instructionNotes: {
            type: Array,
          },
          instructionVoice: {
            type: Array,
          },
          instructionHandNotes: {
            type: Array,
          },
        },
      ],
    },
  ],
}, { timestamps: true });

const CustomerSpacialInstructionAltreation = mongoose.model('CustomerSpacialInstructionAltreation', specialInstructionAltreationSchema);

module.exports = CustomerSpacialInstructionAltreation;
