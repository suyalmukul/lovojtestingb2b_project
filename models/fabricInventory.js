const mongoose = require('mongoose');

const fabricInventorySchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
    name: String,
    type: String,
    construction: String,
    composition: String,
    construction_type: String,
    pattern: String,
    fabric_image: String,
    images: [],
    tile_x: Number,
    tile_y: Number,
    season: {
        type: String,
        enum: ['summer', 'winter', 'spring', 'fall', 'all season']
    },
    glossy: Boolean,
    glossy_intensity: String,
    dashnumber: String,
    gsm: Number,
    width: String,
    count: String,
    unit: {
        type: String,
        enum: ['mtr', 'pc', 'kg']
    },
    color: String,
    color_code: String,
    sku: String,
    brand: String,
    description: String,
    best_for: String,
    base_price: Number,
    discount_percentage: Number,
    cost_gst_percentage: Number,
    extra_charges: Number,
    profit_percentage: Number,
    selling_percentage: Number,
    sell_gst_percentage: Number,
    offer_price: Number,
    mrp: Number,
    expiry_date: Date,
    alert_quantity: Number,
    moq: Number,
    selling_moq: Number,
    number: Number,
    rotation: Number,
    rollInfo: [
        {
            rollLength: Number,
            unit: { type: String, default: "mtr" },
            rollIdentity: String,
            rackNumber: String,
            stockLocation: String,
            quantity: [
                {
                    roll_id: { type: String, required: true },
                    roll_length: { type: Number, required: true }
                }
            ]
        }
    ],
    qr_code: { type: String }
}, { timestamps: true }); 

module.exports = mongoose.model('fabricInventory', fabricInventorySchema);
