const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const SuperadminContrastStyleSchema = new Schema({
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
              catStyleName: {
                type: String,
              },
              catStyleNumber: {
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

const SuperadminContrastStyle = mongoose.model('SuperadminContrastStyle', SuperadminContrastStyleSchema);

module.exports = SuperadminContrastStyle;

