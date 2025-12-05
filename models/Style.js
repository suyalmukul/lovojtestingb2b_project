const mongoose = require('mongoose');

const StyleSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
},
{ timestamps: true}
);

module.exports = mongoose.model('Style', StyleSchema);
