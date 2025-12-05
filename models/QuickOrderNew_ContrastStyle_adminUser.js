const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const AdminContrastStyleSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  genderName: {
    type: String,
    enum: ['Men', 'Women', 'Other'],
  },
  productName:  {
        type: String,
        required: true,
      },
    categories: [
        {
          name: {
            type: String,
            required: true,
          },
          styles: [
            {
            seen: {
             type: Boolean,
              },
              catStyleName: {
                type: String,
              },
              catStyleNumber: {
                type: String,
              },
              catStylePrice: {
                type: String,
              },
              styleImage: {
                type: String,
              },
            },
          ],
        },
      ],
},
{
  timestamps: true,
});

const AdminContrastStyle = mongoose.model('AdminContrastStyle', AdminContrastStyleSchema);

module.exports = AdminContrastStyle;

