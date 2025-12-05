const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

// Workers Collection
const workersSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  storeNumber: {
    type: String,
    required: [true, 'Store number is required']
  },
  location: {
    type: String,
    default: null
  },
  storeType: {
    type: String,
    required: [true, 'Store type is required']
  },

  name: {
    type: String,
    required: [true, 'Name is required']
  },

  email: {
    type: String,
    required: [true, 'Email is required']
  },
  workerProfileImage: {
    type: String
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['manager', 'sales', 'cutter', 'mastertailor', 'accessories', 'stitching', 'QC', 'delivery'],
      message: 'Invalid role'
    }
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    // validate: {
    //   validator: function (password) {
    //     // const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    //     const passwordRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()\-_=+~`[\]{}|\\:;'<>,.?/]{6,}$/;
    //     return passwordRegex.test(password);
    //   },
    //   message: "Password must contain only alphabets and numbers, and be at least 6 characters long.",
    // }
  },
  activestatus: {
    type: Boolean,
    default: true,
  },
  deviceToken: { type: String },

  joiningDate: {
    type: Date,
    default: Date.now,
    // required: [true, 'Joining date is required']
  },
  salary: {
    type: Number,
    default: 0,
    // required: [true, 'Salary is required']
  },

  address: {
    type: String,
    default: '',
  },

  aadharCardFront: {
    type: String
  },
  aadharCardBack: {
    type: String
  },
  panCardFront: {
    type: String
  },
  employmentDocumentPdf1: {
    type: String
  },
  employmentDocumentPdf2: {
    type: String
  },
  otherDocument1: {
    type: String
  },
  otherDocument2: {
    type: String
  },
}, { timestamps: true });



workersSchema.pre("save", function (next) {
  let worker = this;

  // if the data is not modified
  if (!worker.isModified("password")) {
    return next();
  }

  bcrypt.hash(worker.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    worker.password = hash;
    next();
  });
});
// Password verification upon login
workersSchema.methods.login = function async(password) {
  let worker = this;
  console.log(worker);
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, worker.password, (err, result) => {
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

const Workers = mongoose.model('Workers', workersSchema);

module.exports = Workers;
