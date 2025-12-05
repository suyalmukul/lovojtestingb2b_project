const mongoose = require("mongoose");

const businessDetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
    },
    businessEmail: {
      type: String,
      // required: true,
    },
    mobNumber: {
      type: Number,
    },
    businessAddress1: {
      type: String,
    },
    businessAddress2: {
      type: String,
    },
    city: {
      type: String,
    },
    cityPinCode: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    RegistrationNumber: {
      type: String,
    },
    GstNumber: {
      type: String,
    },
    PanNumber: {
      type: String,
    },
    businessPancard: {
      type: String,
    },
    businessBankStatementPDF: {
      type: String,
    },
    businessBankStatementPicture: {
      type: String,
    },
    businessSalePurchaseFile: {
      type: String,
    },
    uploadSelfieWithShop: {
      type: String,
    },

    businessProfileImage: {
      type: String,

    },
    businessInformationCetificate: {
      type: String,
    },
    businessGstCertificate: {
      type: String,
    },
    businessElectricWater: {
      type: String,
    },

    businessVisitingCard: {
      type: String,
    },
    businessSaleBillRecord: {
      type: String,
    },
    businessShopPicture: {
      type: String,
    },
    businessOtherDocment: {
      type: Array,
    },

  },
  { timestamps: true }
);

const Business = mongoose.model("Business", businessDetSchema);

module.exports = Business;
