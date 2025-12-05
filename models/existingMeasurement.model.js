
const mongoose = require('mongoose');

const existingMesurmentSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  categories: [
    {
      name: {
        type: String,
        required: true,
      },
      mesurments: [
        {
          mesurmentName: {
            type: String,
          },
          mesurmentNumber: {
            type: String,
          },
          mesurmentImage: {
            type: String,
          },
          customerOwnMeasurmentImage: {
            type: String,
          },
          size : {
            type : String,
          },
          alt1 : {
            type : String,
          },
          alt2 : {
            type : String,
          },
        }
      ],
    }
  ],
},{
    timestamps: true,
});

const ExistingCustomerMeasurement = mongoose.model('ExistingCustomerMeasurement', existingMesurmentSchema);

module.exports = ExistingCustomerMeasurement;