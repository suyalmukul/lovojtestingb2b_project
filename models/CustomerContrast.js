const mongoose = require('mongoose');

const contrastSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
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
              styleName: {
                type: String,
                // required: true,
              },
              styleImage: {
                type: String,
                // required: true,
              },
              styleFabricImage: {
                type: String,
                // required: true,
              },
              stylePrice: {
                type: Number,
                // required: true,
              },
              // stylePosition: {type: String, enum: ["Default","Inner","Outer", "Both"]}
              stylePosition: {type: String,}
            }
          ],
        }
      ],
    

        DefaultButton: {
        type: Boolean,
        // required: true,
        },
        customButton: {
        type: String,
        // required: true,
        },


        DefaultButtonContrast: {
          type: Boolean,
            // required: true,
            },
            AllContrast: {
              type: Boolean,
            // required: true,
            },
            OnlyCuffsContrast: {
              type: Boolean,
                // required: true,
            },

            buttonHoles: {
                type: String,
                // required: true,
            },

            buttonThreads: {
                type: String,
                // required: true,
            },


            embroideryText: {
                type: String,
                // required: true,
            },

            embroideryFonts: {
                type: String,
                // required: true,
            },

            embroideryThreadColor: {
                type: String,
                // required: true,
            },

            embroideryThreadPosition: {
                type: String,
                // required: true,
            },

    }
  ],
}, { timestamps: true });

const CustomerContrast = mongoose.model('CustomerContrast', contrastSchema);

module.exports = CustomerContrast;