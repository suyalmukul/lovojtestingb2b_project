const express = require('express');
const workerRouter = express.Router();
const { roleSignUp, getWorkers, deteleWorker,updateWorkerProfile,updateTaskStatus,getPendingWork, getWorkersWork } = require('../controllers/workerController');
const { jwtAuth, jwtAuthAdmin ,jwtAuthWorker,jwtAuthCommon,jwtAuthAdminWorker} = require('../middleware/jwtAuth');
const {getStoreWithFabImages,} = require("../controllers/authController");
const {getHomeDiscount,} = require("../controllers/profileController");
const  upload  = require("../middleware/multer");
const { workerCompletedProductsListing,workerCompletedProductsListinggg } = require('../controllers/QuickOrderController');
const User = require('../models/user');
// const workerController = require("../controllers/workerController");

workerRouter.post(
  "/signup",
  upload.fields([
    {
      name: "workerProfileImage",
      maxCount: 1,
    },
    {
      name: "aadharCardFront",
      maxCount: 1,
    },
    {
      name: "aadharCardBack",
      maxCount: 1,
    },
    {
      name: "panCardFront",
      maxCount: 1,
    },
    {
      name: "employmentDocumentPdf1",
      maxCount: 1,
    },
    {
      name: "employmentDocumentPdf2",
      maxCount: 1,
    },
    {
      name: "otherDocument1",
      maxCount: 1,
    },
    {
      name: "otherDocument2",
      maxCount: 1,
    },
  ]),
  jwtAuthAdmin,
  roleSignUp
);




  workerRouter.put(
    "/update/:id",
    upload.fields([
      {
        name: "workerProfileImage",
        maxCount: 1,
      },
      {
        name: "aadharCardFront",
        maxCount: 1,
      },
      {
        name: "aadharCardBack",
        maxCount: 1,
      },
      {
        name: "panCardFront",
        maxCount: 1,
      },
      {
        name: "employmentDocumentPdf1",
        maxCount: 1,
      },
      {
        name: "employmentDocumentPdf2",
        maxCount: 1,
      },
      {
        name: "otherDocument1",
        maxCount: 1,
      },
      {
        name: "otherDocument2",
        maxCount: 1,
      },
    ]),
    jwtAuthAdmin,
    updateWorkerProfile
  );

workerRouter.get('/workers',jwtAuthAdmin,getWorkers );
workerRouter.delete('/workers/:id',jwtAuthAdmin,deteleWorker );
workerRouter.get('/work',jwtAuthWorker,getWorkersWork)
// router.post('/login', roleLogin);

//for worker
workerRouter.get("/stores", jwtAuthWorker, getStoreWithFabImages);
workerRouter.get("/discount", jwtAuthWorker,getHomeDiscount );

workerRouter.post("/completedorderlisting", jwtAuthAdminWorker, workerCompletedProductsListing)

//testing
workerRouter.post("/completedorderlistinggg", jwtAuthCommon, workerCompletedProductsListinggg)


/******************************** New order routesssss ***************************/

workerRouter.put('/worker_status/:id',jwtAuthWorker,updateTaskStatus)

workerRouter.get('/worker_pending_works',jwtAuthWorker,getPendingWork)
   


module.exports = workerRouter;
