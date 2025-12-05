const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("mongoose-type-email");


const schema = mongoose.Schema(
  {
    storeId: { type: String },
    storeNumber: { type: String },
    storeName:{type:String},
    storeImage:{type:String},
    // flag: {type: Boolean,},
    lovojShorts :{ type:Array },
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
    userRatings: [
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
    averageRating: {
      type: String,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    showShorts:{
      type:Boolean,
      default:false
    },
    description:{type:String}

  },
  { timestamps: true }
);

module.exports = mongoose.model("LovojShort", schema);





