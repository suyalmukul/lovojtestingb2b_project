const mongoose = require('mongoose');

const customerProductAlterationSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  product: [
    {
      name: {
        type: String,
        // required: true,
      },
      
      productNumber: { 
        type: String, 
      },

      categories: [
        {
          name: {
            type: String,
            // required: true,
          },
          
          alteration: [
            {
              alterationFrontImage: {
                type: Array,
              },
              alterationBackImage: {
                type: Array,
              },
            } 
          ],

        }
      ],
    }
  ],
}, {
  timestamps: true
});

const customerProductAlteration = mongoose.model('customerProductAlteration', customerProductAlterationSchema);

module.exports = customerProductAlteration;
