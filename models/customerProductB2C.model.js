const mongoose = require('mongoose');

const customerProductSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  product: [
    {
      name: {
        type: String,
        required: true,
      },
      productNumber:{ String },

      categories: [
        {
          name: {
            type: String,
            required: true,
          },
          styles: [
            {
              styleName: {
                type: String,
              },
              styleType: {
                type: String,
              },
              styleImage: {
                type: String,
              },
            }
          ],
        }
      ],
      fabricImage: {
        type: String,
      },
      customerOwnFabricImage: {
        type: String,
      },
      fabricName: {
        type: String,
        // required: true,
      },
      fabricMaterial: {
        type: String,
        // required: true,
      },
      fabricQuantity: {
        type: Number,
        required: true,
      },
      quantityType: {
        type: String,
        required: true,
      },
      fabDashNumber:{
        type:String,
      },
      customNumber: {
        type: String,
      },
      tilex: { type: Number },
      tiley: { type: Number },
      contrast: { type: Number },
      brightness: { type: Number },
      rotation: { type: Number },
      color: { type: String },
      glossy: { type: Boolean },
    }
  ],
}, {
  timestamps: true
});

const CustomerProductOnline = mongoose.model('CustomerProductOnline', customerProductSchema);

module.exports = CustomerProductOnline;
