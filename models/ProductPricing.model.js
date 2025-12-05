const mongoose = require("mongoose");

const ProductPricingSchema = new mongoose.Schema({
  product_category: { type: String, required: true },
  name: { type: String, required: true },
  price_range: { type: String, default: "" },
  note: { type: String, default: "" },
  image_url: { type: String, default: "" },
  gender:{type:String,default:""}
});

const ProductPricing = mongoose.model("ProductPricing", ProductPricingSchema);
module.exports = ProductPricing;
