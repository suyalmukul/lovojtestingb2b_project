// const mongoose = require('mongoose');

// // Define the schema
// const Schema = mongoose.Schema;

// // Define the product schema
// const ProductSchema = new Schema({
//   storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores"},

//  //storeId: { type: String, required: [true, "Store ID is required"] },
//   name: {
//     type: String,
//     required: true,
//   },
//   productImage: {
//     type: String,
//   },
//   gender: {
//     name: {
//       type: String,
//       enum: ['Men', 'Women','Other'],
//       required: true,
//     },
//     categories: [
//       {
//         name: {
//           type: String,
//           required: true,
//         },
//         subcategories: [
//           {
//             name: {
//               type: String,
//               required: true,
//             },
//             subCatImage: {
//               type: String,
//               required: [true, 'Fabric image is required'],
//             },
//             subCatNumber: {
//               type: String,
//             },
//           },
//         ],
//       },
//     ],
//   },
// },
// {
//   timestamps: true, // Adds createdAt and updatedAt automatically
// });

// // Create a model based on the schema
// const Product = mongoose.model('Product', ProductSchema);

// module.exports = Product;
