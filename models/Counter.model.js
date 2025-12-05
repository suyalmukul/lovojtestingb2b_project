const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: String, // The name of the counter (e.g., "order")
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports= Counter