
const mongoose = require('mongoose');

// Define the schema
const Schema = mongoose.Schema;

// Define the product schema
const ButtonSchema = new Schema({
storeId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
// required: [true, 'Store ID is required']
},

name: {
type: String,
required: true,
},

categories: [
{
name: {
type: String,
// default: "AllBodyButton",
required: true,
},
Buttons: [
{
name: {
type: String,
required: true,
},
buttonImage: {
type: String,
required: [true, 'Fabric image is required'],
},
},
],
},
],
}, {
timestamps: true, // Adds createdAt and updatedAt automatically
});

// Create a model based on the schema
const Button = mongoose.model('Button',ButtonSchema);

module.exports =Button;





