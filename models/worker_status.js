const mongoose = require('mongoose');

// Workers Collection
const WorkerStatusSchema = new mongoose.Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: "stores", required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  combination: [
    {
      rollLength: Number,
      rollIdentity: String,
      rackNumber: String,
      stockLocation: String,
  }
  ],
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workers' },
  status: {
    type: String,
    enum: ['initiated', "pending", "accepted", "completed"],
    default: "pending",
  },
  timer_start: {
    type: String,
    default: null,
  },
  timer_end: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["cutter", "mastertailor", "stitching", "qc", "devlivery"],
    default: "cutter"
  },
  // aling_to:{
  //     type:String,
  //     default:"cutter",
  // }

}, { timestamps: true });


const WorkerStatus = mongoose.model('WorkerStatus', WorkerStatusSchema);

module.exports = WorkerStatus;
