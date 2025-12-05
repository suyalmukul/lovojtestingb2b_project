const { catchAsyncError } = require("../middleware/catchAsyncError");
const mongoose = require('mongoose');
const NotificationModel = require("../models/notification_Model");
const User = require("../models/user");
const { commonPipelineService, showingResults } = require("../services/common.service");
const AppError = require("../utils/errorHandler");
const { sendNotification, sendNotificationByOnesignal } = require('../utils/pushNotifcation');

exports.sendNotificationToUser = catchAsyncError(async (req, res, next) => {
  const { userId, title, body } = req.body;
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    // Get the device token for the user
    const deviceToken = user.deviceToken;

    // Send the push notification
    await sendNotification(deviceToken, title, body);

    return res.json({ message: 'Notification sent successfully' });
})



exports.sendNotificationByOneSignalToUser = catchAsyncError(async (req, res, next) => {
  const { userId, title, body } = req.body;

  // Find the user by their ID
  const user = await User.findById(userId);
  // console.log("user", user);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Get the device token for the user
  const deviceToken = user.deviceToken;

  // Send the push notification
  await sendNotificationByOnesignal(deviceToken, title, body);

  return res.json({ message: 'Notification sent successfully' });
});


// exports.getNotification = catchAsyncError(async (req, res, next) => {
//   const query = req.query;
//   const { search, orderNumber} = req.query;
//   const page = req.query.page || 1;
//   const {} = req.body;
//   let matchQuery;
//   matchQuery.storeId = req.query.storeId;
//   if( search) matchQuery.search = search;
//   if(orderNumber) matchQuery.orderNumber = orderNumber;
//   const { pipeline, countPipeline } = await commonPipelineService({}, query)

//   const notifications = await NotificationModel.aggregate(pipeline)
//   const countResult = await NotificationModel.aggregate(countPipeline);
//   let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

//   const showingResult = await showingResults(query, totalCount)

//   res.status(200).json({
//     success: true,
//     message: "Notifications found Successfully..",
//     totalCount,
//     page,
//     showingResult,
//     count: notifications.length,
//     notifications,
//   });
// });


exports.getNotification = catchAsyncError(async (req, res, next) => {
  const query = req.query;
  const { search, orderNumber } = req.query;
  const page = req.query.page || 1;
  const {} = req.body;
  
  // Initialize matchQuery as an empty object
  let matchQuery = {};
  
  // Set storeId, search, and orderNumber if present in the query
  if (req.query.storeId) matchQuery.storeId = mongoose.Types.ObjectId(req.query.storeId); // Convert storeId to ObjectId if needed
  if (search) matchQuery.search = search;
  if (orderNumber) matchQuery.orderNumber = orderNumber;

  // Construct the pipeline
  const { pipeline, countPipeline } = await commonPipelineService(matchQuery, query);

  // Execute the pipelines
  const notifications = await NotificationModel.aggregate(pipeline);
  const countResult = await NotificationModel.aggregate(countPipeline);

  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  // Get showing results for pagination
  const showingResult = await showingResults(query, totalCount);

  // Send the response
  res.status(200).json({
    success: true,
    message: "Notifications found successfully.",
    totalCount,
    page,
    showingResult,
    count: notifications.length,
    notifications,
  });
});
