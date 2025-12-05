const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CustomDesignOrderStatusSchema = new Schema({
  storeID: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "OfflineCustomerB2C" },
  customObjId: {type: mongoose.Schema.Types.ObjectId,},
//   billInvoiceID: { type: mongoose.Schema.Types.ObjectId },
  status: { type: Boolean, default: false },
//   activeStatus: { type: Boolean, default: true },
//   markedStatus: { type: String, enum: ["Completed", "Incomplete",] },

},
  {
    timestamps: true,
  });

const CustomDesignOrderStatus = mongoose.model('CustomDesignOrderStatus', CustomDesignOrderStatusSchema);

module.exports = CustomDesignOrderStatus;
