const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSectionSchema = new Schema(
  {
    CustomizedProduct: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      measurementId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      specialInstructionId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      constrastId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    ReadymadeProduct: {
      readymadeProductId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    ReadymadeAccessories: {
      accessorieId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  },
  { _id: false } // Disable generation of _id for subdocuments
);


const invoiceSchema = new Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  CustomersSection: [
    {
      customerName: {
        type: String,
        required: [true, 'Customer name is required']
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
      },
      email: {
        type: String,
        required: [true, 'Email is required']
      },
      phoneNumber: {
        type: String,
        required: [true, 'Phone number is required']
      },
      dateOfBirth: {
        type: String
      },
      country: {
        type: String,
        // required: [true, 'Country is required']
      },
      GstTreatment: {
        type: Boolean,
      },
      Business: {
        type: String,
      },
      GstIn: {
        type: String,
      },
      InvoiceNumber: {
        type: String,
      },
      InvoiceDate: {
        type: Date,
      },
      ShippingAddress: {
        type: String,
      },
      BillingAddress: {
        type: String,
      },
      placeOfSupply: {
        type: String,
      },
      UrgentOrder: {
        type: Boolean
      },
    }
  ],
  OrderSection: [orderSectionSchema],
  CoastSection: [
    {
      PickupFromStore: {
        type: Boolean,
      },
      DeliveryAddress: {
        type: Boolean,
      },
      DeliveryCoast: {
        type: Number,
      },
      Coupon: {
        type: String,
      },
      SubTotal: {
        type: Number,
      },
      DeliveryCharges: {
        type: Number,
      },
      CouponAmount: {
        type: Number,
      },
      Cgst: {
        type: Number,
      },
      Sgst: {
        type: Number,
      },
      TotalAmount: {
        type: Number,
      },
      PaymentAdvance: {
        type: Number,
      },
      PendingAmount: {
        type: Number,
      },
      DeliveryDate: {
        type: Date,
      },
      AlternationDate: {
        type: Date,
      },
      Invoice: {
        type: Boolean,
      },
      Measurements: {
        type: Boolean,
      },
      StylesAndFabrics: {
        type: Boolean,
      },
    }
  ]
}, { timestamps: true });

const CustomerInvoiceOnline = mongoose.model('CustomerInvoiceOnline', invoiceSchema);

module.exports = CustomerInvoiceOnline;

