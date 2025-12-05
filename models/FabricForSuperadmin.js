const mongoose = require("mongoose");
let schema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores"},
  qrCodeURL: {type: String},
  fabNumber: { type: String},
  fabDashNumber: { type: String},
  fabName: { type: String,},
  fabImage: { type: String,},
  fabImageOptional1 :{type : String},
  fabImageOptional2 :{type : String},
  fabImageOptional3 :{type : String},
  tilex: { type: Number },
  tiley: { type: Number },
  contrast: { type: Number },
  brightness: { type: Number },
  rotation: { type: Number },
  color: { type: String },
  glossy: { type: Boolean },
  storeNumber: { type: String },
  mobileNumber: {
    type: String,
    validate: {
      validator: function (value) {
        return /^\d{10}$/.test(value);
      },
      message: 'Mobile number should be a 10-digit number',
    },
  },
    shopType: {type: String},
    hascode:{ type: String },
    fabricSupplierContact: { type: String },
    fabricCat:{ type: String },
    fabricCategory: { type: Array },
    fabricBrand: { type: Array },
    fabricColor: { type: Array },
    fabricComposition: { type: Array },
    fabricSubCategory: { type: Array },
    fabricMaterial: { type: Array },
    fabricPattern: { type: Array },
    fabricType: { type: Array },
    fabricCharacteristics: { type: Array },
    fabricSeason: { type: Array },
    fabricQuantity: { type: Number },
    fabricGsm: {
      type: Array,
    },
    totalRollsLength: {type: Number},

    perMeterPrice: {
      type: Number,
    },
    fabricDiscount: {
      type: Number,
    },


/********************Working *********************** */

    rollInfo: [
      {
        rollLength: Number,
        rollIdentity: String,
        rackNumber: String,
        stockLocation:String
      }
    ],
    fabDescription:{type:String},
    createdBy: { type: String },
},{ timestamps: true });

schema.pre("save", function (next) {
  next();
});



module.exports = mongoose.model("FabricsForSuperadmin", schema);






