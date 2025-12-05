const mongoose = require("mongoose");
let schema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores"},
  productType:{type:String},
  fabricCutting:{type:String},
  makingCharges:{type:Number},
  contrastCharges: {
    cuff: [{
      charges: { type: String },
      time: { type: String },
    }],
    collar: [{
      charges: { type: String },
      time: { type: String },
    }],
    etc: [{
      charges: { type: String },
      time: { type: String },
    }],
    etcc: [{
      charges: { type: String },
      time: { type: String },
    }],
    etccc: [{
      charges: { type: String },
      time: { type: String },
    }]
  }
},
{ timestamps: true });

schema.pre("save", function (next) {
  next();
});


module.exports = mongoose.model("FabricForUSerMakingCharges", schema);

