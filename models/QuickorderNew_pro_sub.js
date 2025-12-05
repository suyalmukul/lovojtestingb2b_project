const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const SuperadminProductSchema = new Schema({
//   storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },

  name: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
  },
  productNumber:{
    type: String,
  },
  gender: {
    name: {
      type: String,
      enum: ['Men', 'Women', 'Other'],
      required: true,
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
        },
        subcategories: [
          {
            name: {
              type: String,
              required: true,
            },
            subCatImage: {
                type : String,
            //   type: Array,
              required: [true, 'subcategory image is required'],
            },
            subCatNumber: {
              type: String,
            },
            styles: [
              {
                catStyleName: {
                  type: String,
                  required: true,
                },
                catStyleNumber: {
                  type: String,
                  required: true,
                },
                styleImage: {
                    // type : Array,
                  type: String,
                  required: [true, 'Style image is required'],
                },
                flag: {
                  type: Boolean,
                  default: false,
                },
              },
            ],
          }, 
        ],
      },
    ],
  },
},
{
  timestamps: true, // Adds createdAt and updatedAt automatically
});



// Create a model based on the schema
const SuperadminProduct = mongoose.model('SuperadminProduct', SuperadminProductSchema);

module.exports = SuperadminProduct;
