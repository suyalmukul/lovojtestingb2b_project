const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CustomerReadymadeAccessoriesSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  customerId: { type: mongoose.Schema.Types.ObjectId },
  accessories: [{
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Other'],
      // required: true,
    },
    accessoriesName: {
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
      type: String,
    },
    Quantity: {
      type: Number,
    },
  }],
}, {
  timestamps: true,
});

const CustomerReadymadeAccessories = mongoose.model('CustomerReadymadeAccessories', CustomerReadymadeAccessoriesSchema);

module.exports = CustomerReadymadeAccessories;
