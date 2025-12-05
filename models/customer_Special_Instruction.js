/*********************** */
const mongoose = require('mongoose');

const specialInstructionSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required'],
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  orderNumber: {
    type:String,
    // required: true,
  },
  products: [
    {
      productId: {
      type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
        required: true,
      },
      // measurementId: {
      //   type: mongoose.Schema.Types.ObjectId,
      // },
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

const CustomerSplInstruction = mongoose.model('CustomerSpacialInstruction', specialInstructionSchema);

module.exports = CustomerSplInstruction;




