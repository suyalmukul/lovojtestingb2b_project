// // schema
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const bcrypt = require("bcrypt");

// const superadminSchema = new Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// superadminSchema.pre("save", function (next) {
//   const superadmin = this;
//   if (!superadmin.isModified("password")) {
//     return next();
//   }
//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) {
//       return next(err);
//     }
//     bcrypt.hash(superadmin.password, salt, (err, hash) => {
//       if (err) {
//         return next(err);
//       }
//       superadmin.password = hash;
//       next();
//     });
//   });
// });

// const Superadmin = mongoose.model("Superadmin", superadminSchema);

// module.exports = Superadmin;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const superadminSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Superadmin = mongoose.model("Superadmin", superadminSchema);

module.exports = Superadmin;
