// const mongoose = require('mongoose');

// const ColorSchema = new mongoose.Schema({
//   storeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     // required: [true, 'Store ID is required']
//   },
//       Colors:{
//         type:Array
//       },

//   timestamps: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Color = mongoose.model('Color', ColorSchema);

// module.exports = Color;





const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'Store ID is required']
  },
  Colors: {
    type: [
      {
        colorName: {
          type: String,
          required: true,
        },
        colorCode: {
          type: String,
          required: true,
        },
      },
    ],
  },
}, { timestamps: true });

const Color = mongoose.model('Color', ColorSchema);

module.exports = Color;

