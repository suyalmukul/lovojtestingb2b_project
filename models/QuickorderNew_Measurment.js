const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const SuperadminMesurmentSchema = new Schema({
//   storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women'],
    required: true,
  },
  categoriename: {
    type: String,
    required: true,
   },
    measurements: [
        {
          name: {
            type: String,
            required: true,
          },
          mesurmentImage: {
            type: String,
            required: [true, 'Fabric image is required'],
          },
          mesurmentNumber: {
            type: String,
          },

        },
      ],
}, {
  timestamps: true,
});

// Create a model based on the schema
const SuperadminMesurment = mongoose.model('SuperadminMesurment', SuperadminMesurmentSchema);

module.exports = SuperadminMesurment;
