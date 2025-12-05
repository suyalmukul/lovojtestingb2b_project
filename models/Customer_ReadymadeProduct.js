const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CustomerReadymadeProductSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  customerId: { type: mongoose.Schema.Types.ObjectId },
  products: [{
    gender: { type: String, enum: ['Men', 'Women', 'Other'] },
    productName: { type: String, required: true },
    productNumber: { type: String, required: true },
    productPrice: { type: Number, required: true },
    ReadymadeProductImage: { type: String },
    Size: {
      type: {
        xxl: { type: Number },
        xl: { type: Number },
        l: { type: Number },
        m: { type: Number },
        s: { type: Number },
        xs: { type: Number },
      },
    },
  }],
}, {
  timestamps: true,
});

const CustomerReadymadeProduct = mongoose.model('CustomerReadymadeProduct', CustomerReadymadeProductSchema);

module.exports = CustomerReadymadeProduct;
