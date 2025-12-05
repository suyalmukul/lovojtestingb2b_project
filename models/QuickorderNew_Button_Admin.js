const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the SuperadminButton schema
const AdminButtonSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
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

const AdminButton = mongoose.model('AdminButton', AdminButtonSchema);

// Define the SuperadminButtonHole schema
const AdminButtonHoleSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
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

const AdminButtonHole = mongoose.model('AdminButtonHole', AdminButtonHoleSchema);

// Define the SuperadminButtonThread schema
const AdminButtonThreadSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
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

const AdminButtonThread = mongoose.model('AdminButtonThread', AdminButtonThreadSchema);

// Export all models
module.exports = {
    AdminButton,
    AdminButtonHole,
    AdminButtonThread,
};
