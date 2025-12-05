const express = require("express");
const {
  jwtAuth,
  jwtAuthAdmin,
  jwtAuthSuperAdmin,
  jwtAuthWorker,
} = require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const { registerCustomer, customerB2CLogin, existingCustomerMeasurement,getExestingCustomerMesurmentBy_id_Name } = require("../controllers/customerController");
const customerRouter = express.Router();


customerRouter.post('/register', registerCustomer)
customerRouter.post('/login', customerB2CLogin)
customerRouter.post('/measurement',jwtAuthAdmin, existingCustomerMeasurement)
customerRouter.get('/getExestingMeasurement/:customerId',jwtAuthAdmin, getExestingCustomerMesurmentBy_id_Name)

module.exports = customerRouter;