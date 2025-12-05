const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUrl: {
    type: String,
    // required: true,
  },
  // adminProfileImage: { // Changed field name to `adminProfileImage`
  //   type: String,
  //   required: true,
  // },
}, { timestamps: true });

const ProfileImage = mongoose.model('ProfileImage', profileImageSchema);

module.exports = ProfileImage;
