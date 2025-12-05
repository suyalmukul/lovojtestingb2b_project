const express = require("express");
const {
  jwtAuth,
  jwtAuthAdmin,
  jwtAuthSuperAdmin,
  jwtAuthWorker,
} = require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const {
  updateProduct,
  deleteProduct,
  updateSubProduct,
  updateStyleFlag,
  deleteSubProduct,
  getSubProductsWithFlag,
  getSubProductsWithFlagandId,
  getProducts,

  updateStoresIdentities,
  updateStoresflag,
  getSubProductsWithTrueStoreFlag,

  getSubProductsByStoresIdentities,
  getAllSubProducts,
  getSubProductById,
  getProductByCategoryName,
  searchCategories,
  addProductSuperadmin,
  addProductAdmin,

  // getSubProductsWithStoreId,
  getownSubProduct,
  getSubProductsById,
  getSubProducts,
  deleteStyleById,

  addSubProductSuperadmin,
  addSubProductAdmin,
  getSubProductsByStoreId,
  searchSubProduct,
  addMesurment,
  getMesurmentByName,
  createButton,
  getButtonByName,
  createButtonHole,
  createButtonAdmin,
  getButtonsAdminByStoreId,
  getButtonHoleByName,
  createButtonHoleAdmin,
  getButtonsHoleAdminByStoreId,
  createFonts,
  getFonts,
  createColors,
  getColors,
  createThreadColors,
  getThreadColors,
  createReadymadeProduct,
  getReadymadeProducts,
  searchReadymadeProducts,
  updateReadymadeProduct,
  createReadymadeAccessories,
  getReadymadeAccessories,
  searchReadymadeAccessories,
  updateReadymadeAccessories,



} = require("../controllers/QuickOrderSetupController");
const QuickOrderSetupRouter = express.Router();
const bodyParser = require("body-parser");

QuickOrderSetupRouter.use(bodyParser.json());

// Route to add a  product Superadmin
QuickOrderSetupRouter.post(
  "/add-product_Superadmin",
  jwtAuthSuperAdmin,
  upload.fields([
    {
      name: "CategoryImage",
      maxCount: 1,
    },
    {
      name: "CategoryProductImg",
      maxCount: 1,
    },
  ]),
  addProductSuperadmin
);

// Route to add a  product Admin
QuickOrderSetupRouter.post(
  "/add-product_Admin",
  upload.fields([
    {
      name: "CategoryImage",
      maxCount: 1,
    },
    {
      name: "CategoryProductImg",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  addProductAdmin
);

QuickOrderSetupRouter.put(
  "/add-product/:productId/subcategories/:subcategoryId",
  upload.fields([
    {
      name: "CategoryImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  updateProduct
);

// QuickOrderSetupRouter.delete('/add-product/:productId',jwtAuthAdmin, deleteProduct);

QuickOrderSetupRouter.delete(
  "/add-product/:productId/subcategories/:subcategoryId",
  jwtAuthAdmin,
  deleteProduct
);

/**********Search product ****************/

QuickOrderSetupRouter.get(
  "/add-product/categories",
  jwtAuthAdmin,
  searchCategories
);

////////////////////////////////////////////////////////////////////////////////////////////

//Superadmin
// Route to add a Sub product
QuickOrderSetupRouter.post(
  "/add-subProduct_Superadmin",
  jwtAuthSuperAdmin,
  upload.fields([
    {
      name: "SubCategoryImage",
      maxCount: 1,
    },
  ]),
  addSubProductSuperadmin
);

//Admin
// Route to add a Sub product
QuickOrderSetupRouter.post(
  "/add-subProduct_Admin",
  upload.fields([
    {
      name: "SubCategoryImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  addSubProductAdmin
);







/*****************************/
/********** admin get own  ********/
QuickOrderSetupRouter.get(
  "/adminGetOwnsubProduct/:id/hlw/:storeId",
  jwtAuthAdmin,
  getownSubProduct);


  //own id
  QuickOrderSetupRouter.get(
    "/adminGetsubProduct/:id",
    jwtAuthAdmin,
    getSubProductsById);
  

//all
  QuickOrderSetupRouter.get(
    "/adminGetsubProducts",
    jwtAuthAdmin,
    getSubProducts);
  
//delete style
    QuickOrderSetupRouter.delete(
      "/adminsubProducts/:subProductId/style/:styleId",
      jwtAuthAdmin,
      deleteStyleById);


/***************************/
/*****************************/










QuickOrderSetupRouter.put(
  "/add-subProduct/:subproductId",
  upload.fields([
    {
      name: "SubCategoryImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  updateSubProduct
);

//admin
QuickOrderSetupRouter.put("/addflag/:styleId", jwtAuthAdmin, updateStyleFlag);
//superadmin
QuickOrderSetupRouter.put(
  "/addflagSuperadmin/:styleId",
  jwtAuthSuperAdmin,
  updateStyleFlag
);

QuickOrderSetupRouter.delete(
  "/add-subProduct/:subproductId",
  jwtAuthAdmin,
  deleteSubProduct
);

// QuickOrderSetupRouter.get('/GetsubProduct',jwtAuthAdmin, getSubProductsWithFlag);

QuickOrderSetupRouter.get(
  "/GetsubProduct/:productId",
  jwtAuthAdmin,
  getSubProductsWithFlag
);

QuickOrderSetupRouter.get(
  "/GetsubProduct/:id",
  jwtAuthAdmin,
  getSubProductsWithFlagandId
);

QuickOrderSetupRouter.get("/GetsubProducts", jwtAuthAdmin, getProducts);

/***************************************/
QuickOrderSetupRouter.put(
  "/subproduct/:id",
  jwtAuthAdmin,
  updateStoresIdentities
);


QuickOrderSetupRouter.put(
  "/subproduct_flag/:id",
  jwtAuthAdmin,
  updateStoresflag
);


QuickOrderSetupRouter.get(
  "/subproduct_storeflag",
  jwtAuthAdmin,
  getSubProductsWithTrueStoreFlag
);

/***************************************/
QuickOrderSetupRouter.get(
  "/subproduct/:storesIdentities/:id",
  jwtAuthAdmin,
  getSubProductsByStoresIdentities
);

QuickOrderSetupRouter.get("/allSubproduct", jwtAuthAdmin, getAllSubProducts);

QuickOrderSetupRouter.get(
  "/subProductBySubCatId/:id",
  jwtAuthAdmin,
  getSubProductById
);

// //by storeid
// QuickOrderSetupRouter.get('/subProductByStoreId/:productId/sub/:storeId', jwtAuthAdmin,getSubProductsByStoreId);

QuickOrderSetupRouter.get(
  "/subProductByStoreId/:productId",
  jwtAuthAdmin,
  getSubProductsByStoreId
);

QuickOrderSetupRouter.get(
  "/getproduct/:gender/:category",
  jwtAuthAdmin,
  getProductByCategoryName
);

// QuickOrderSetupRouter.get('/getproduct/:gender/:category/:subcategory', jwtAuthAdmin,getProductByCategoryName);

QuickOrderSetupRouter.get(
  "/searchSubproduct/:productId",
  jwtAuthAdmin,
  searchSubProduct
);

/******************************************** Mesurments Routes ***************************/

QuickOrderSetupRouter.post(
  "/add-mesurment",
  upload.fields([
    {
      name: "mesurmentImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  addMesurment
);

QuickOrderSetupRouter.get("/get-mesurment", jwtAuthAdmin, getMesurmentByName);

/******************************************* Button Routes Superadmin ******************************/

QuickOrderSetupRouter.post(
  "/add-button",
  upload.fields([
    {
      name: "buttonImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  createButton
);

QuickOrderSetupRouter.get("/get-button", jwtAuthAdmin, getButtonByName);

/******************************************* Button Routes admin ******************************/
QuickOrderSetupRouter.post(
  "/add-buttonadmin",
  upload.fields([
    {
      name: "buttonImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  createButtonAdmin
);

QuickOrderSetupRouter.get(
  "/get-buttonadmin/:storeId",
  jwtAuthAdmin,
  getButtonsAdminByStoreId
);

/*************************************** Button Holes Route Superadmin ****************************/

QuickOrderSetupRouter.post(
  "/add-buttonHole",
  upload.fields([
    {
      name: "buttonHoleImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  createButtonHole
);

QuickOrderSetupRouter.get("/get-buttonHole", jwtAuthAdmin, getButtonHoleByName);

/*************************************** Button Holes Route  Admin****************************/

QuickOrderSetupRouter.post(
  "/add-buttonHoleAdmin",
  upload.fields([
    {
      name: "buttonHoleImage",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  createButtonHoleAdmin
);

QuickOrderSetupRouter.get(
  "/get-buttonHoleAdmin/:storeId",
  jwtAuthAdmin,
  getButtonsHoleAdminByStoreId
);

/********************* Font Routes Superadmin ********************/

QuickOrderSetupRouter.post("/add-font", jwtAuthAdmin, createFonts);

QuickOrderSetupRouter.get("/get-font", jwtAuthAdmin, getFonts);

/********************* Color Routes Superadmin ********************/

QuickOrderSetupRouter.post("/add-color", jwtAuthAdmin, createColors);

QuickOrderSetupRouter.get("/get-color", jwtAuthAdmin, getColors);

/********************* Color Thread Routes Superadmin ********************/

QuickOrderSetupRouter.post(
  "/add-colorThread",
  jwtAuthAdmin,
  createThreadColors
);

QuickOrderSetupRouter.get("/get-colorThread", jwtAuthAdmin, getThreadColors);



/////////////////////////////////////////////////////////////////////
/************************ Readymade Products route *****************/

// QuickOrderSetupRouter.post(
//   "/add-readymadeProduct",
//   jwtAuthAdmin,
//   upload.fields([
//     {
//       name: "ReadymadeProductImage",
//       maxCount: 5,
//     },
//   ]),
//   createReadymadeProduct
// );

QuickOrderSetupRouter.get(
  "/get-allReadymadeProduct",
  jwtAuthAdmin,
  getReadymadeProducts
);

QuickOrderSetupRouter.get(
  "/search-ReadymadeProduct",
  jwtAuthAdmin,
  searchReadymadeProducts
);



QuickOrderSetupRouter.put(
  "/update-readymadeProduct/:id",
  upload.fields([
    {
      name: "ReadymadeProductImage",
      maxCount: 5,
    },
  ]),
  jwtAuthAdmin,
  updateReadymadeProduct
);



/////////////////////////////////////////////////////////////////////
/************************ Readymade Accessories route *****************/

// QuickOrderSetupRouter.post(
//   "/add-readymadeAccessories",
//   jwtAuthAdmin,
//   upload.fields([
//     {
//       name: "ReadymadeAccessoriesImage",
//       maxCount: 5,
//     },
//   ]),
//   createReadymadeAccessories
// );

QuickOrderSetupRouter.get(
  "/get-allReadymadeAccessories",
  jwtAuthAdmin,
  getReadymadeAccessories
);

QuickOrderSetupRouter.get(
  "/search-ReadymadeAccessories",
  jwtAuthAdmin,
  searchReadymadeAccessories
);



QuickOrderSetupRouter.put(
  "/update-readymadeAccessories/:id",
  upload.fields([
    {
      name: "ReadymadeAccessoriesImage",
      maxCount: 5,
    },
  ]),
  jwtAuthAdmin,
  updateReadymadeAccessories
);



module.exports = QuickOrderSetupRouter;





