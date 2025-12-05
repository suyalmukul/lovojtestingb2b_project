const express = require("express");
const {jwtAuth, jwtAuthAdmin }= require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const settingRouter = express.Router();
const { createTax,getTaxByStoreId,createCoupon} = require("../controllers/settingsController")
const{ getNotification }= require("../controllers/notificationController")

/************************ Settings Tax Api ************************/
settingRouter.post(
  "/add/setting/tax",
  jwtAuthAdmin,
  createTax
  );


  settingRouter.get(
    "/get/setting/tax",
    jwtAuthAdmin,
    getTaxByStoreId
    );
  

/************************ Settings Coupon Api ************************/

settingRouter.post(
  "/add/setting/coupon",
  jwtAuthAdmin,
  createCoupon
  );


  settingRouter.get(
    "/add/setting/notifications",
    jwtAuthAdmin,
    getNotification
    );

module.exports = settingRouter;