const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SuperadminPatternSchema = new Schema({
  //   storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women','Other'],
    required: true,
  },
  categoriename: {
    type: String,
    required: true,
  },
  patterns: [
    {
      name: {
        type: String,
        required: true,
      },
      patternImage: {
        type: String,
        required: [true, 'Fabric image is required'],
      },
      patternNumber: {
        type: String,
      },
    },
  ],
}, {
  timestamps: true,
});

const SuperadminPattern = mongoose.model('SuperadminPattern', SuperadminPatternSchema);

module.exports = SuperadminPattern;
