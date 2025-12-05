const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  subcategory: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const categoryItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subcategories: [subcategorySchema], // Array of subcategories
});

const CategoryItem = mongoose.model('CategoryItem', categoryItemSchema);

module.exports = CategoryItem;
