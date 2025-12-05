// storeRating.js
const mongoose = require("mongoose");

const storeRatingSchema = mongoose.Schema({
//   storeId: { type: String, required: [true, "Store ID is required"] },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: String, required: [true, "Rating is required"], min: 1, max: 5 },
  comment: { type: String, required: false },
  email: {
    type: mongoose.SchemaTypes.Email,
  },
  name: { type: String, },
  
}, { timestamps: true });

module.exports = mongoose.model("StoreRating", storeRatingSchema);
