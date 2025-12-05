
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    // stylist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stylist_id: { type: mongoose.Schema.Types.ObjectId },
    customer_id: { type: mongoose.Schema.Types.ObjectId },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    currency: { type: String, },
    is_selected: { type: Boolean, default: true },
    created_by: { type: String, required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "StylistAppointment" }
},
    { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
