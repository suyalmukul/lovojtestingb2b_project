const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StylistAvailabilityPreferenceSchema = new Schema({
    stylist_id: {
        type: String,
        required: true,
        index: true, 
    },
    day: {
        type: String,
        required: true,
        index: true,
    },
    start_time: {
        type: Date, 
        required: true,
    },
    end_time: {
        type: Date, 
        required: true,
    }
}, { timestamps: true });

const StylistAvailabilityPreference = mongoose.model('StylistAvailabilityPreference', StylistAvailabilityPreferenceSchema);

module.exports = StylistAvailabilityPreference;
