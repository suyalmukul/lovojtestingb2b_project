const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetsSchema = new Schema({
//   stylist_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  page: { type: String, required: true },
  file:{type:String, required: true},
  name: { type: String, required: true },
  format: { type: String,required: true  },

}, 
{ timestamps: true });


const asset = mongoose.model('asset', assetsSchema);

module.exports = asset;
