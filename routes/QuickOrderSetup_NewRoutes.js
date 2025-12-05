const express = require("express");
const {
  jwtAuth,
  jwtAuthAdmin,
  jwtAuthAdminandUser,
  jwtAuthSuperAdmin,
  jwtAuthWorker,
} = require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const {
  superadminCreateProduct,
  superadminProductSubproduct_Images,
  superadminDeleteProductById,
  superadminGetAllProducts,

  adminCreateProduct,
  adminProductSubproduct_Images,
  getAdminProductsByStoreId,
  toggleStyleFlag,
  getStylesWithFlagTrueForProduct,
  getSuperadminProducts_ByAdmin,
  adminDeleteProductById,

  superadminCreateMesurment,
  superadminMesurment_Images,
  superadminGetMesurmentForAdmin,
  superadminGetAllMeasurements,
  superadminDeleteMeasurements,
  superadminUpdateMesurment,

  AdminCreateMesurment,
  adminMesurment_Images,
  adminGetMesurment,

  superadminCreateButton,
  superadminCreateButtonHole,
  superadminCreateButtonThread,
  superadminButton_Images,
  getAllSuperadminButtons,
  getAllSuperadminButtonHoles,
  getAllSuperadminButtonThreads,

  createAdminButton,
  createAdminButtonHole,
  createAdminButtonThread,
  adminButton_Images,
  getAllAdminButton,
  getAllAdminButtonHole,
  getAllAdminButtonThread,


  createSuperadminColors,
  createSuperadminFonts,
  getAllSuperadminColors,
  getAllSuperadminFonts,


  createAdminColor,
  createAdminFont,
  getAllAdminColor,
  getAllAdminFont,

  AdmincreateReadymadeProduct,
  AdminUpdateReadymadeProduct,
  AdminDeleteReadymadeProduct,
  AdminsearchReadymadeProducts,

  AdmincreateReadymadeAccessories,
  AdminUpdateReadymadeAccessories,
  AdminDeleteReadymadeAccessories,
  AdminsearchReadymadeAccessories,

  createManualPayment,
  adminQrCode_Images,
  getAdminManualPayment,

  superadminCreatePattern,
  superadminGetPatternForAdmin,

  /*******Update***/

  superadminUpdateStyle,
  superadminUpdateProductById,

  createSuperadminContrastStyle,
  getSuperadminContrastStyle,



  createProductMakingCharges,
  getProductMakingCharges


} = require("../controllers/QuickOrderSetup_NewController");
const NewQuickOrderSetupRouter = express.Router();
const bodyParser = require("body-parser");

NewQuickOrderSetupRouter.use(bodyParser.json());


/*************************** New strat with setup superadmin********************/

// post api superadmin

NewQuickOrderSetupRouter.post(
  "/superadmin_add-product",
  jwtAuthSuperAdmin,
  superadminCreateProduct
);


//superadminUpdateProductById
NewQuickOrderSetupRouter.put(
  "/superadmin_update-product/:id",
  jwtAuthSuperAdmin,
  superadminUpdateProductById
);


//post api setup images superadmin

NewQuickOrderSetupRouter.post(
  "/add-imagesSuperadmin_pro_sub",
  jwtAuthSuperAdmin,
  upload.fields([
    {
      name: "SuperadminProductPhoto",
      maxCount: 1,
    },
    {
      name: "SuperadminSubproductPhoto",
      maxCount: 50,
    },
    {
      name: "SuperadminStylePhoto",
      maxCount: 100,
    },
  ]),
  superadminProductSubproduct_Images
);


NewQuickOrderSetupRouter.delete(
  "/superadmin_delete-product/:objectId",
  jwtAuthSuperAdmin,
  superadminDeleteProductById
);



NewQuickOrderSetupRouter.get(
  "/superadmin_get-product",
  jwtAuthSuperAdmin,
  superadminGetAllProducts
);



/****************************** New strat with setup admin *************************/

//post api admin

NewQuickOrderSetupRouter.post(
  "/admin_add-product",
  jwtAuthAdmin,
  adminCreateProduct);


//post api setup images admin

NewQuickOrderSetupRouter.post(
  "/add-imagesAdmin_pro_sub",
  upload.fields([
    {
      name: "adminProductPhoto",
      maxCount: 1,
    },
    {
      name: "adminSubproductPhoto",
      maxCount: 50,
    },
    {
      name: "adminStylePhoto",
      maxCount: 100,
    },
  ]),
  jwtAuthAdmin,

  adminProductSubproduct_Images);




//get all get product get subproduct get styles query api //main
NewQuickOrderSetupRouter.get(
    "/get-admindatcaby/:storeId",
    // jwtAuthAdminandUser,
    getAdminProductsByStoreId);
  

//add toggle styles flag
NewQuickOrderSetupRouter.get(
      "/toggle-styles/:productId/flag/:styleId",
      jwtAuthAdmin,
      toggleStyleFlag);
    

//get data toggle style flag    

NewQuickOrderSetupRouter.get(
  "/toggle_styles/:productId",
  jwtAuthAdmin,
  getStylesWithFlagTrueForProduct);

  
//get superadmin data by admin query gender and category
 
NewQuickOrderSetupRouter.get(
  "/getSuperadminData_byAdmin",
  jwtAuthAdmin,
  getSuperadminProducts_ByAdmin);


//delete api
NewQuickOrderSetupRouter.delete(
  "/admin_delete-product/:productId",
  jwtAuthAdmin,
  adminDeleteProductById);

 


/*************************** New start with Measurment Superadmin *****************/

NewQuickOrderSetupRouter.post(
  "/superadmin_add-mesurment",
  jwtAuthSuperAdmin,
  superadminCreateMesurment);


  
  NewQuickOrderSetupRouter.post(
    "/add-imagesSuperadmin_mesurment",
    jwtAuthSuperAdmin,
    upload.fields([
      {
        name: "superadminMeasurmentphoto",
        maxCount: 100,
      },
    ]),
  
    superadminMesurment_Images);


    NewQuickOrderSetupRouter.get(
      "/admin_get-mesurmentSuperadmin",
      jwtAuthAdmin,
      superadminGetMesurmentForAdmin);
    

      NewQuickOrderSetupRouter.put(
        "/superadmin_update-mesurment/:id",
        jwtAuthSuperAdmin,
        superadminUpdateMesurment);
      



      //get own mesurment superadmin


    NewQuickOrderSetupRouter.get(
      "/superadmin_get-mesurment",
      jwtAuthSuperAdmin,
      superadminGetAllMeasurements);
    

      NewQuickOrderSetupRouter.delete(
        "/superadmin_delete-mesurment/:objectId",
        jwtAuthSuperAdmin,
        superadminDeleteMeasurements);
      



  /******************** New Start With Admin own mesurment *****************/



  NewQuickOrderSetupRouter.post(
    "/admin_add-mesurment",
    jwtAuthAdmin,
    AdminCreateMesurment);
  


    NewQuickOrderSetupRouter.post(
      "/add-imagesAdmin_mesurment",
      upload.fields([
        {
          name: "adminMeasurmentphoto",
          maxCount: 100,
        },
      ]),
      jwtAuthAdmin,
      adminMesurment_Images);



      NewQuickOrderSetupRouter.get(
        "/admin_get-mesurment/:storeId",
        jwtAuthAdminandUser,
        adminGetMesurment);



/****************************** They All Is Contrast Part *********************/
/*************************** New Start With Buttons APIs **********************/      
//For Superadmin

NewQuickOrderSetupRouter.post(
  "/superadmin_add-button",
  jwtAuthSuperAdmin,
  superadminCreateButton);



  NewQuickOrderSetupRouter.post(
  "/superadmin_add-buttonhole",
  jwtAuthSuperAdmin,
  superadminCreateButtonHole);



  NewQuickOrderSetupRouter.post(
  "/superadmin_add-buttonthread",
  jwtAuthSuperAdmin,
  superadminCreateButtonThread);




  NewQuickOrderSetupRouter.post(
  "/add-ButtonImages_superadmin",
  jwtAuthSuperAdmin,
  upload.fields([
    {
      name: "superadminButtonPthoto",
      maxCount: 100,
    },
    {
      name: "superadminButtonHolePthoto",
      maxCount: 100,
    },
    {
      name: "superadminButtonThreadPthoto",
      maxCount: 100,
    },
  ]),

  superadminButton_Images);





NewQuickOrderSetupRouter.get(
  "/admin_get-button_superadmin",
  jwtAuthAdmin,
  getAllSuperadminButtons);



  NewQuickOrderSetupRouter.get(
  "/admin_get-buttonhole_superadmin",
  jwtAuthAdmin,
  getAllSuperadminButtonHoles);



  NewQuickOrderSetupRouter.get(
  "/admin_get-buttonthread_superadmin",
  jwtAuthAdmin,
  getAllSuperadminButtonThreads);


/*************************** New Start With Buttons APIs **********************/   
//For Admin




NewQuickOrderSetupRouter.post(
  "/admin_add-button",
  jwtAuthAdmin,
  createAdminButton);



  NewQuickOrderSetupRouter.post(
  "/admin_add-buttonhole",
  jwtAuthAdmin,
  createAdminButtonHole);



  NewQuickOrderSetupRouter.post(
  "/admin_add-buttonthread",
  jwtAuthAdmin,
  createAdminButtonThread);



  NewQuickOrderSetupRouter.post(
  "/add-ButtonImages_admin",
  upload.fields([
    {
      name: "adminButtonPthoto",
      maxCount: 100,
    },
    {
      name: "adminButtonHolePthoto",
      maxCount: 100,
    },
    {
      name: "adminButtonThreadPthoto",
      maxCount: 100,
    },
    jwtAuthAdmin,
  ]),

  adminButton_Images);


  NewQuickOrderSetupRouter.get(
    "/admin_get-button/:storeId",
    jwtAuthAdminandUser,
    getAllAdminButton);
  
  
  
    NewQuickOrderSetupRouter.get(
    "/admin_get-buttonhole/:storeId",
    jwtAuthAdminandUser,
    getAllAdminButtonHole);
  
  
  
    NewQuickOrderSetupRouter.get(
    "/admin_get-buttonthread/:storeId",
    jwtAuthAdminandUser,
    getAllAdminButtonThread);
  

/******************** New Start with color anf font APIs *****************/
//Superadmin
NewQuickOrderSetupRouter.post(
  "/superadmin_add-color",
  jwtAuthSuperAdmin,
  createSuperadminColors);



  NewQuickOrderSetupRouter.post(
  "/superadmin_add-font",
  jwtAuthSuperAdmin,
  createSuperadminFonts);


//
NewQuickOrderSetupRouter.get(
  "/admin_get-color_superadmin",
  jwtAuthAdmin,
  getAllSuperadminColors);



  NewQuickOrderSetupRouter.get(
  "/admin_get-font_superadmin",
  jwtAuthAdmin,
  getAllSuperadminFonts);


  //Admin

  NewQuickOrderSetupRouter.post(
    "/admin_add-color",
    jwtAuthAdmin,
    createAdminColor);
  
  
    NewQuickOrderSetupRouter.post(
    "/admin_add-font",
    jwtAuthAdmin,
    createAdminFont);



    NewQuickOrderSetupRouter.get(
      "/admin_get-color/:storeId",
      jwtAuthAdminandUser,
      getAllAdminColor);
    
    
      NewQuickOrderSetupRouter.get(
      "/admin_get-font/:storeId",
      jwtAuthAdminandUser,
      getAllAdminFont);
    


/******************** New Start with Readymade products APIs *****************/

    NewQuickOrderSetupRouter.post(
      "/admin-add-readymadeProduct",
      upload.fields([
        {
          name: "ReadymadeProductImage",
          maxCount: 5,
        },
      ]),
      jwtAuthAdmin,
      AdmincreateReadymadeProduct
    );


    NewQuickOrderSetupRouter.patch(
      "/admin-update-readymadeProduct/:productId",
      upload.fields([
        {
          name: "ReadymadeProductImage",
          maxCount: 5,
        },
      ]),
      jwtAuthAdmin,
      AdminUpdateReadymadeProduct
    );

    NewQuickOrderSetupRouter.delete(
      "/admin-delete-ReadymadeProduct/:productId",
      jwtAuthAdmin,
      AdminDeleteReadymadeProduct
    );

    NewQuickOrderSetupRouter.get(
      "/admin-search-ReadymadeProduct/:storeId",
      jwtAuthAdminandUser,
      AdminsearchReadymadeProducts
    );

/******************** New Start with Readymade Accessories APIs *****************/

    NewQuickOrderSetupRouter.post(
      "/admin-/add-readymadeAccessories",
      upload.fields([
        {
          name: "ReadymadeAccessoriesImage",
          maxCount: 5,
        },
      ]),
      jwtAuthAdmin,
      AdmincreateReadymadeAccessories
    );

    NewQuickOrderSetupRouter.patch(
      "/admin-update-readymadeAccessories/:accessoriesId",
      upload.fields([
        {
          name: "ReadymadeAccessoriesImage",
          maxCount: 5,
        },
      ]),
      jwtAuthAdmin,
      AdminUpdateReadymadeAccessories
    );


    NewQuickOrderSetupRouter.delete(
      "/admin-delete-readymadeAccessories/:accessoriesId",
      jwtAuthAdminandUser,
      AdminDeleteReadymadeAccessories
    );

    NewQuickOrderSetupRouter.get(
      "/admin-/search-readymadeAccessories/:storeId",
      jwtAuthAdminandUser,
      AdminsearchReadymadeAccessories
    );


    NewQuickOrderSetupRouter.post(
      "/admin-add/manualPayment",
      jwtAuthAdmin,
      createManualPayment
    );

    NewQuickOrderSetupRouter.post(
      "/admin-/add-qrimage",
      upload.fields([
        {
          name: "adminQrImages",
          maxCount: 5,
        },
      ]),
      jwtAuthAdmin,
      adminQrCode_Images   
      );


    NewQuickOrderSetupRouter.get(
      "/admin-get/manualPayment",
      jwtAuthAdmin,
      getAdminManualPayment
    );


/*************************** Patterns *********************/

NewQuickOrderSetupRouter.post(
  "/superadmin_add_Patterns",
  jwtAuthSuperAdmin,
  superadminCreatePattern);


  NewQuickOrderSetupRouter.get(
    "/superadmin_get_Patterns_admin",
    jwtAuthAdmin,
    superadminGetPatternForAdmin);
  


  /*********************** Update Api Routes For Superadmin *******************/

  NewQuickOrderSetupRouter.put(
    "/superadmin_Product/:productId/update/:subcategoryId",
    jwtAuthSuperAdmin,
    superadminUpdateStyle);
  
  
    /**********************************Contrast Styles ******************/

  NewQuickOrderSetupRouter.post(
    "/superadmin_add-contrastStyles",
    jwtAuthSuperAdmin,
    createSuperadminContrastStyle
  );
/************ For Superadmin **********/
  NewQuickOrderSetupRouter.get(
    "/superadmin_get-contrastStyles",
    jwtAuthSuperAdmin,
    getSuperadminContrastStyle
  );

  /************ For Admin **********/
  NewQuickOrderSetupRouter.get(
    "/superadmin_get-contrastStylesForAdmin",
    jwtAuthAdmin,
    getSuperadminContrastStyle
  );






  NewQuickOrderSetupRouter.post(
    "/superadmin-add-makingcharges",
    createProductMakingCharges
  );

  NewQuickOrderSetupRouter.get(
    "/superadmin-get-makingcharges",
    getProductMakingCharges
  );
  



module.exports = NewQuickOrderSetupRouter;





