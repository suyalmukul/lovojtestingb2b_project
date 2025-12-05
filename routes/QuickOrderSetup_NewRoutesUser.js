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
    universalImagePicker,
    adminCreateProductForUser,
    adminUpdateProductForUser,
    adminGetSeenProductForUser,
    adminGetProductForUser,
    
    adminCreateMesurmentForUser,
    getMeasurementsForUser,

    adminCreateContrastStyle,
    getAdminContrastStyle,

    AdmincreateReadymadeProductForUser,
    AdminUpdateReadymadeProductForUser,
    AdminDeleteReadymadeProductForUser,
    AdminsearchReadymadeProductsForUser,

    getReadymadeProductById,

    AdmincreateReadymadeAccessoriesForUser,
    AdminUpdateReadymadeAccessoriesForUser,
    AdminDeleteReadymadeAccessoriesForUser,
    AdminsearchReadymadeAccessoriesForUser,


} = require("../controllers/QuickOrderSetup_NewControllerForUser");
const NewQuickOrderSetupUserRouter = express.Router();
const bodyParser = require("body-parser");

NewQuickOrderSetupUserRouter.use(bodyParser.json());


/*************************** New strat with setup superadmin********************/

/****************** Universal Image Picker Route ************/

NewQuickOrderSetupUserRouter.post(
  "/universalImage-Picker",
  // jwtAuthAdminandUser,
  upload.fields([
    {
      name: "adminProductsImage",
      maxCount: 5,
    }, 
    {
      name: "adminFabricsImage",
      maxCount: 5,
    },

  ]), 
  universalImagePicker
);





NewQuickOrderSetupUserRouter.post(
  "/admin_add-product-foruser",
  jwtAuthAdmin,
  adminCreateProductForUser
);

NewQuickOrderSetupUserRouter.patch(
  "/admin_update-product-foruser/:id",
  jwtAuthAdmin,
  adminUpdateProductForUser
);

NewQuickOrderSetupUserRouter.get(
  "/admin_get-productseen-foruser/:storeId",
  adminGetSeenProductForUser
);

NewQuickOrderSetupUserRouter.get(
  "/admin_get-product-foruser/:storeId/:productName",
  adminGetProductForUser
);


/*********************** Measurment *******************/


NewQuickOrderSetupUserRouter.post(
  "/admin_add-measurment-foruser",
  jwtAuthAdmin,
  adminCreateMesurmentForUser
);


NewQuickOrderSetupUserRouter.get(
  "/admin_get-measurment-foruser/:storeId/:categoriename",
  jwtAuthAdminandUser,
  getMeasurementsForUser
);


/*********************** Contrast *******************/
NewQuickOrderSetupUserRouter.post(
  "/admin_add-contrast-foruser",
  jwtAuthAdmin,
  adminCreateContrastStyle
);

NewQuickOrderSetupUserRouter.get(
  "/admin_get-contrast-foruser/:storeId/:productName",
  jwtAuthAdminandUser,
  getAdminContrastStyle
);


//getAdminContrastStyle

/******************* Readymade Product Section Routes For Users ****************/

NewQuickOrderSetupUserRouter.post(
  "/admin-add-readymadeProductForUser",
  upload.fields([
    {
      name: "ReadymadeProductImage",
      maxCount: 5,
    },
  ]),
  jwtAuthAdmin,
  AdmincreateReadymadeProductForUser
);


NewQuickOrderSetupUserRouter.patch(
  "/admin-update-readymadeProductForUser/:productId",
  upload.fields([
    {
      name: "ReadymadeProductImage",
      maxCount: 5,
    },
  ]),
  jwtAuthAdmin,
  AdminUpdateReadymadeProductForUser
);

NewQuickOrderSetupUserRouter.delete(
  "/admin-delete-ReadymadeProductForUser/:productId",
  jwtAuthAdmin,
  AdminDeleteReadymadeProductForUser
);

NewQuickOrderSetupUserRouter.get(
  "/admin-search-ReadymadeProductForUser",
  AdminsearchReadymadeProductsForUser
);

//getReadymadeProductById


NewQuickOrderSetupUserRouter.get(
  "/getReadymadeProductById/:id",
  getReadymadeProductById
);


/******************** Readymade Product Section Routes For Users *****************/

NewQuickOrderSetupUserRouter.post(
  "/admin-add-readymadeAccessoriesForUser",
  upload.fields([
    {
      name: "ReadymadeAccessoriesImage",
      maxCount: 5,
    },
  ]),
  jwtAuthAdmin,
  AdmincreateReadymadeAccessoriesForUser
);

NewQuickOrderSetupUserRouter.patch(
  "/admin-update-readymadeAccessoriesForUser/:accessoriesId",
  upload.fields([
    {
      name: "ReadymadeAccessoriesImage",
      maxCount: 5,
    },
  ]),
  jwtAuthAdmin,
  AdminUpdateReadymadeAccessoriesForUser
);


NewQuickOrderSetupUserRouter.delete(
  "/admin-delete-readymadeAccessoriesForUser/:accessoriesId",
  jwtAuthAdmin,
  AdminDeleteReadymadeAccessoriesForUser
);

NewQuickOrderSetupUserRouter.get(
  "/admin-search-readymadeAccessoriesForUser",
  AdminsearchReadymadeAccessoriesForUser
);





module.exports = NewQuickOrderSetupUserRouter;


