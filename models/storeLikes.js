// storeRating.js
const mongoose = require("mongoose");

const storeLikeSchema = mongoose.Schema({

      storeId : {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'stores'
      },
      userLikes: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          name: String,
          email: mongoose.SchemaTypes.Email,
        },
      ],
      totalLike: {
        type: Number,
        default: 0,
      },
      email: {
        type: mongoose.SchemaTypes.Email,
      },
      name: {
        type: String,
      },
}, { timestamps: true });

module.exports = mongoose.model("StoreLike", storeLikeSchema);




// const mongoose = require("mongoose");
// const moment = require("moment"); // Import moment package

// const storeLikeSchema = mongoose.Schema({
//   storeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'stores'
//   },
//   userLikes: [
//     {
//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//       },
//       name: String,
//       email: mongoose.SchemaTypes.Email,
//     },
//   ],
//   totalLike: {
//     type: Number,
//     default: 0,
//   },
//   email: {
//     type: mongoose.SchemaTypes.Email,
//   },
//   name: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: () => moment().toDate(), // Set the default value to the current date and time using moment
//   },
// });

// module.exports = mongoose.model("StoreLike", storeLikeSchema);
