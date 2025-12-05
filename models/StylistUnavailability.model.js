const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unavailabilitySchema = new Schema({
  stylist_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  reason: { type: String, default: 'Not Available' },
}, { timestamps: true });

unavailabilitySchema.index({ date: 1, start_time: 1 });
unavailabilitySchema.index({ date: 1 });
unavailabilitySchema.index({ start_time: 1 });

const StylistUnavailability = mongoose.model('StylistUnavailability', unavailabilitySchema);

module.exports = StylistUnavailability;
