const express = require("express");
const { jwtAuthAdmin } = require("../middleware/jwtAuth");
const designerController = require("../controllers/designerController");
const designerRouter = express.Router();




/****************** Add Fabric For Admin *******************/
designerRouter.get('/order', jwtAuthAdmin, designerController.getDesignerOrder)
/****************** Add Fabric For Admin For Starting Page *******************/



module.exports = designerRouter;


