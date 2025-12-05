const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the SuperadminButton schema
const SuperadminButtonSchema = new Schema({
  name: {
    type: String,
  },
  Buttons: [
    {
      name: {
        type: String,
        required: true,
      },
      buttonImage: {
        type: String,
        required: [true, 'Image is required'],
      },
    },
  ],
}, {
  timestamps: true,
});

const SuperadminButton = mongoose.model('SuperadminButton', SuperadminButtonSchema);

// Define the SuperadminButtonHole schema
const SuperadminButtonHoleSchema = new Schema({
  name: {
    type: String,
  },
  ButtonHoles: [
    {
      name: {
        type: String,
        required: true,
      },
      buttonHolecode: {
        type: String,
      },
      buttonHoleImage: {
        type: String,
        // required: [true, 'Image is required'],
      },
    },
  ],
}, {
  timestamps: true,
});

const SuperadminButtonHole = mongoose.model('SuperadminButtonHole', SuperadminButtonHoleSchema);

// Define the SuperadminButtonThread schema
const SuperadminButtonThreadSchema = new Schema({
  name: {
    type: String,
  },
  ButtonThreads: [
    {
      name: {
        type: String,
        required: true,
      },
      buttonThreadcode: {
        type: String,
      },
      buttonThreadImage: {
        type: String,
        // required: [true, 'Image is required'],
      },
    },
  ],
}, {
  timestamps: true,
});

const SuperadminButtonThread = mongoose.model('SuperadminButtonThread', SuperadminButtonThreadSchema);

// Export all models
module.exports = {
  SuperadminButton,
  SuperadminButtonHole,
  SuperadminButtonThread,
};
