const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("mongoose-type-email");

const userSchema = mongoose.Schema({
  email: {
    type: mongoose.SchemaTypes.Email,
    required: [true, "Email address is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    // validate: {
    //   validator: function (password) {
    //     const passwordRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;

    //     return passwordRegex.test(password);
    //   },
    //   message: "Password must contain only alphabets and numbers, and be at least 6 characters long.",
    // },
  },
  mobileNumber: { type: String, required: [true, "Mobile number is required"] },
  name: { type: String, required: [true, "Name is required"] },
  role: {
    type: String,
    enum: [
      "user",
    ],
    required: [true, "Role is required"],
  },
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

const OnlineCustomers = mongoose.model('OnlineCustomers', userSchema);

module.exports = OnlineCustomers;
