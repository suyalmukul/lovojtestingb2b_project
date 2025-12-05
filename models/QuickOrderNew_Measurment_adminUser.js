const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AdminMesurmentSchemaForUser = new Schema({
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
          seen: {
            type: Boolean,
          },
          name: {
            type: String,
            // required: true,
          },
          mesurmentImage: {
            type: String,
            // required: [true, 'measurment image is required'],
          },
          mesurmentNumber: {
            type: String,
          },

        },
      ],
}, {
  timestamps: true,
});

const AdminMesurmentForUser = mongoose.model('AdminMesurmentForUser', AdminMesurmentSchemaForUser);

module.exports = AdminMesurmentForUser;


