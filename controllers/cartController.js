const Store = require("../models/stores");
const User = require("../models/user");
const mongoose = require("mongoose");
const Fabric = require("../models/fabric");
const { sendingEmail } = require("../utils/sendingEmail");

const AppError = require("../utils/errorHandler");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const uploadToS3 = require("../utils/s3Upload");
const Cart = require("../models/cart");



// Function to perform the update operation
function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve(result)) // Resolve with the updated result
      .catch((err) => reject(err));
  });
}



// API endpoint to add items to the cart
exports.addItemToCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      // If the cart already exists, update the cart by quantity
      let promiseArray = [];

      req.body.cartItems.forEach((cartItem) => {
        const fabric = cartItem.fabric;
        const item = cart.cartItems.find((c) => c.fabric == fabric);
        let condition, update;
        if (item) {
          condition = { user: req.user._id, "cartItems.fabric": fabric };
          update = {
            $set: {
              "cartItems.$.quantity": item.quantity + cartItem.quantity,
              "cartItems.$.price": item.price + (cartItem.price * cartItem.quantity), // Increment the price
            },
          };
        } else {
          condition = { user: req.user._id };
          update = {
            $push: {
              cartItems: {
                fabric: cartItem.fabric,
                quantity: cartItem.quantity,
                price: cartItem.price * cartItem.quantity, // Set the price based on quantity for a new item
              },
            },
          };
        }
        
        promiseArray.push(runUpdate(condition, update));
      });
      
      
      // Use Promise.all to wait for all update operations to complete
      Promise.all(promiseArray)
        .then((responses) => {
          console.log("Updated Cart:", responses); // Log the updated responses
          res.status(201).json({ updated: responses }); // Respond with updated data
        })
        .catch((error) => res.status(400).json({ error }));
    } else {
      // If the cart does not exist, create a new cart
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });
      cart.save((error, savedCart) => {
        if (error) return res.status(400).json({ error });
        if (savedCart) {
          console.log("Created Cart:", savedCart); // Log the created cart
          res.status(201).json({ cart: savedCart }); // Respond with the created cart
        }
      });
    }
  });
};





/*************************************************************/

// const AppError = require("../utils/errorHandler");
// const { catchAsyncError } = require("../middleware/catchAsyncError");
// const uploadToS3 = require("../utils/s3Upload");
// const Cart = require("../models/cart");

// // Function to perform the update operation
// async function runUpdate(condition, updateData) {
//   try {
//     const result = await Cart.findOneAndUpdate(condition, updateData, { upsert: true });
//     return result; // Resolve with the updated result
//   } catch (err) {
//     throw err;
//   }
// }

// // API endpoint to add items to the cart
// exports.addItemToCart = catchAsyncError(async (req, res) => {
//   const cart = await Cart.findOne({ user: req.user._id }).exec();

//   if (cart) {
//     // If the cart already exists, update the cart by quantity
//     let promiseArray = [];

//     req.body.cartItems.forEach((cartItem) => {
//       const fabric = cartItem.fabric;
//       const item = cart.cartItems.find((c) => c.fabric == fabric);
//       let condition, update;
//       if (item) {
//         condition = { user: req.user._id, "cartItems.fabric": fabric };
//         update = {
//           $set: {
//             "cartItems.$.quantity": item.quantity + cartItem.quantity,
//             "cartItems.$.price": item.price + (cartItem.price * cartItem.quantity), // Increment the price
//           },
//         };
//       } else {
//         condition = { user: req.user._id };
//         update = {
//           $push: {
//             cartItems: {
//               fabric: cartItem.fabric,
//               quantity: cartItem.quantity,
//               price: cartItem.price * cartItem.quantity, // Set the price based on quantity for a new item
//             },
//           },
//         };
//       }

//       promiseArray.push(runUpdate(condition, update));
//     });

//     // Use Promise.all to wait for all update operations to complete
//     try {
//       const responses = await Promise.all(promiseArray);
//       console.log("Updated Cart:", responses); // Log the updated responses
//       res.status(201).json({ updated: responses }); // Respond with updated data
//     } catch (error) {
//       res.status(400).json({ error });
//     }
//   } else {
//     // If the cart does not exist, create a new cart
//     const cart = new Cart({
//       user: req.user._id,
//       cartItems: req.body.cartItems,
//     });

//     try {
//       const savedCart = await cart.save();
//       console.log("Created Cart:", savedCart); // Log the created cart
//       res.status(201).json({ cart: savedCart }); // Respond with the created cart
//     } catch (error) {
//       res.status(400).json({ error });
//     }
//   }
// });


/**************************************************************/



exports.getCartItems = (req, res) => {
  //const { user } = req.body.payload;
  //if(user){
  Cart.findOne({ user: req.user._id })
    .populate("cartItems.product", "_id name price productPictures")
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        let cartItems = {};
        cart.cartItems.forEach((item, index) => {
          cartItems[item.product._id.toString()] = {
            _id: item.product._id.toString(),
            name: item.product.name,
            img: item.product.productPictures[0].img,
            price: item.product.price,
            qty: item.quantity,
          };
        });
        res.status(200).json({ cartItems });
      }
    });
  //}
};



// new update remove cart items
exports.removeCartItems = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Cart.update(
      { user: req.user._id },
      {
        $pull: {
          cartItems: {
            product: productId,
          },
        },
      }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};






/***************************** UseLess Code ********************/





// function runUpdate(condition, updateData) {
//   return new Promise((resolve, reject) => {
//     //you update code here

//     Cart.findOneAndUpdate(condition, updateData, { upsert: true })
//       .then((result) => resolve())
//       .catch((err) => reject(err));
//   });
// }

// exports.addItemToCart = (req, res) => {
//   Cart.findOne({ user: req.user._id }).exec((error, cart) => {
//     if (error) return res.status(400).json({ error });
//     if (cart) {
//       //if cart already exists then update cart by quantity
//       let promiseArray = [];

//       req.body.cartItems.forEach((cartItem) => {
//         const product = cartItem.product;
//         const item = cart.cartItems.find((c) => c.product == product);
//         let condition, update;
//         if (item) {
//           condition = { user: req.user._id, "cartItems.product": product };
//           update = {
//             $set: {
//               "cartItems.$": cartItem,
//             },
//           };
//         } else {
//           condition = { user: req.user._id };
//           update = {
//             $push: {
//               cartItems: cartItem,
//             },
//           };
//         }
//         promiseArray.push(runUpdate(condition, update));
//       });
//       Promise.all(promiseArray)
//         .then((response) => res.status(201).json({ response }))
//         .catch((error) => res.status(400).json({ error }));
//     } else {
//       //if cart not exist then create a new cart
//       const cart = new Cart({
//         user: req.user._id,
//         cartItems: req.body.cartItems,
//       });
//       cart.save((error, cart) => {
//         if (error) return res.status(400).json({ error });
//         if (cart) {
//           return res.status(201).json({ cart });
//         }
//       });
//     }
//   });
// };


// exports.getCartItems = (req, res) => {
//   //const { user } = req.body.payload;
//   //if(user){
//   Cart.findOne({ user: req.user._id })
//     .populate("cartItems.product", "_id name price productPictures")
//     .exec((error, cart) => {
//       if (error) return res.status(400).json({ error });
//       if (cart) {
//         let cartItems = {};
//         cart.cartItems.forEach((item, index) => {
//           cartItems[item.product._id.toString()] = {
//             _id: item.product._id.toString(),
//             name: item.product.name,
//             img: item.product.productPictures[0].img,
//             price: item.product.price,
//             qty: item.quantity,
//           };
//         });
//         res.status(200).json({ cartItems });
//       }
//     });
//   //}
// };

// // new update remove cart items
// exports.removeCartItems = (req, res) => {
//   const { productId } = req.body.payload;
//   if (productId) {
//     Cart.update(
//       { user: req.user._id },
//       {
//         $pull: {
//           cartItems: {
//             product: productId,
//           },
//         },
//       }
//     ).exec((error, result) => {
//       if (error) return res.status(400).json({ error });
//       if (result) {
//         res.status(202).json({ result });
//       }
//     });
//   }
// };