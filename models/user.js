const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("mongoose-type-email");

const userSchema = mongoose.Schema({
  storeId: { type: String,  },
  firstName: String,
  lastName: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  otp: String,
  otpSentAt: Date,
  storeNumber: { type: String,  },
  email: {
    type: mongoose.SchemaTypes.Email,
  },
  superAdminPermission: {
    type: Boolean,
    default: false,
  },
  websitePermission: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    // required: [true, "Password is required"],
    select: false,
    validate: {
      validator: function (password) {
        // const passwordRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{6,}$/;
        const passwordRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;

        return passwordRegex.test(password);
      },
      message: "Password must contain only alphabets and numbers, and be at least 6 characters long.",
    },
  },
  
  showPassword:{ type: String,},
  countryCode: { type: String,},
  mobileNumber: { type: String,},
  name: { type: String, },
  storeType: { type: String, },
  stylishlocation: { type: String,  },
  profession: { type: String, },
  makingProductList: { type: Array, },
  specialist: { type: Array, },
  storeSignature: { type: String, },
  role: {
    type: String,
    enum: [
      "admin",
      "superadmin",
      "stylish",
      "manager",
      "sales",
      "cutter",
      "tailor",
      "stitching",
      "QC",
      "delivery",
    ],
    // required: [true, "Role is required"],
  },
  activestatus:{
    type:Boolean,
    default:true,
  },
  deviceToken : { type : String},
  playerId : {type : String},
  
  Associate :{
    type : Array
  },
  Associated :{
    type : Array
  },
  location: {
    type: String,
    // required: true,
  },
  // experience: {
  //   type: Number,
  //   default:1
  //   // required: true,
  // },

  profile_image_url: {
    type: String,
    // required: true,
  },
  gender: {
    type: String,
    // required: true,
  },
  // Fields related to credit information
  credit: {
    type: Number,
   // default: 10000,
  },
  typeOfStylist: {
    type: String,
    enum: [
      "LovojStylish", "FreelancerStylish",
    ],
  },

  stylishFullAddress: { type: String, },

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
  created_by:{
    type:String,
    default:'user'
  },
  working_locations:[
    {type:String}
  ]
},
  { timestamps: true } 
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    const user = this;
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    return isPasswordMatched;
  } catch (err) {
    throw err;
  }
};




userSchema.methods.login = function async(password) {
  let user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

module.exports = mongoose.model("User", userSchema);



