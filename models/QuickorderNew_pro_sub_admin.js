const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const AdminProductSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  ownFlag:{
    type:Boolean,
    default:false,
  },

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
  timestamps: true,
});



// Create a model based on the schema
const AdminProduct = mongoose.model('AdminProduct', AdminProductSchema);

module.exports = AdminProduct;
