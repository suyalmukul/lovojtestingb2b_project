const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminManualPaymentSchema = new Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stores"
    },
    paymentMethods: {
      paypal: [{
        paypalNumber: { type: String }
      }],
      iban: [{
        ibanNumber: { type: String }
      }],
      account: [{
        accNumber: { type: String },
        bankName: { type: String },
        ifscCode: { type: String },
        accHolderName: { type: String }
      }],
      upi: [{
        upiNumber: { type: String }
      }],
      qrCode: [{
        qrCodeImage: { type: String }
      }]
    }
  },
  {
    timestamps: true
  }
);

const AdminManualPayment = mongoose.model('AdminManualPayment', AdminManualPaymentSchema);

module.exports = AdminManualPayment;



