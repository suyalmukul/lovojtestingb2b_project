const mongoose = require('mongoose');

const factorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  factoryEmail: {
    type: String,
    // required: [true, 'Factory email is required'],
  },
}, { timestamps: true });

const FactoryProfile = mongoose.model('FactoryProfile', factorySchema);

module.exports = FactoryProfile;



