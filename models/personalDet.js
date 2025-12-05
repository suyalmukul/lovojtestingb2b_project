const mongoose = require("mongoose");

const personalDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name :{
    type: String,
    // require: [true, "Name is required"],
  },
  email :{
    type: String,
    // require: [true, "Email is required"],
  },
  phoneNumber :{
    type: Number,
    // require: [true, "Phone Number is required"],
  },
  ownerAddress1: {
    type: String,
    // require: [true, "Adderss Proof is required"],
  },
  ownerAddress2: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  ownerCityName: {
    type: String,
  },
  ownerAreaPinCode: {
    type: Number,
    // require: [true, "Pincode is required"],
  },
  uploadAdharCardFront: {
    type: String,
    // require: [true, "Adhar Image Proof is required"],
  },
  uploadAdharCardBack: {
    type: String,
    // require: [true, "Adhar Image Proof is required"],
  },
  uploadPassport: {
    type: String,
    // require: [true, "Passport Proof is required"],
  },
  uploadResidence: {
    type: String,
    // require: [true, "Residence Proof is required"],
  },

  uploadPanCard: {
    type: String,
  },
  uploadVoterPassportId: {
    type: String,
  },
  uploadDrivingLicense: {
    type: String,
  },
  uploadElectricWaterBill: {
    type: String,
  },
  uploadBankPassbook: {
    type: String,
  },
  uploadOtherDetails: {
    type: Array,
  },

  Nominee: {
    type: String,
  },

  NomineePhoneNumber: {
    type: Number,
  },

  NomineeAdharNumber: {
    type: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("PersonalDetails", personalDetailsSchema);
