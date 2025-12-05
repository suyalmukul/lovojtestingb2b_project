
// const mongoose = require('mongoose');

// // Define the schema
// const Schema = mongoose.Schema;

// // Define the product schema
// const ButtonHoleSchema = new Schema({

// name: {
// type: String,
// required: true,
// },

// categories: [
// {
// name: {
// type: String,
// required: true,
// },
// ButtonHoles: [
// {
// name: {
// type: String,
// required: true,
// },
// buttonHoleImage: {
// type: String,
// required: [true, 'Fabric image is required'],
// },
// },
// ],
// },
// ],
// }, {
// timestamps: true, // Adds createdAt and updatedAt automatically
// });

// // Create a model based on the schema
// const ButtonHole = mongoose.model('Button',ButtonHoleSchema);

// module.exports =ButtonHole;




const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const ButtonHoleSchema = new Schema({

  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'Store ID is required']
    },

  name: {
    type: String,
    required: true,
  },
  categories: [
    {
      name: {
        type: String,
        // default: "AllBodyButtonHole",
        required: true,
      },
      Buttons: [
        {
          name: {
            type: String,
            required: true,
          },
          buttonHoleImage: {
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
const ButtonHole = mongoose.model('ButtonHole', ButtonHoleSchema);

module.exports = ButtonHole;

