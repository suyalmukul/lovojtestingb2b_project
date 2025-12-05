const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminReadymadeProductSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },

  seen:{
    type:Boolean,
    default: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Other'],
    required: true,
  },

  productName: {
    type: String,
    required: true,
  },

  productNumber: {
    type: String,
    required: true,
  },

  productPrice: {
    type: Number,
    required: true,
  },

  AdminReadymadeProductImage: {
    type: Array,
    required: true,
  },

  Size: {
    type: [
      {
        xxxl: {
          type: Number,
          // required: true,
        },
        xxl: {
          type: Number,
          // required: true,
        },
        xl: {
          type: Number,
          // required: true,
        },
        l: {
          type: Number,
          // required: true,
        },
        m: {
          type: Number,
          // required: true,
        },
        s: {
          type: Number,
          // required: true,
        },
        xs: {
          type: Number,
          // required: true,
        },
      },
    ],
  },

  HSN_SAC_Code: {
    type: String,
    // required: true,
  },

  Product_Description: {
    type: String,
    // required: true,
  }

},
{
  timestamps: true,
});

const AdminReadymadeProduct = mongoose.model('AdminReadymadeProduct', AdminReadymadeProductSchema);

module.exports = AdminReadymadeProduct;


