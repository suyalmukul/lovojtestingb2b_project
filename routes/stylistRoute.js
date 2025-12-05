const express = require("express");
const { jwtAuth, jwtAuthAdmin, jwtAuthCommon } = require("../middleware/jwtAuth");
const validateMiddleWare = require("../middleware/validate");
const JoiSchema = require("../validations/stylist.validation");
const stylistRouter = express.Router();

const stylistController = require("../controllers/stylistController");
/************************ Stylist Route Api ************************/


stylistRouter
   //serch superadmin products
   .get('/search-product', jwtAuthCommon, stylistController.searchSuperadminProducts)
   .get('/search-fabric', jwtAuthCommon, stylistController.searchSuperadminFabrics)
   .get('/search-mesurement', jwtAuthCommon, stylistController.searchSuperadminMeasurements)
   .get('/search-designerCreation', jwtAuthCommon, stylistController.searchDesignerCreation)

   //search-designerCreation\

   //    .post('/addProduct', stylistController.addData)
   .post('/product', jwtAuthCommon, validateMiddleWare(JoiSchema.stylistAddProductJoiSchema), stylistController.addProduct)
   .put('/product', jwtAuthCommon, validateMiddleWare(JoiSchema.stylistUpdateProductJoiSchema), stylistController.updateProduct)
   .post('/measurement-contrast/:product_id', jwtAuthCommon, validateMiddleWare(JoiSchema.stylistAddProductContrastAndMeasurment), stylistController.addProductContrastAndMeasurment)
   // .put('/update-product/:product_id', jwtAuthCommon,validateMiddleWare(JoiSchema.stylistAddAndUpdateProductJoiSchema),stylistController.addAndUpdateData)

   //    .get('/getCartData',stylistController.cartdata)
   .get('/cart/:appointment_id', jwtAuthCommon, stylistController.cartdata)
   //    .delete('/deleteCartData',stylistController.deleteCartData)
   .delete('/deleteCartData', jwtAuthCommon, stylistController.deleteCartData)
   //    .post('/createOrder',stylistController.createOrder)
   .post('/order', jwtAuthCommon, stylistController.createOrder)
   .get('/appointments', jwtAuthCommon, stylistController.getStylistAppointmentList)
   .put('/appointments/status', jwtAuthCommon, stylistController.putStylistAppointment)

   .put('/start-journey', jwtAuthCommon, stylistController.updatePendingAppointments)


   .put('/product-pricing', stylistController.updateProductsPricing)

   .put('/change_status/:id', jwtAuthCommon, stylistController.updateStatus)

   .post('/send_otp', jwtAuthCommon, stylistController.sendOtp)
   .get('/appointments/:status', jwtAuthCommon, stylistController.stylistAppointmentStatuses)

   //stylistmyorder
   .get('/myorder', jwtAuthCommon, stylistController.stylistmyorder)

   .get('/admin_myorder', jwtAuthAdmin, stylistController.adminmyorder)
   //adminmyorder

   .get('/CustomerData/:id', stylistController.getCustomerDataByAppointmentId)
   .delete('/product-contrast', stylistController.deleteProductContrast);

//    .put('/updateProduct', jwtAuthCommon, stylistController.createCustomerMeasurementB2C)
//    .get('/getProduct', jwtAuthCommon, stylistController.createSpecialInstruction)
//    .delete('/deleteProduct', jwtAuthCommon, stylistController.createSpecialInstruction)




module.exports = stylistRouter;