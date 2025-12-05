const mongoose = require('mongoose');

const ColorThreadSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'Store ID is required']
  },
  // ColorsThread:{
  //       type:Array
  //     },
  ColorsThread: {
    type: [
      {
        colorThreadName: {
          type: String,
          required: true,
        },
        colorThreadCode: {
          type: String,
          required: true,
        },
      },
    ],
  },
}, { timestamps: true });

const ColorThread = mongoose.model('ColorThread', ColorThreadSchema);

module.exports = ColorThread;

