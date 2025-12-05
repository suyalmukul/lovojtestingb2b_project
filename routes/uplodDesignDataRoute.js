const express = require("express");
const { jwtAuth, jwtAuthAdmin, jwtAuthWorker,jwtAuthCommon } = require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const uploadOrderRouter = express.Router();
const uploadDataOrderController = require("../controllers/uploadDesignDataController");
const validateMiddleWare = require("../middleware/validate");
const JoiSchema = require("../validations/quickOrder.validation");



  /***************POST and UPDATE routes******************/
  
  uploadOrderRouter
    //get uplodDesign b2c data
    .get("/getUploadDesignData", jwtAuthCommon, uploadDataOrderController.getNotAssignedUploadDesignsForAdminDesigner)
  
    // //Create Contrast
    // .post("/order/customer/contrast", jwtAuthAdmin, QuickOrderController.createCustomerContrast)


  module.exports = uploadOrderRouter;





  