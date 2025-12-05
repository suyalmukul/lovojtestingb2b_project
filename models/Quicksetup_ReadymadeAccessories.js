const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminReadymadeAccessoriesSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Other'],
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  accessoriesNumber: {
    type: String,
    required: true,
  },
  accessoriesPrice: {
    type: Number,
    required: true,
  },
  ReadymadeAccessoriesImage: {
    type: Array,
    required: true,
  },
  Quantity: {
    type: Number,
  },
  HSN_SAC_Code: {
    type: String,
    required: true,
  },
  Product_Description: {
    type: String,
    required: true,
  }
},
{
  timestamps: true,
});

const AdminReadymadeAccessories = mongoose.model('AdminReadymadeAccessories', AdminReadymadeAccessoriesSchema);

module.exports = AdminReadymadeAccessories;
