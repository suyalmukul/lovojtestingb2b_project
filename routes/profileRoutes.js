const express = require("express");
const {
  personalDetail,
  getBusinessandPersonalProfile,
  addBusinessDetail,
  uploadProfileImage ,
  updateProfileImage ,
  deleteProfileImage,
  uploadSignatureImage,
  updateSignatureImage,
  updatePersonalDetail,
  createFactoryProfile,
  updateFactoryProfile,
  updatepersonalDlt,
  updatebusinessDlt,
  changePassword,
  getAllProfileData,
  sendRequest ,
  acceptRequest,
  homeDiscount,
  getHomeDiscount,
  deleteHomeDiscountById,

  adminPersonalBusinessImages,
  createPersonalDetails,
  updatePersonalDetails,
  createBusinessDetails,
  updateBusinessDetails,
  // superAdminGetHomeDiscount,
} = require("../controllers/profileController");
const { jwtAuth, jwtAuthAdmin ,jwtAuthSuperAdmin } = require("../middleware/jwtAuth");
// const { upload ,convertToWebP} = require("../middleware/multer");
const  upload  = require("../middleware/multer");
const personalDetRouter = express.Router();
const businessDetRouter = express.Router();
const profileDetRouter = express.Router();
const signatureDetRouter = express.Router();
const changePassDetRouter = express.Router();
const factoryProfileDetRouter = express.Router();
const allgetprofileDetRouter = express.Router();
const sendRequestDetRouter = express.Router();
const acceptRequestDetRouter = express.Router();

/*********************************** PERSONAL DETAILS ( POST / GET / PUT / DELETE ) API********************************/


/*****************************/
personalDetRouter.post(
  "/personaldetails",
  upload.fields([
    {
      name: "uploadAdharCardFront",
      maxCount: 1,
    },
    {
      name: "uploadAdharCardBack",
      maxCount: 1,
    },
    {
      name: "uploadPassport",
      maxCount: 1,
    },
    {
      name: "uploadResidence",
      maxCount: 1,
    },
    {
      name: "uploadPanCard",
      maxCount: 1,
    },
    {
      name: "uploadVoterPassportId",
      maxCount: 5,
    },
    {
      name: "uploadDrivingLicense",
      maxCount: 1,
    },
    {
      name: "uploadElectricWaterBill",
      maxCount: 5,
    },
    {
      name: "uploadBankPassbook",
      maxCount: 1,
    },
    {
      name: "uploadOtherDetails",
      maxCount: 50,
    },
  ]),
  jwtAuthAdmin,
  personalDetail
);

personalDetRouter.put(
  "/personaldetails",
  upload.fields([
    {
      name: "uploadAdharCardFront",
      maxCount: 1,
    },
    {
      name: "uploadAdharCardBack",
      maxCount: 1,
    },
    {
      name: "uploadPassport",
      maxCount: 1,
    },
    {
      name: "uploadResidence",
      maxCount: 1,
    },
    {
      name: "uploadPanCard",
      maxCount: 1,
    },
    {
      name: "uploadVoterPassportId",
      maxCount: 5,
    },
    {
      name: "uploadDrivingLicense",
      maxCount: 1,
    },
    {
      name: "uploadElectricWaterBill",
      maxCount: 5,
    },
    {
      name: "uploadBankPassbook",
      maxCount: 1,
    },
    {
      name: "uploadOtherDetails",
      maxCount: 50,
    },
  ]),
  jwtAuthAdmin,
  updatepersonalDlt
);
/*****************************/


personalDetRouter.post(
  "/personalBusinessPhotos",
  upload.fields([
    {
      name: "adminPersonalPhotos",
      maxCount: 50,
    },
    {
      name: "adminBusinessPhotos",
      maxCount: 50,
    },
  ]),
  jwtAuthAdmin,
  adminPersonalBusinessImages
);


//testing personal
personalDetRouter.post(
  "/CreatePersonaldetails",
  jwtAuthAdmin,
  createPersonalDetails
);


//testing personal
personalDetRouter.put(
  "/UpdatePersonaldetails",
  jwtAuthAdmin,
  updatePersonalDetails
);


//testing Business

businessDetRouter.post(
  "/CreateBusinessdetails",
  jwtAuthAdmin,
  createBusinessDetails
);

//testing Business

businessDetRouter.put(
  "/UpdateBusinessdetails",
  jwtAuthAdmin,
  updateBusinessDetails
);


/*********************************** BUSINESS DETAILS ( POST / GET / PUT / DELETE ) API********************************/



businessDetRouter.post(
  "/businessdetails",
  upload.fields([
    {
      name: "businessPancard",
      maxCount: 1,
    },
    {
      name: "businessBankStatementPDF",
      maxCount: 1,
    },
    {
      name: "businessBankStatementPicture",
      maxCount: 1,
    },
    {
      name: "uploadSelfieWithShop",
      maxCount: 1,
    },
    {
      name: "businessSalePurchaseFile",
      maxCount: 10,
    },


    {
      name: "businessProfileImage",
      maxCount: 1,
    },
    {
      name: "businessInformationCetificate",
      maxCount: 1,
    },
    {
      name: "businessGstCertificate",
      maxCount: 1,
    },
    {
      name: "businessElectricWater",
      maxCount: 5,
    },
    {
      name: "businessVisitingCard",
      maxCount: 10,
    },
    {
      name: "businessSaleBillRecord",
      maxCount: 5,
    },
    {
      name: "businessShopPicture",
      maxCount: 1,
    },
    {
      name: "businessOtherDocment",
      maxCount: 20,
    },

  ]),
  jwtAuthAdmin,
  addBusinessDetail
);




businessDetRouter.put(
  "/businessdetails",
  upload.fields([
    {
      name: "businessPancard",
      maxCount: 1,
    },
    {
      name: "businessBankStatementPDF",
      maxCount: 1,
    },
    {
      name: "businessBankStatementPicture",
      maxCount: 1,
    },
    {
      name: "uploadSelfieWithShop",
      maxCount: 1,
    },
    {
      name: "businessSalePurchaseFile",
      maxCount: 10,
    },
  ]),
  jwtAuthAdmin,
  updatebusinessDlt
);





/************************************************* PROFILEPHOTO (POST/ PUT) API ********************************/


profileDetRouter.post(
  "/profileImage",
  upload.single("profileImage"),
  jwtAuthAdmin,
  uploadProfileImage
);


profileDetRouter.put(
  "/profileImage",
  upload.single('profileImage'),
  jwtAuthAdmin,
  updateProfileImage );


  profileDetRouter.delete(
    "/deleteProfileImage",
    jwtAuthAdmin,
    deleteProfileImage
  );

/*************************************************** SIGNATURE (POST / PUT)  API *********************************/




signatureDetRouter.post(
  "/signatureImage",
  upload.fields([
    {
      name: "signatureFile1",
      maxCount: 1,
    },
    {
      name: "signatureFile2",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  uploadSignatureImage
);





signatureDetRouter.put(
  "/signatureImage",
  upload.fields([
    {
      name: "signatureFile1",
      maxCount: 1,
    },
    {
      name: "signatureFile2",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  updateSignatureImage
);


/**************************************************** FACTORY DETAILS API *********************************/

factoryProfileDetRouter.post('/factoryProfile', jwtAuthAdmin,createFactoryProfile);


factoryProfileDetRouter.put('/factoryProfile', jwtAuthAdmin,updateFactoryProfile);

/*********************************************** CHANGE PASSWORD API ****************************************/


changePassDetRouter.post("/password", jwtAuthAdmin, changePassword);

changePassDetRouter.post("/SuperadminPassword", jwtAuthSuperAdmin, changePassword);

/*************************************************************************************************************/


allgetprofileDetRouter.get("/data", jwtAuthAdmin, getAllProfileData);




/**************************************************** Send and Accept Requests*********************************************************/

sendRequestDetRouter.post('/Associate/:userId', jwtAuthAdmin,sendRequest );

acceptRequestDetRouter.post('/Associated/:userId', jwtAuthAdmin,acceptRequest );





/************************************* Home Page Discount  *********************************/

profileDetRouter.post(
  "/discount",
  upload.single("discountImage"),
  jwtAuthAdmin,
  homeDiscount
);



profileDetRouter.get("/discount", jwtAuthAdmin,getHomeDiscount );


/**********************************************************************************************/



/******************************************Discount For SuperAdmin**************************************************/

profileDetRouter.get("/superadmin_discount", jwtAuthSuperAdmin,getHomeDiscount );

profileDetRouter.delete("/superadmin_discount/:id", jwtAuthSuperAdmin,deleteHomeDiscountById );





module.exports = { personalDetRouter,
   businessDetRouter ,
   profileDetRouter,
   signatureDetRouter,
   changePassDetRouter,
   factoryProfileDetRouter,
   allgetprofileDetRouter,
   sendRequestDetRouter,
   acceptRequestDetRouter
  };

