const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const ProductMakingChargesSchemaForUser = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  genderName: {
    type: String,
    enum: ['Men', 'Women', 'Other'],
  },
//   productNumber: {
//     type: String,
//   },
  productName:  {
        type: String,
        required: true,
      },
      productImage: {
        type: String,
      },
    //   discription: {
    //     type: String,
    //   },
    // productMakingPrice: {
    //     type: Array,
    //   },
    // productMakingTime: {
    //     type: String,
    // },
    PlanPriceAndTime: [{
      name: { type:String },
      price: { type: String },
      time: { type: String },
    }],
},
{
  timestamps: true,
});

// Create a model based on the schema
const ProductMakingCharges = mongoose.model('ProductMakingCharges', ProductMakingChargesSchemaForUser);

module.exports = ProductMakingCharges;
