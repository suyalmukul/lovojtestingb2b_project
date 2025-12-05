// const mongoose = require('mongoose');

// // Define the schema
// const Schema = mongoose.Schema;

// // Define the subProduct schema
// const SubProductSchema = new Schema({
//   product: {
//     type: Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true,
//   },
//   category: {
//     type: Schema.Types.ObjectId,
//     ref: 'Product.categories', 
//     required: true,
//   },
//   subcategory: {
//     type: Schema.Types.ObjectId,
//     ref: 'Product.categories.subcategories',
//     required: true,
//   },
//   styles: [
//     {
//       catStyleName: {
//         type: String,
//         required: true, 
//       },
//       catStyleNumber: {
//         type: String,
//         required: true, 
//       },
//       styleImage: {
//         type: String,
//         required: [true, 'Style image is required'],
//       },
//       flag:{
//         type:Boolean,
//         default:false
//       },
//       storesIdentities:{
//         type:Array,
//         default:[],
//       },
//     },
//   ],
// });

// const SubProduct = mongoose.model('SubProduct', SubProductSchema);

// module.exports = SubProduct;




const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the subProduct schema
const SubProductSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Product.categories', 
    required: true,
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'Product.categories.subcategories',
    required: true,
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
        type: String,
        required: [true, 'Style image is required'],
      },
      flag:{
        type:Boolean,
        default:false
      },
      storesIdentities:{
        type:Array,
        default:[],
      },

      /*******************/


      storesIdentifier: {
        type: [
          {
            storeId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "stores",
            },
            storeflag: {
                type: Boolean,
                default:false
            },
          },
        ],
      },
    


      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stores",
      },
      
    },
  ],
},
{
  timestamps: true, // Adds createdAt and updatedAt automatically
});

const SubProduct = mongoose.model('SubProduct', SubProductSchema);

module.exports = SubProduct;
