const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TemporaryReadymadeSchema = new Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'stores' },
  customerId: { type: mongoose.Schema.Types.ObjectId },
  storeName: {type: String},
  storeNumber: {type: String},
  readyMadeProducts: [{
    gender: { type: String, enum: ['Men', 'Women', 'Other'] },
    productName: { type: String, required: true },
    ReadymadeProductImage: { type: Array},
    productNumber: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productColor: { type: Array},
    productDiscount: {type: String},
    Product_Description: {type: String},
    Size: {
      type: {
        xxl: { type: Number },
        xl: { type: Number },
        l: { type: Number },
        m: { type: Number },
        s: { type: Number },
        xs: { type: Number },
      },
    },
    status: { type: Boolean, default: true }, // Indicates whether the product is selected or not
  }],
  readyMadeAccessories: [{
    gender: { type: String, enum: ['Men', 'Women', 'Other'] },
    accessoriesName: { type: String, required: true },
    ReadymadeAccessoriesImage: { type: String },
    accessoriesNumber: { type: String, required: true },
    accessoriesPrice: { type: Number, required: true },
    Quantity: { type: Number },
    status: { type: Boolean, default: true }, // Indicates whether the accessory is selected or not
  }],
  product: [{
    name: { type: String},
    productNumber: { 
      type: String, 
    },
    categories: [
      {
        name: { type: String, required: true },
        styles: [
          {
            styleName: { type: String },
            styleType: { type: String },
            styleImage: { type: String },
          }
        ],
      }
    ],
    fabricImage: { type: String },
    customerOwnFabricImage: { type: String },
    fabricName: { type: String, },
    fabricMaterial: { type: String, },
    fabricQuantity: { type: Number, required: true },
    quantityType: { type: String, required: true },
    perMeterPrice: { type: Number },
    fabDashNumber: { type: String },
    customNumber: { type: String },
    tilex: { type: Number },
    tiley: { type: Number },
    contrast: { type: Number },
    brightness: { type: Number },
    rotation: { type: Number },
    color: { type: String },
    glossy: { type: Boolean },
    status: { type: Boolean, default: true },
  }],
  productsMeasurement: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      MeasurmentType: {
        type: String,
      },
      name: {
        type: String,
        required: true,
      },
      customerFront: {
        type: String,
      },
      customerBack: {
        type: String,
      },
      customerSide: {
        type: String,
      },
      otherAngle: {
        type: Array,
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
          size: {
            type: String,
          },
          alt1: {
            type: String,
          },
          alt2: {
            type: String,
          },
        },
      ],
      status: { type: Boolean, default: true },
    }],
  productsSpecialInstruction: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
        required: true,
      },
      specialInstructions: [
        {
          instructionPhoto: {
            type: Array,
          },
          instructionNotes: {
            type: Array,
          },
          instructionVoice: {
            type: Array,
          },
          instructionHandNotes: {
            type: Array,
          },
        },
      ],
      status: { type: Boolean, default: true },
    },
  ],
  productsContrast: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
        required: true,
      },
      productScreenShot: {
        type: Array,
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
              },
              fabDashNumber: {
                type: String,
                // required: true,
              },
              stylePrice: {
                type: Number,
                // required: true,
              },
              // stylePosition: { type: String, enum: ["Default", "Inner","Outer","Both"] }
              stylePosition: {type: String},
              tilex: { type: Number },
              tiley: { type: Number },
              contrast: { type: Number },
              brightness: { type: Number },
              rotation: { type: Number },
              color: { type: String },
              glossy: { type: Boolean },
            }
          ],
        }
      ],


      DefaultButton: {
        type: String,//Boolean
        // required: true,
        },
      customButton: {
        type: String,
      },


      // DefaultButtonContrast: {
      //   type: Boolean,
      // },
      // AllContrast: {
      //   type: Boolean,
      // },
      // OnlyCuffsContrast: {
      //   type: Boolean,
      // },
      ButtonContrast:{
        type:String
      },

      buttonHoles: {
        type: String,
      },

      buttonThreads: {
        type: String,
      },


      embroideryText: {
        type: String,
      },

      embroideryFonts: {
        type: String,
      },

      embroideryThreadColor: {
        type: String,
      },

      embroideryThreadPosition: {
        type: String,
      },
      status: { type: Boolean, default: true },
    }
  ],

}, {
  timestamps: true,
});

const TemporaryReadymadeCartB2C = mongoose.model('TemporaryReadymadeCartB2C', TemporaryReadymadeSchema);

module.exports = TemporaryReadymadeCartB2C;
