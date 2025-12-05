const { default: mongoose } = require("mongoose");
// require("./AdminProductForUser.model");

const ProductSchema = new mongoose.Schema({
  fabric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FabricsForSuperadmin' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  gender: { type: String, enum: ['men', 'women', 'unisex'], required: true },
  type: { type: String, enum: ['customize', 'ready-made'], required: true },
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'stores' },
  category_id: { type: mongoose.Schema.Types.ObjectId,ref:"AdminProductForUser" },
  product_image_url: [{
    name: { type: String, required: true },
    url: { type: String, required: true }
  }],
  fabric_quantity: { type: Number, default: 1 },
  unit: { type: String, default: "mtr"}


},{timestamps:true});


module.exports = mongoose.model('Product', ProductSchema);