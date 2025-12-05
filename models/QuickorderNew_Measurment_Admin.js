const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminMesurmentSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },

  ownFlag:{
    type:Boolean,
    default:false,
  },
  
  name: {
    type: String,
    // required: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women','Other'],
    // required: true,
  },
  categoriename: {
    type: String,
    required: true,
   },
    measurements: [
        {
          name: {
            type: String,
            required: true,
          },
          mesurmentImage: {
            type: String,
            required: [true, 'measurment image is required'],
          },
          mesurmentNumber: {
            type: String,
          },

        },
      ],
}, {
  timestamps: true,
});

// Create a model based on the schema
const AdminMesurment = mongoose.model('AdminMesurment', AdminMesurmentSchema);

module.exports = AdminMesurment;
