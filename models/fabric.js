const mongoose = require("mongoose");
let schema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  defaultFabric: { type: Boolean },
  qrCodeURL: { type: String },
  fabNumber: { type: String },
  fabDashNumber: { type: String },
  fabName: { type: String, required: [true, 'Fabric name is required'] },
  fabImage: { type: String, },
  fabImageOptional1: { type: String },
  fabImageOptional2: { type: String },
  fabImageOptional3: { type: String },
  tilex: { type: Number },
  tiley: { type: Number },
  contrast: { type: Number },
  brightness: { type: Number },
  rotation: { type: Number },
  color: { type: String },
  glossy: { type: Boolean },
  storeNumber: { type: String, required: [true, 'Store number is required'] },
  mobileNumber: {
    type: String,
    validate: {
      validator: function (value) {
        return /^\d{10}$/.test(value);
      },
      message: 'Mobile number should be a 10-digit number',
    },
  },
  shopType: { type: String },
  // stockLocation: { type : String },
  hascode: { type: String },
  fabricSupplierContact: { type: String },
  fabricCat: { type: String },
  fabWidth: { type: String },
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
  // deliveryTime:{type : Array},
  fabricQuantity: { type: Number },
  unit: { type: String, default: "mtr" },
  fabricGsm: {
    type: Array,
  },
  // fabricPrice: { type: Number},
  totalRollsLength: { type: Number },


  /////////testing////////
  perMeterPrice: {
    type: Number,
    // required: true,
  },
  fabricDiscount: {
    type: Number,
    // required: true,
  },


  /********************Working *********************** */

  rollInfo: [
    {
      rollLength: Number,
      unit: { type: String, default: "mtr" },
      rollIdentity: String,
      rackNumber: String,
      stockLocation: String,
      quantity: [
        {
          roll_id: { type: String, required: true },
          roll_length: { type: Number, requried: true }
        }
      ]
    }
  ],
  fabDescription: { type: String },

  createdBy: { type: String },
}, { timestamps: true });

schema.pre("save", function (next) {
  next();
});


module.exports = mongoose.model("Fabrics", schema);

