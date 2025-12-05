const mongoose = require("mongoose");

const ProductShippingSchema = new mongoose.Schema({
  product_category: { type: String, required: true },
  name: { type: String, required: true },
  shipping_time: { type: String, default: "" },
  note: { type: String, default: "" },
  image_url: { type: String, default: "" },
  gender:{type:String,default:""}
});

const ProductShipping = mongoose.model("ProductShipping", ProductShippingSchema);
module.exports = ProductShipping;
