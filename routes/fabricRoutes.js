const express = require("express");
const {
  addFabric,
  getFabric,
  getFabricForQrCode,
  getSuperadminFabricForQrCode,
  getFabricByDashNumber,
  updateFabric,
  deleteFabric,
  deleteFabrics,
  getFab,
  getFabStoreNumber,
  getFabrics,
  visitStoregetFabric,
  uploadFile,
  checkFabDashNumber,
  getRollLength,
  updateRollInfo,
  updateRollLengthFabric,
  updateFabricById,

  addFabricForSuperadmin,
  updateFabricForSuperadminById,
  getSuperadminFabrics,
  deleteSuperadminFabric,
  addFabricInStaringPage,

  createFabricForUserMakingCharges,
  getRollLengthV1,
  uploadBulkFabrics,
  uploadBulkFabricsForSuperadmin,
  uploadZipFile,
  getRollCombination,

} = require("../controllers/fabricController");

const {
  addfabricdropdownitem,
  // getfabricdropdownitem,
  updateFabricCategoryById,

  createFabricDropdown,
  updateFabricDropdown,
  deleteValuesFromFabricDropdown,
  getfabricdropdownitem,
  getFabricDropdownItemById,
  // getFabricByCategory,
} = require("../controllers/fabricDropdownController");


const {
  addFabricData,
  getFabricData,
  updateFabricData,
  deleteFabricData,
  uploadBulkFabricsData,
} = require("../controllers/fabricInventoryController");


const { jwtAuthAdmin, jwtAuthAdminManager, jwtAuthSuperAdmin } = require("../middleware/jwtAuth");
// const { upload } = require("../middleware/multer");
const upload = require("../middleware/multer");
/***********URL : /api/v1/fabric/ ********/

const fabricRouter = express.Router();




/****************** Add Fabric For Admin *******************/
fabricRouter.post('/addFabric', upload.fields([
  {
    name: "fabImage",
    maxCount: 1,
  },
  {
    name: "fabImageOptional1",
    maxCount: 1,
  },
  {
    name: "fabImageOptional2",
    maxCount: 1,
  },
  {
    name: "fabImageOptional3",
    maxCount: 1,
  },

]), jwtAuthAdmin, addFabric);

/****************** Add Fabric For Admin For Starting Page *******************/
fabricRouter.post('/addFabricForStartingPage', jwtAuthAdmin, addFabricInStaringPage);




/****************** Add Fabric For Superadmin *******************/

fabricRouter.post('/addFabricForSuperadmin', jwtAuthSuperAdmin, upload.fields([
  {
    name: "fabImage",
    maxCount: 1,
  },
  {
    name: "fabImageOptional1",
    maxCount: 1,
  },
  {
    name: "fabImageOptional2",
    maxCount: 1,
  },
  {
    name: "fabImageOptional3",
    maxCount: 1,
  },

]), addFabricForSuperadmin);

fabricRouter.patch("/updateFabricForSuperadmin/:id", jwtAuthSuperAdmin, updateFabricForSuperadminById);

/****************** Get Fabric For Admin and Superadmin ***********/

fabricRouter.get("/getFabricForBoth", getSuperadminFabrics);

/*********************** Delete Fabric For Superadmin ************/

fabricRouter.delete("/deleteFabricForSuperadmin/:fabricId", jwtAuthSuperAdmin, deleteSuperadminFabric);





/****** qr code ********/
fabricRouter.get("/getFabricById/:id", getFabricForQrCode);
fabricRouter.get("/getFabricsById/:id", getSuperadminFabricForQrCode);
fabricRouter.get("/getFabric_dashNum/:fabDashNumber", getFabricByDashNumber);





fabricRouter.get("/getfabric", jwtAuthAdmin, getFabric);

fabricRouter.get("/userfetchgetfabric", getFabric);


/**********************************************************/

/************* For App  *************/
fabricRouter.get("/findFabric", jwtAuthAdminManager, visitStoregetFabric);


// /************* For Site **********/
// fabricRouter.get("/findFabricWebsite",  visitStoregetFabric);

/***********************************************************/

fabricRouter.get("/getfabric/:id", jwtAuthAdmin, getFab);

fabricRouter.get("/getfabrics/:storeNumber", jwtAuthAdmin, getFabStoreNumber);

fabricRouter.put(
  "/updatefab/:id",
  upload.single("fabImage"),
  jwtAuthAdmin,
  updateFabric
);

fabricRouter.delete("/deletefab/:id", jwtAuthAdmin, deleteFabrics);


/**********************************************************************************/
fabricRouter.post("/getfabric/:id", jwtAuthAdmin, getFabrics);
// fabricRouter.post("/getfabric/:storeNumber", jwtAuthAdmin, getFabStoreNumbers);

/*********************Check fabdashNumber in database *******************/

// GET request to check fabDashNumber
fabricRouter.get('/check-fabdashnumber', checkFabDashNumber);


/********************************** Old Fabric Dropdowns Apis Get post and put delete **********************/


fabricRouter.post("/fabricdropdowns", addfabricdropdownitem);
fabricRouter.get("/getfabricdropdowns", getfabricdropdownitem);
fabricRouter.put("/fabricdropdowns/:id/:indexToUpdate", updateFabricCategoryById);



/********************************** Working New Fabric Dropdowns Apis Get post and put delete **********************/

fabricRouter.post("/fabricdropdown", createFabricDropdown);

fabricRouter.put("/fabricdropdown", updateFabricDropdown);

fabricRouter.delete("/fabricdropdown", deleteValuesFromFabricDropdown);

fabricRouter.get("/fabricdropdown", getfabricdropdownitem);

fabricRouter.get("/fabricdropdown/:id", getFabricDropdownItemById);


/************************************ Combination Route **************************/




fabricRouter.post('/getRollLength', jwtAuthAdmin, getRollLength);
fabricRouter.post('/getRollLengthV1', jwtAuthAdmin, getRollLengthV1);
fabricRouter.get('/roll-combination', getRollCombination);




fabricRouter.patch("/:id/rollinfo/:rollId", updateRollInfo);


/****** update fabric drtails ******/
fabricRouter.patch("/updatefabric/:id", jwtAuthAdmin, updateFabricById);


/***** update fabric roll ********/
fabricRouter.put("/updatefabric", updateRollLengthFabric);


/***************Fabric User Setup ***************/
fabricRouter.post('/FabricForUserCharges', jwtAuthAdmin, createFabricForUserMakingCharges);


/***************** Upload Bulk Fabric ********************/

// fabricRouter.post('/upload',jwtAuthAdmin, upload.single("file"), uploadBulkFabrics);

fabricRouter.post(
  '/upload',
  jwtAuthAdmin,
  upload.fields([
    { name: "excel", maxCount: 1 },
    { name: "zip", maxCount: 1 }
  ]),
  uploadBulkFabrics
);



fabricRouter.post(
  '/uploads',
  // jwtAuthSuperAdmin,
  upload.fields([
    { name: "excel", maxCount: 1 },
    { name: "zip", maxCount: 1 }
  ]),
  uploadBulkFabricsForSuperadmin
);





/*********************************** New api routes ************************************/

fabricRouter.post('/inventory/create', jwtAuthAdmin, addFabricData);
fabricRouter.get('/inventory/get', jwtAuthAdmin, getFabricData);
fabricRouter.patch("/inventory/update/:id", jwtAuthAdmin, updateFabricData);
fabricRouter.delete("/inventory/delete/:id", jwtAuthAdmin, deleteFabricData);

fabricRouter.post(
  '/inventory/upload',
   jwtAuthAdmin,
  upload.fields([
    { name: "excel", maxCount: 1 },
    { name: "zip", maxCount: 1 }
  ]),
  uploadBulkFabricsData
);

module.exports = fabricRouter;


