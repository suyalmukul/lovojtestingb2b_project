const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the SuperadminColors schema
const AdminColorSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  name: {
    type: String,
  },
  Colors: [
    {
      name: {
        type: String,
        required: true,
      },
      colorCode: {
        type: String,
      },
      colorImage: {
        type: String,
        // required: [true, 'Image is required'],
      },
    },
  ],
}, {
  timestamps: true,
});

const AdminColor = mongoose.model('AdminColor', AdminColorSchema);

// Define the SuperadminFont schema
const AdminFontSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  name: {
    type: String,
  },
  Fonts: [
    {
      name: {
        type: String,
        required: true,
      },
      fontCode: {
        type: String,
      },
      fontImage: {
        type: String,
        // required: [true, 'Image is required'],
      },
    },
  ],
}, {
  timestamps: true,
});

const AdminFont = mongoose.model('AdminFont', AdminFontSchema);



// Export all models
module.exports = {
    AdminColor,
    AdminFont,
};
