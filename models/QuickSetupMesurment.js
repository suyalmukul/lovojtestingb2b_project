const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const MesurmentSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women'],
    required: true,
  },
  categories: [
    {
      name: {
        type: String,
        required: true,
      },
      mesurments: [
        {
          name: {
            type: String,
            required: true,
          },
          mesurmentImage: {
            type: String,
            required: [true, 'Fabric image is required'],
          },
        },
      ],
    },
  ],
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Create a model based on the schema
const Mesurment = mongoose.model('Mesurment', MesurmentSchema);

module.exports = Mesurment;
