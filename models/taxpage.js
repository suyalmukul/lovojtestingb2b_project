const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TaxSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  taxName: {
    type: Array,
    required: true,
  },
  taxRate: {
    type: Array,
    required: true,
  },
  taxType: {
    type: Array,
    // enum: ['IGST','SGST','CGST','UGST'],
    required: true,
  },

  Gst: {
    type: String,
    // required: true,
  },

  Vat: {
    type: String,
    // required: true,
  },

}, {
  timestamps: true,
});

const Tax = mongoose.model('Tax', TaxSchema);

module.exports = Tax;
