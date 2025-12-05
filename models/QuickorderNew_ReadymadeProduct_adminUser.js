const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminReadymadeProductSchemaForUser = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  storeType: {
    type: String,
  },
  designerName: {
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

  productType: {
    type: String,
    // required: true,
  },
  productCategory: {
    type: String,
  },
  fabricUse: {
    type: String,
    // required: true,
  },

  productName: {
    type: String,
    // required: true,
  },

  productNumber: {
    type: String,
    // required: true,
  },

  productPrice: {
    type: Number,
    // required: true,
  },

  AdminReadymadeProductImage: {
    type: Array,
    // required: true,
  },


  Size: {
    type: [
      {
        xxxl: {
          type: Number,
        },
        xxl: {
          type: Number,
        },
        xl: {
          type: Number,
        },
        l: {
          type: Number,
        },
        m: {
          type: Number,
        },
        s: {
          type: Number,
        },
        xs: {
          type: Number,
        },
      },
    ],
  },
  productColor: {
    type: Array,
  },

  productDiscount: {
    type: String,
  },

  HSN_SAC_Code: {
    type: String,
  },


  location: {
    type: String,
  },



  Product_Description: {
    type: String,
  },
  qrCodeURL: {
    type: String,
  }

},
{
  timestamps: true,
});

const AdminReadymadeProductForUser = mongoose.model('AdminReadymadeProductForUser', AdminReadymadeProductSchemaForUser);

module.exports = AdminReadymadeProductForUser;



