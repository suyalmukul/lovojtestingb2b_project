// const express = require('express');
// const testRouter = express.Router();
// const { sendPushNotification, categoryImagesPost,createOrUpdateCategoryItem } = require('../controllers/testController');
// const { jwtAuthAdmin } = require("../middleware/jwtAuth");
// const {sendNotificationByOneSignalToUser } = require('../controllers/notificationController');

// const { upload } = require('../middleware/multer');

// // Route to send a push notification
// testRouter.post('/send-notification', sendPushNotification);
// testRouter.post('/category',upload.fields([
//     {
//       name: "designerImage",
//       maxCount: 1,
//     },
//     {
//       name: "titleImage1",
//       maxCount: 1,
//     },
//     {
//       name: "fabricImage",
//       maxCount: 1,
//     },

//   ]), categoryImagesPost);





// // POST request to create or update a document based on category and subcategory
// testRouter.post('/create-or-update', createOrUpdateCategoryItem);




// // Route to send a push notification
// testRouter.post('/send-oneSignalNotification',jwtAuthAdmin, sendNotificationByOneSignalToUser);


// module.exports = testRouter;



const express = require('express');
const testRouter = express.Router();
const { sendPushNotification, categoryImagesPost,createOrUpdateCategoryItem } = require('../controllers/testController');
const { jwtAuthAdmin } = require("../middleware/jwtAuth");
const {sendNotificationByOneSignalToUser } = require('../controllers/notificationController');

// const { upload } = require('../middleware/multer');
const  upload  = require("../middleware/multer");
// Route to send a push notification
testRouter.post('/send-notification', sendPushNotification);
testRouter.post('/category',upload.fields([
    {
      name: "designerImage",
      maxCount: 1,
    },
    {
      name: "titleImage1",
      maxCount: 1,
    },
    {
      name: "fabricImage",
      maxCount: 1,
    },

  ]), categoryImagesPost);





// POST request to create or update a document based on category and subcategory
testRouter.post('/create-or-update', createOrUpdateCategoryItem);




// Route to send a push notification
testRouter.post('/send-oneSignalNotification',jwtAuthAdmin, sendNotificationByOneSignalToUser);


module.exports = testRouter;

