// const mongoose = require('mongoose');

// const contrastSchema = new mongoose.Schema({
//   storeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     // ref: 'User',
//     // required: [true, 'Store ID is required']
//   },


//   products: [
//     {
//       name: {
//         type: String,
//         required: true,
//       },
//       Fonts:{
//         type:Array
//       }
//     }
//   ],
//   timestamps: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const CustomerContrast = mongoose.model('CustomerContrast', contrastSchema);

// module.exports = CustomerContrast;



const mongoose = require('mongoose');

const fontSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'Store ID is required']
  },
      Fonts:{
        type:Array
      },
}, { timestamps: true });

const Font = mongoose.model('Font', fontSchema);

module.exports = Font;