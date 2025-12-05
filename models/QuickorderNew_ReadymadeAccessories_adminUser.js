const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminReadymadeAccessoriesSchemaForUser = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  storeType: {
    type: String,
  },
  seen:{
    type:Boolean,
    default: false,
  },
  gender: {
    type: String,
    // enum: ['Men', 'Women', 'Other'],
    // required: true,
  },
  accessorieType: {
    type: String,
    // required: true,
  },

  productName: {
    type: String,
    // required: true,
  },
  accessoriesNumber: {
    type: String,
    // required: true,
  },
  accessoriesPrice: {
    type: Number,
    // required: true,
  },
  ReadymadeAccessoriesImage: {
    type: Array,
    // required: true,
  },
  Quantity: {
    type: Number,
  },
  HSN_SAC_Code: {
    type: String,
    // required: true,
  },
  accessoriesColor: {
    type: Array,
  },
  accessoriesDiscount: {
    type: Number,
  },
  Product_Description: {
    type: String,
    // required: true,
  }
},
{
  timestamps: true,
});

const AdminReadymadeAccessoriesForUser = mongoose.model('AdminReadymadeAccessoriesForUser', AdminReadymadeAccessoriesSchemaForUser);

module.exports = AdminReadymadeAccessoriesForUser;