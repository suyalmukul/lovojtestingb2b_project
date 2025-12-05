const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the SuperadminColors schema
const SuperadminColorSchema = new Schema({
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

const SuperadminColor = mongoose.model('SuperadminColor', SuperadminColorSchema);

// Define the SuperadminFont schema
const SuperadminFontSchema = new Schema({
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

const SuperadminFont = mongoose.model('SuperadminFont', SuperadminFontSchema);



// Export all models
module.exports = {
    SuperadminColor,
    SuperadminFont,
};
