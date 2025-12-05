const mongoose = require('mongoose');
const Counter = require('./Counter.model');
const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OnlineCustomers', required: true },
  products: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  appointment_ids: [{
    type: mongoose.Schema.ObjectId, ref: 'StylistAppointment'
  }],
  type: { type: String, enum: ['appointment', 'product'], required: true },
  associated_order_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  total_amount: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  payment_status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  order_status: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  payment_id: { type: String }, // For storing payment gateway ID
  payment_type: { type: String, enum: ['offline', 'online'] },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customer_addresses' },//customer_addresses
  order_number: { type: String, unique: true },
  amount_due: { type: Number, required: true, default: 0 },
  amount_paid: { type: Number, required: true, default: 0 },
  stylist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  advance_payment_transaction_id: { type: String, default: null },
  expected_delivery: { type: Date },
  created_by: { type: String, default: "stylist" }
}, { timestamps: true });

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.order_number = `ORD${counter.seq.toString().padStart(4, "0")}`;
  }
  next();
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;