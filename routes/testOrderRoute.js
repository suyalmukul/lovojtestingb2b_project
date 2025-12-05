const express = require("express");
const {
  newOrder,
//   getSingleOrder,
//   myOrders,
//   getAllOrders,
//   updateOrder,
//   deleteOrder,
//
} = require("../controllers/testOrderController");

const {
    jwtAuth,
    jwtAuthAdmin,
    jwtAuthSuperAdmin,
  } = require("../middleware/jwtAuth");


const orderRouter = express.Router();
const bodyParser = require("body-parser");

orderRouter.use(bodyParser.json());



orderRouter.post("/order/new", jwtAuthAdmin, newOrder);



// router.route("/order/new").post(isAuthenticatedUser, newOrder);

// router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

// router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// router
//   .route("/admin/orders")
//   .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

// router
//   .route("/admin/order/:id")
//   .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = orderRouter;
