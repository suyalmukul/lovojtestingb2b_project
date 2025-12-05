const express = require("express");
const {
  jwtAuth,
  jwtAuthAdmin,
  jwtAuthSuperAdmin,
  jwtAuthWorker,
  jwtAuthCommon,
  jwtAuthAdminandUser,
  superAdminPermission,
} = require("../middleware/jwtAuth");
const validateMiddleWare = require("../middleware/validate");
const AuthJoiSchema = require("../validations/auth.validation");
const  upload  = require("../middleware/multer");

const {
  checkemail,
  signUp,
  logIn,
  logInByOtp,
  deactiveOurAccount,
  deactiveOurAccountBySuperadmin,
  deleteStore,
  forgotPassword,
  resetPasswordd,
  resendOTP,
  getOwnStoreDetails,
  getPersonalDetailsStore,
  superadminGetAllStores,
  superadminDeleteStores,
  myProfile,
  myProfileWorker,
  likeAndUnlikeStore,
  createStoreRating,
  createOrUpdateStoreRating,
  getTotalStoreRating,
  getStoreWithFabImages,
  getStoreWithStoreDetails,
  updateStore,
  toggleWebsiteAdminPermission,


  commonSignUp,
  commonlogIn,
  myProfileStylist,
  toggleWebsiteAdminPermissionForStylish,
  getStylishDetails,
  updateStylistData,


  createLovojShort,
  getLovojShorts,
  getLovojShortsBySuperadmin,
  updateLovojShort,
  adminsignupbyadmin

} = require("../controllers/authController");
const authRouter = express.Router();
const bodyParser = require("body-parser");

authRouter.use(bodyParser.json());

/***********URL : /api/v1/auth/ ********/

/**********************************Auth ROUTES********************************************************/
authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/login", logIn);
authRouter.post("/login-otp", logInByOtp);


authRouter.post("/reset-passwordd", resetPasswordd);

authRouter.post("/resendOTP", resendOTP);

authRouter.post("/checkemail", validateMiddleWare(AuthJoiSchema.checkEmailSchema), checkemail);

authRouter.post("/acount-deactive",jwtAuthAdmin, deactiveOurAccount);
authRouter.post("/acount-deactiveBYSuperadmin/:storeId",jwtAuthSuperAdmin, deactiveOurAccountBySuperadmin);


/**********************************PROFILE ROUTES********************************************************/

authRouter.get("/me", jwtAuthAdmin, myProfile);

authRouter.get("/meUser", jwtAuthWorker, myProfileWorker);

authRouter.get("/ownStoreDetalis", jwtAuthAdmin, getOwnStoreDetails);


authRouter.get("/getallstorepd", jwtAuthAdmin, getPersonalDetailsStore);

/**********************************STORE ROUTES********************************************************/
authRouter.post(
  "/createStore",
  upload.fields([
    {
      name: "storeImage",
      maxCount: 1,
    },
  ]),
  validateMiddleWare(AuthJoiSchema.signupJoiSchema),
  signUp
);
authRouter.post(
  "/create-designer",
  upload.fields([
    {
      name: "storeImage",
      maxCount: 1,
    },
  ]),
  validateMiddleWare(AuthJoiSchema.signupDesignerJoiSchema),
  adminsignupbyadmin
);



authRouter.post(
  "/commonSignup",
  commonSignUp
);

authRouter.post(
  "/commonLogin",
  commonlogIn
);


authRouter.get("/meStylist", jwtAuthCommon, myProfileStylist);


authRouter.put(
  "/updateStore/:id",
  upload.fields([
    {
      name: "storeImage",
      maxCount: 1,
    },
  ]),
  updateStore
);




//for admin and user For Application
authRouter.get("/stores", jwtAuthAdminandUser, getStoreWithFabImages);
//for admin and user For Website
authRouter.get("/storesForWebsite", getStoreWithStoreDetails);





authRouter.get("/visitStores", jwtAuthAdmin, getStoreWithFabImages);


///// For User
authRouter.get("/userfetchstores", getStoreWithFabImages);

authRouter.get("/userfetchvisitStores", getStoreWithFabImages);
/////////////


authRouter.post("/stores/action/:id", jwtAuthAdmin, likeAndUnlikeStore);

authRouter.post("/storesRating", jwtAuthAdmin, createStoreRating);

authRouter.put("/storesRating", jwtAuthAdmin, createOrUpdateStoreRating);

authRouter.get("/storesRating/:storeId", jwtAuthAdmin, getTotalStoreRating);


/******************************************* For Superadmin*******************************************************/

authRouter.post("/superadmin", jwtAuthSuperAdmin, logIn);


authRouter.get("/superadmin_getstores", jwtAuthSuperAdmin,superadminGetAllStores);

authRouter.get("/superadmin_deletestores/:storeNumber", jwtAuthSuperAdmin,superadminDeleteStores);

authRouter.delete("/store/:storeNumber", jwtAuthSuperAdmin, deleteStore);

/******************************************** Send Permession Request *************************/
authRouter.put("/permessionRequest/:id", jwtAuthAdmin,toggleWebsiteAdminPermission);

authRouter.put("/stylishPermessionRequest/:id",jwtAuthCommon,toggleWebsiteAdminPermissionForStylish);

///// admin , superadmin both //////
authRouter.get("/getstylish",getStylishDetails);
//updateStylistData
authRouter.put("/update_stylist/:id",updateStylistData);




authRouter.post("/createLovojShort", jwtAuthAdmin, createLovojShort);
authRouter.get("/getLovojShort", getLovojShorts);
authRouter.get("/getLovojShortBySuperadmin",jwtAuthSuperAdmin, getLovojShortsBySuperadmin);
authRouter.put("/updateLovojShortBySuperadmin/:id",jwtAuthSuperAdmin, updateLovojShort);



module.exports = authRouter;
