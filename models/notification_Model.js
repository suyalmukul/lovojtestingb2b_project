const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stores"
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: String
  },
  {
    timestamps: true
  }
);

const NotificationModel = mongoose.model('NotificationModel', NotificationSchema);

module.exports = NotificationModel;



