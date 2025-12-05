const mongoose = require("mongoose");
let fabricdropdowns = new mongoose.Schema(
  {
    fabricCategory: {
      type: String,
    },
    fabricBrand: {
      type: Array,
    },
    fabricColor: {
      type: Array,
    },
    // fabricQuantity: {
    //   type: Array,
    // },
    fabricComposition: {
      type: Array,
    },
    fabricSubCategory: {
      type: Array,
    },
    fabricMaterial: {
      type: Array,
    },
    fabricPattern: {
      type: Array,
    },
    fabricTypes: {
      type: Array,
    },
    fabricCharacteristics: {
      type: Array,
    },
    fabricSeason: {
      type: Array,
    },
    fabricGsm: {
      type: Array,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("FabricDropdown", fabricdropdowns);




