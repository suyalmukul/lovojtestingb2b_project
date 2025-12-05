const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("mongoose-type-email");


const schema = mongoose.Schema(
  {
    storeNumber: {
      type: String,
      required: true,
    },
    email: {
      type: mongoose.SchemaTypes.Email,
      required: true,
    },
    countryCode: { type: String,},
    mobileNumber: {
      type: String,
      // required: true,
    },
    //name key define storeName
    name: {
      type: String,
      required: true,
    },
    superAdminPermission: {
      type: Boolean,
      default: false,
    },
    websitePermission: {
      type: Boolean,
      default: false,
    },

    flag: {
      type: Boolean,
      // required: true,
      default: false,
    },
    // likes: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],

    location: {
      type: String,
      // required: true,
    },

    userLikes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        email: mongoose.SchemaTypes.Email,
      },
    ],


    userRatings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        email: mongoose.SchemaTypes.Email,
      },
    ],
    
    totalLike: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: String,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    notAssociated: {
      type: Array,
      default: 0,
    },
    Associated: {
      type: Array,
      default: 1,
    },

    credit: {
      type: Number,
      // default: 10000,
    },

    storeType: {
      type: String,
      enum: ["Designer", "Fabric", "Factory", "Accessories"],
      required: true,
    },
    activestatus:{
      type:Boolean,
      default:true,
    },
    
    profession: { type: String, },

    makingProductList: { type: Array, },
    specialist: { type: Array, },
    storeSignature: { type: String, },
    storeAddress: { type: String, },

    experience: {
      type: Number,
      default:1
      // required: true,
    },
    personalProfileStatus: {
      type: Boolean,
      default: false,
    },
    businessProfileStatus: {
      type: Boolean,
      default: false,
    },
    profilePhotoStatus: {
      type: Boolean,
      default: false,
    },
    profileSignatureStatus: {
      type: Boolean,
      default: false,
    },
    profileFactoryStatus: {
      type: Boolean,
      default: false,
    },
    productStatus: {
      type: Boolean,
      default: false,
    },
    measurmentStatus: {
      type: Boolean,
      default: false,
    },
    fabricStatus: {
      type: Boolean,
      default: false,
    },
    businessName: {
      type: String,
      // required: true,
    },
    businessAddress: {
      type: String,
    },
    visitingCardImage: {
      type: String,
    },
    idProofImage: {
      type: String,
    },
    businessProofImage: {
      type: String,
    },

    storeHeading: {
      type: String,
      default: "Fabric House" // Set your default heading here
    },
    storeDescription: {
      type: String,
      default: "The Fabric House - Manufacturer of Cotton Fabrics, Textile & Cotton Fabric from New Delhi" // Set your default description here
    },
  
    storeImage: {
      type: String,
    },
    shopName: {
      type: String,
    },
    delivery:{
      type: String,
      default:"delivery across India"
    },
    
    // fabDashNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("stores", schema);



