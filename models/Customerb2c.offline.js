const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required']
  },

  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },

  dateOfBirth: String,

  country: {
    type: String,
    // required: [true, 'Country is required']
  },
  phoneNumber: {
    type: String,
    // required: [true, 'Phone number is required']
  },

  alternatePhoneNumber: String,

  email: {
    type: String,
    // required: [true, 'Email is required']
  },


  address: String,

  customerFront: {
    type: String,
  },

  customerBack: {
    type: String,
  },

  customerSide: {
    type: String,
  }
}, {
  timestamps: true,
});


// const Product = mongoose.model('Product', productSchema);
const OfflineCustomerB2C = mongoose.model('OfflineCustomerB2C', customerSchema);

module.exports = {
  OfflineCustomerB2C,
};






