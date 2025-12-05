const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

// Workers Collection
const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  fullName:{
    type: String
  },
  contactNumber:{
    type: String
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select : false,
    // validate: {
    //   validator: function (password) {
    //     // const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    //     const passwordRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;
    //     return passwordRegex.test(password);
    //   },
    //   message: "Password must contain only alphabets and numbers, and be at least 6 characters long.",
    // }
  },
}, { timestamps: true });



// Password hashing
customerSchema.pre("save", function (next) {
  let customer = this;

  // if the data is not modified
  if (!customer.isModified("password")) {
    return next();
  }

  bcrypt.hash(customer.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    customer.password = hash;
    next();
  });
});
// Password verification upon login
customerSchema.methods.login = function async(password) {
  let customer = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, customer.password, (err, result) => {
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

const OnlineCustomerB2C = mongoose.model('OnlineCustomerB2C', customerSchema);

module.exports =  OnlineCustomerB2C ;



// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// require("mongoose-type-email");



// const userSchema = mongoose.Schema({
//   email: {
//     type: mongoose.SchemaTypes.Email,
//     // required: [true, "Email address is required"],
//   },
//   activestatus: {
//     type: String,
//   },
//   socialId: {
//     type: String,
//   },
//   type: {
//     type: String,
//     enum: [
//       "facebook", "google", "apple", "app",
//     ],
//     default: "app"
//   },
//   password: {
//     type: String,
//     // required: [true, "Password is required"],
//     select: false,
//     validate: {
//       validator: function (password) {
//         const passwordRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;

//         return passwordRegex.test(password);
//       },
//       message: "Password must contain only alphabets and numbers, and be at least 6 characters long.",
//     },
//   },
//   mobileNumber: { type: String, 
//     // required: [true, "Mobile number is required"] 
//   },
//   name: { type: String, 
//     // required: [true, "Name is required"] 
//   },
//   role: {
//     type: String,
//     enum: [
//       "user",
//     ],
//     required: [true, "Role is required"],
//   },
//   otp: String,
//   otpSentAt: Date,
// },
//   { timestamps: true }
// );


// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }

//   try {
//     const hash = await bcrypt.hash(this.password, 10);
//     this.password = hash;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });



// userSchema.methods.comparePassword = async function (password) {
//   try {
//     const user = this;
//     const isPasswordMatched = await bcrypt.compare(password, user.password);
//     return isPasswordMatched;
//   } catch (err) {
//     throw err;
//   }
// };


// userSchema.methods.login = function async(password) {
//   let user = this;
//   return new Promise((resolve, reject) => {
//     bcrypt.compare(password, user.password, (err, result) => {
//       if (err) {
//         reject(err);
//       }
//       if (result) {
//         resolve();
//       } else {
//         reject();
//       }
//     });
//   });
// };

// const OnlineCustomers = mongoose.model('OnlineCustomers', userSchema);

// module.exports = OnlineCustomers;







