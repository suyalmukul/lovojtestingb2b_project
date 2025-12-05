const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const AdminProductSchemaForUser = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  ownFlag: {
    type: Boolean,
    default: false,
  },
  seen:{
    type:Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
  },

  productNumber: {
    type: String,
  },
  genderName: {
      type: String,
      enum: ['Men', 'Women', 'Other'],
    },

  productName:  {
        type: String,
        required: true,
      },
      productImage: {
        type: String,
      },
      categories: [
        {
          name: {
            type: String,
            required: true,
          },
          catImage: {
            type: String,
            required: [true, 'subcategory image is required'],
          },
          catNumber: {
            type: String,
          },
          styles: [
            {
              catStyleName: {
                type: String,
                required: true,
              },
              catStyleNumber: {
                type: String,
                // required: true,
              },
              styleImage: {
                type: String,
                required: [true, 'Style image is required'],
              },
              styleGlbImage: {
                type: String,
                // required: [true, 'Style image is required'],
              },
              flag: {
                type: Boolean,
                default: false,
              },
            },
          ],
        },
      ],
      discription: {
        type: String,
      },
},
{
  timestamps: true,
});

// Create a model based on the schema
const AdminProductForUser = mongoose.model('AdminProductForUser', AdminProductSchemaForUser);

module.exports = AdminProductForUser;
