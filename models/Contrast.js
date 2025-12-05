const mongoose = require('mongoose');
const ContrastSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    tile_x: { type: Number },
    tile_y: { type: Number },
    rotation: { type: Number },
    glossy: { type: Boolean },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    image_url: { type: String },
    fabric_image_url: { type: String },
    fabric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FabricsForSuperadmin', required: true }
  },
  { timestamps: true}
  );
  
  module.exports = mongoose.model('Contrast', ContrastSchema);
  