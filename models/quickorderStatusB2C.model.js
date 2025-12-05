const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuickOrderStatusSchema = new Schema({
  storeID: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: "OfflineCustomerB2C" },
  productID: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerProduct" },
  // ProductAlterationID: { type: mongoose.Schema.Types.ObjectId, ref: "customerProductAlteration" },
  orderNumber: { type: String },
  measurementID: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerMesurment" },
  specialIntructionID: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerSpacialInstruction" },
  constrastID: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerContrast" },
  readyMadeProductID: { type: mongoose.Schema.Types.ObjectId},
  readyMadeAccessoriesID: { type: mongoose.Schema.Types.ObjectId},
  billInvoiceID: { type: mongoose.Schema.Types.ObjectId },
  status: { type: Boolean, default: false },
  markedStatus: {type: String, enum: ["Completed", "Incomplete",]},
  activeStatus: { type: Boolean, default: true },
  aligned: [{
    productId:{ type: mongoose.Schema.Types.ObjectId},
    alignedTo: {
      type: String,
      enum: ['manager', 'sales', 'cutter', 'mastertailor', 'accessories', 'stitching', 'QC', 'delivery','stylish','admin', 'None'],
      default: 'None',
    },
    editedRole:{ type : String},
    workerName: { type: String},
    alignedStatus: { type: Boolean, default: false },
  }],
  reAligned: [{
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    }, 
    productId:{ type: mongoose.Schema.Types.ObjectId},
    reAlignedTo: {
      type: String,
      enum: ['manager', 'sales', 'cutter', 'mastertailor', 'accessories', 'stitching', 'QC', 'delivery','stylish','admin', 'None'],
      default: 'None',
    },
    editedRole:{ type : String},
    workerName: { type: String},
    reAlignedStatus: { type: Boolean, default: false },
  }],
  notAssignedProductIds: [{
    productId: { type: mongoose.Schema.Types.ObjectId}
  }],
  cutterStatus: [{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],
  mastertailorStatus:[{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],
  stitchingStatus: [{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],
  QCStatus: [{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],
  deliveryStatus: [{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],
  stylishStatus: [{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],
  adminStatus: [{
    status: {
      type: String,
      enum: ["NotAssigned", "InProgress", "Completed"],
      default: "NotAssigned",
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    editedRole:{ type : String},
    workerName: { type: String},
    productNumber: { type: String },
    productId:{ type: mongoose.Schema.Types.ObjectId},
    problem: {
      type: Boolean,
      default: false,
    },
    timmer: {
      type: String,
    },
    timmer1: {
      type: String,
    },
  }],

},
{
  timestamps: true, 
});

const QuickOrderStatusOnline = mongoose.model('QuickOrderStatusOnline', QuickOrderStatusSchema);

module.exports = QuickOrderStatusOnline;
