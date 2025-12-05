const mongoose = require('mongoose');

const signatureImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // imageUrl: {
  //   type: String,
  //   required: true,
  // },

  signatureFile1: {
    type: String,
  },
  signatureFile2: {
    type: String,
  },
}, { timestamps: true });

const SignatureImage = mongoose.model('signature', signatureImageSchema);

module.exports = SignatureImage;
