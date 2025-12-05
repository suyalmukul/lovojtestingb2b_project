const mongoose = require('mongoose');

const CategoriesImagesSchema = new mongoose.Schema({
  category: {
    type: 'string',
    enum: ['Designer', 'Fabric', 'Factory', 'Accessories'],
    required: true,
  },
  subtitle:{
    type:String,
    required:true
  },
  fabricProfileImage: {
    type: String,
    // required: true,
  },
  titleImages: { type: String },
  Images: {
    type: 'array',
  },
  // titleImages: { type: String },
}, { timestamps: true });
const CategoriesImages = mongoose.model('CategoriesImages', CategoriesImagesSchema);
module.exports = {
  CategoriesImages
}