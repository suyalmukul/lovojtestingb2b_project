const express = require("express");
const { jwtAuth, jwtAuthAdmin, jwtAuthWorker,jwtAuthCommon,jwtAuthAdminWorker } = require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const quickOrderRouter = express.Router();
const QuickOrderController = require("../controllers/QuickOrderController");
const validateMiddleWare = require("../middleware/validate");
const JoiSchema = require("../validations/quickOrder.validation");




/************************ QuickOrder Images ************************/
quickOrderRouter.post(
  "/order/customer/images",
  upload.fields([
    {
      name: "QuickOrderImages",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,

  QuickOrderController.uploadQucikOrderImages
);


quickOrderRouter.post(
  "/order/customer/images1",
  upload.fields([
    {
      name: "QuickOrderImages1",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  QuickOrderController.uploadQuickOrderImages1
);



/*******************************************************************/


quickOrderRouter.get("/order/customer/:id", jwtAuthAdmin, QuickOrderController.getCustomerById);


quickOrderRouter.post(
  "/order/customers",
  upload.fields([
    {
      name: "customerFront",
      maxCount: 1,
    },
    {
      name: "customerBack",
      maxCount: 1,
    },
    {
      name: "customerSide",
      maxCount: 1,
    },

  ]),
  jwtAuthAdmin,
  QuickOrderController.createCustomers
);



quickOrderRouter.put(
  "/order/customersUpdate/:customerId",
  upload.fields([
    {
      name: "customerFront",
      maxCount: 1,
    },
    {
      name: "customerBack",
      maxCount: 1,
    },
    {
      name: "customerSide",
      maxCount: 1,
    },

  ]),
  jwtAuthAdmin,
  QuickOrderController.createOrUpdateCustomer
);

quickOrderRouter.delete("/customer/delete/:customerId", jwtAuthAdmin, QuickOrderController.deleteCustomer);


quickOrderRouter.post("/customer/quickorderstatus", jwtAuthAdmin, QuickOrderController.markQuickOrderStatus);
//download pdf
quickOrderRouter.get("/customer/downloadPdf", QuickOrderController.downloadPDF);

quickOrderRouter.post("/customer/discardCustomerData", jwtAuthAdmin, QuickOrderController.discardCustomerData);


quickOrderRouter.get("/customer/searchCustomer", jwtAuthAdmin, QuickOrderController.searchCustomer);
quickOrderRouter.get("/customer/searchCustomerByOrderNumber", jwtAuthAdmin, QuickOrderController.searchCustomerByOrderNumnber);

quickOrderRouter.get("/order/orderDetails", jwtAuthAdmin,validateMiddleWare(JoiSchema.orderDetailsByOrderNumberSchema), QuickOrderController.orderDetailsByOrderNumnber);

quickOrderRouter.get("/order/customerListingpagination",validateMiddleWare(JoiSchema.getCustomerListing1Schema) , jwtAuthAdmin, QuickOrderController.getCustomerListing1);

quickOrderRouter.get("/customer/inactiveorders", jwtAuthAdmin, QuickOrderController.getInActiveQuickOrdersWithAggregation);

quickOrderRouter.get("/order/customer", jwtAuthAdmin, QuickOrderController.getCustomers);
quickOrderRouter.get("/order/customerListing", jwtAuthAdmin, QuickOrderController.getCustomerListing);



/*******************************************************/
/***************Customer Product api *******************/


quickOrderRouter.post(
  "/order/customerProduct",
  upload.fields([
    {
      name: "customerOwnFabricImage",
      maxCount: 1,
    },

  ]),
  jwtAuthAdmin,
  QuickOrderController.createCustomerProduct
);


quickOrderRouter.put(
  "/order/customerUpdateProduct/:id",
  jwtAuthAdmin,
  QuickOrderController.updateCustomerProduct
);


/*******************************************************/
/***************Customer Alteration api *******************/


quickOrderRouter.post(
  "/order/customerAlterationProduct",
  jwtAuthAdmin,
  QuickOrderController.createCustomerAlterationProduct
);



/****************** Get Routes ***************/
quickOrderRouter
  .get("/order/getCustomerProducts", jwtAuthAdmin, QuickOrderController.getAllCustomerProducts)
  .get("/order/getCustomerProduct/:customerId", jwtAuthAdmin, QuickOrderController.getCustomerProductById)


/*******************************************************/
/****************** Customer Mesurmet api ***************/
quickOrderRouter.post(
  "/order/customer/mesurment",
  upload.fields([
    {
      name: "customerOwnMeasurmentImage",
      maxCount: 1,
    },

  ]),
  jwtAuthAdmin,
  QuickOrderController.createCustomerMesurment
);



/*******************************************************/
/****************** Customer Mesurmet Altreation api ***************/
quickOrderRouter.post(
  "/order/customer/mesurmentAltreation",
  jwtAuthAdmin,
  QuickOrderController.createCustomerAlterationMesurment
);



quickOrderRouter.get(
  "/customer/allmesurment",
  jwtAuthAdmin,
  QuickOrderController.getAllCustomerMesurments
);


quickOrderRouter.get(
  "/customer/allmesurment/:customerId",
  jwtAuthAdmin,
  QuickOrderController.getCustomerMesurmentBy_id_Name
);







//instruction images upload api  
quickOrderRouter.post(
  "/order/customer/splInstructions/ImgNoteVoice",
  upload.fields([
    {
      name: "InstructionPhoto",
      maxCount: 20,
    },  
    {
      name: "InstructionNotes",
      maxCount: 20,
    },  
    {
      name: "InstructionVoice",
      maxCount: 20,
    },  

  ]),jwtAuthAdmin,
 
  QuickOrderController.Instruction_Image_Note_Voice
);  



/******************************** Contrast Api **********************/



//contrast style images upload api
quickOrderRouter.post(
  "/order/customer/contrast_StyleImage",
  upload.fields([
    {
      name: "contrastStylePhoto",
      maxCount: 20,
    },  
    jwtAuthAdmin,
  ]), QuickOrderController.ContrastImages);  




  /***************POST and UPDATE routes******************/
  
  quickOrderRouter
    //Special Instructions 
    .post("/order/customer/splInstructions", jwtAuthAdmin, QuickOrderController.createSpecialInstruction)

    //createAlterationSpecialInstruction
    .post("/order/customer/splInstructionsAltreation", jwtAuthAdmin, QuickOrderController.createAlterationSpecialInstruction)

  
    //Create Contrast
    .post("/order/customer/contrast", jwtAuthAdmin, QuickOrderController.createCustomerContrast)
  
    //Create Readymade Product
    .post("/order/customer/readymadeProduct", jwtAuthAdmin, QuickOrderController.createCustomerReadymadeProduct)
  
    //Create Readymade Accessories
    .post("/order/customer/readymadeAccessories", jwtAuthAdmin, QuickOrderController.createCustomerReadymadeAccessories)
  
    // Update Readymade Product
    .put("/order/customer/updateReadymadeProduct", jwtAuthAdmin, QuickOrderController.updateCustomerReadymadeProduct)
  
    //Update Readymade Accessories
    .put("/order/customer/updateReadymadeAccessories", jwtAuthAdmin, QuickOrderController.updateCustomerReadymadeAccessories)
  
    //Create Custome Invoice
    .post("/order/customer/ivoice", jwtAuthAdmin, QuickOrderController.createCustomerInvoice)
  
    //Toggle Active Status of Order
   .post("/order/activestatus", jwtAuthAdmin, QuickOrderController.toggleOrderActiveStatus)

   //Not Assinged
   .post("/order/notAssigned", jwtAuthWorker,validateMiddleWare(JoiSchema.notAssignedProductsSchema), QuickOrderController.notAssigned)

   //Completed and Inprogress
   .post("/order/worker/myorders", jwtAuthWorker,validateMiddleWare(JoiSchema.myOrdersForWorkerSchema), QuickOrderController.myOrdersForWorker)

   //Order Listing for Workers
   .get("/order/worker/orderlisting", jwtAuthWorker,validateMiddleWare(JoiSchema.orderListingforWorkersSchema), QuickOrderController.orderListingforWorkers)

   //Order Listing Test by order number
   .get("/order/orderdetails/test", jwtAuthAdmin,validateMiddleWare(JoiSchema.orderDetailsByOrderNumberTestSchema), QuickOrderController.orderDetailsByOrderNumberTest)

   //Delete product test route
   .delete("/order/deleteproduct", jwtAuthAdmin,validateMiddleWare(JoiSchema.deleteProductDetailsSchema) ,QuickOrderController.deleteProductDetails)

   //get notassigned product test route
   .get("/order/productlisting/notassigned", jwtAuthAdminWorker,QuickOrderController.workerNotAssignedProductsListing)


   //testing
   .get("/order/productlisting/notassignedss", jwtAuthCommon,QuickOrderController.workerNotAssignedProductsListingsss)
   


   // Get failed products for master tailor
   .get("/order/failedProductsMasterTailor", jwtAuthWorker, QuickOrderController.masterTailorFailedListing)

   // Get failed products for master tailor
   .post("/order/updateRealignByMastertailor", jwtAuthWorker, QuickOrderController.updateRealignByMastertailor)


     quickOrderRouter.put(
       "/order/cutterUpdateProduct",
       jwtAuthAdminWorker,
       validateMiddleWare(JoiSchema.updateCutterStatusSchema),  // validationg middleware
       QuickOrderController.updateCutterStatus);  
     



       //testing
       quickOrderRouter.put(
        "/order/cutterUpdateProductss",
        jwtAuthCommon,
        validateMiddleWare(JoiSchema.updateCutterStatusSchema),  // validationg middleware
        QuickOrderController.updateCutterStatusss);  
      


        quickOrderRouter.put(
          "/order/adminUpdateProduct",
          jwtAuthAdmin,
          validateMiddleWare(JoiSchema.updateCutterStatusSchema),  // validationg middleware
          QuickOrderController.updateAllStatus);  
        
   

//updateAllStatus

   
       quickOrderRouter.get(
         "/order/cutterGet_Cust_Pro",
         jwtAuthWorker,
         QuickOrderController.getCustomerListing1ForWorker);
         
         
       quickOrderRouter.get(
         "/order/cutterGet_Cust_Pro_Cutter",
         jwtAuthWorker,
         QuickOrderController.getCustomerOrderStatusForCutter);  


         quickOrderRouter.post(
          "/order/qcFail_ForMaster",
          jwtAuthWorker,
          QuickOrderController.qcPassFailSurvey);  



         /**************************** delivery testing admin *****************/ 
         quickOrderRouter.put(
          "/order/adminDelivery",
          jwtAuthAdminWorker,
          QuickOrderController.updateDeliveryStatus);  






          /******************** Appointement Routes (Measurmentsss)*********/

            quickOrderRouter.get(
            "/order/notAssignedAppointement",
            jwtAuthCommon,
            QuickOrderController.getNotAssignedStylish);  
   
            
            quickOrderRouter.post(
            "/order/acceptAppointement",
            jwtAuthCommon,
            validateMiddleWare(JoiSchema.accpetAppointmentStylishSchema),
            QuickOrderController.accpetAppointmentStylish);  


            quickOrderRouter.post(
            "/order/sendFirstOtpAppointement",
            jwtAuthCommon,
            QuickOrderController.createStylishOtp);  

             quickOrderRouter.get(
              "/order/getOrdersForAppointement",
              jwtAuthCommon,
              QuickOrderController.orderDetailsByOrderNumnberForStylist);  
    
            quickOrderRouter.get(
              "/order/getStylihMeasurment/:storeId/:categoriename",
              jwtAuthCommon,
               QuickOrderController.getMeasurementsForStylish);  
    
            quickOrderRouter.post(
            "/order/addMeasurmentAppointement",
            jwtAuthCommon,
            QuickOrderController.createCustomerMesurmentForStylist);  

            quickOrderRouter.get(
              "/order/getOrdersCompleteOrIncomplete",
              jwtAuthCommon,
              QuickOrderController.getOrderStatusForStylish);  
  
          ///////// New Stylish Associated APIs
            quickOrderRouter.get(
              "/order/getOrdersForStylish",
              jwtAuthCommon,
              QuickOrderController.getCustomerListingForAssositedStylish
            );
    

  /***************************** Direct Appointment  ***************************/    
     // Accept Direct Appointment
     quickOrderRouter .post("/order/directAppointment", jwtAuthCommon, QuickOrderController.directAppointmentStylish)

     // update Order to Direct Appointment Stylish
     quickOrderRouter.post("/order/updateOrderToDirectAppointmentStylish", jwtAuthCommon, QuickOrderController.updateOrderToDirectAppointmentStylish)
  
     // Get Stylish inprogress or completedOrder
     quickOrderRouter.get("/order/getStylishAppointmentWorkLogs", jwtAuthCommon, QuickOrderController.getStylishAppointmentWorkLogs)
             



     //altreationnnn

   .get("/order/productlisting/altreationNotassigneds", jwtAuthAdminWorker,QuickOrderController.altreationNotAssignedProductsListings)
   

   //customer addresssssssssssss
   .post("/customers/addresses",jwtAuthCommon, QuickOrderController.createCustomerAddress) 
   .get("/customers/:customerId/addresses",jwtAuthCommon, QuickOrderController.getCustomerAddresses) 
   .put("/customers/:customerId/addresses/:addressId",jwtAuthCommon, QuickOrderController.updateCustomerAddress) 
   .delete("/customers/:customerId/addresses/:addressId",jwtAuthCommon, QuickOrderController.deleteCustomerAddress) 
 


  module.exports = quickOrderRouter;



    
