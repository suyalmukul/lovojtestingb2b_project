const { promises } = require('fs');
const mongoose = require('mongoose');
const MeasurementSchema = new mongoose.Schema({
  // id: { type: String, unique: true, required: true }, // Primary Key
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, required: true }, // chest/sleeves
  value: { type: String, default: "" },
  unit: { type: String, enum: ['inch', 'cm'], required: true },
  image_url: { type: String },
  alt1: { type: String ,default: ""},
  alt2: { type: String ,default: ""},
  voice_notes:[{type:String}],
  ready_made:{type:String},
  context: { type: String, enum: ['product', 'body'], required: true } // product measurement or body measurement
},
  { timestamps: true }
);

module.exports = mongoose.model('Measurement', MeasurementSchema);
