const mongoose = require('mongoose');
const Counter = require('./Counter.model');


const ProductMappingSchema = new mongoose.Schema({
    product_code: {
        type: String,
        unique: true
    },
    numeric_code: {
        type: Number,
        unique: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    }
}, { timestamps: true });

// Middleware to auto-increment numeric_code
ProductMappingSchema.pre('save', async function (next) {
    if (!this.numeric_code) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'product_code' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, returnDocument: 'after' }
            );

            this.numeric_code = counter.seq;

            // Generate unique alphanumeric product_code
            const paddedNumber = String(this.numeric_code).padStart(6, '0'); // Ensure 6-digit number
            const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase(); // 2-letter string
            this.product_code = `${paddedNumber}${randomStr}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const ProductMapping = mongoose.model('ProductMapping', ProductMappingSchema);

module.exports = ProductMapping;
