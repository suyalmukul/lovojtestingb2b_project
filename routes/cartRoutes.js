const express = require("express");
const {
  addItemToCart,
  addToCart,
  getCartItems,
  removeCartItems,
} = require("../controllers/cartController");


const {
    jwtAuth,
    jwtAuthAdmin,
    jwtAuthSuperAdmin,
    jwtAuthWorker,
  } = require("../middleware/jwtAuth");

  // const { upload } = require("../middleware/multer");
  const  upload  = require("../middleware/multer");
  const cartRouter = express.Router();
  const bodyParser = require("body-parser");
  
  cartRouter.use(bodyParser.json());
  
  cartRouter.post(
  "/user/addtocart",
  jwtAuthAdmin,
  addItemToCart
);

//router.post('/user/cart/addToCartByLogin', requireSignin, userMiddleware, addToCart);
cartRouter.post("/user/getCartItems", jwtAuthAdmin, getCartItems);
//new update
cartRouter.post(
  "/user/cart/removeItem",
  jwtAuthAdmin,
  removeCartItems
);

module.exports = cartRouter;