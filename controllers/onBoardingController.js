const { catchAsyncError } = require("../middleware/catchAsyncError");
const AppError = require("../utils/errorHandler");
const uploadToS3 = require("../utils/s3Upload");
const deleteFromS3 = require("../utils/deleteFroms3");
const onBoarding = require("../models/onBoardingSchema");

exports.appraelController = catchAsyncError(async (req, res, next) => {
  const { apparelHeading, apprarelSubHeading } = req.body;

  let newappraelImage = null;

  const existingAppraelData = await onBoarding.findOne({ apparelHeading });

  if (existingAppraelData) {
    return next(new AppError("Apprael Detail already exist!", 400));
  }

  if (req.files.appraelImages && req.files.appraelImages.length > 0) {
    const addingAppraelImage = req.files.appraelImages[0];
    newappraelImage = await uploadToS3(addingAppraelImage);
  }

  const addedAprraelContent = await onBoarding.create({
    apparelImage: newappraelImage,
    apparelHeading,
    apprarelSubHeading,
  });

  return res.status(201).json({
    success: true,
    message: "Addded Apprael Content Successfully",
    addedAprraelContent,
  });
});

exports.UpdateAllonBoardContent = catchAsyncError(async (req, res, next) => {
  const { apparelHeading, apprarelSubHeading } = req.body;
  const fetchingAppraelID = req.body.id;
  console.log("fetchingAppraelID is:", fetchingAppraelID);

  const appraelData = await onBoarding.findById({ _id: fetchingAppraelID });
  if (!appraelData) {
    return next(new AppError("Apprael Details does not exist", 400));
  }

  if (apparelHeading) {
    appraelData.apparelHeading = apparelHeading;
  }

  if (apprarelSubHeading) {
    appraelData.apprarelSubHeading = apprarelSubHeading;
  }

  let updatedAppraelImage;

  if (req.files && req.files.appraelImages && req.files.appraelImages[0]) {
    const file = req.files.appraelImages[0];
    updatedAppraelImage = await uploadToS3(file);
    // Delete existing businessPancard file from the store if it exists
    if (appraelData.apparelImage) {
      try {
        await deleteFromS3(appraelData.apparelImage);
        console.log("Existing apparelImage deleted successfully.");
      } catch (error) {
        console.error("Error deleting existing apparelImage:", error);
      }
    }
    appraelData.apparelImage = updatedAppraelImage;
  }
  await appraelData.save();

  res.status(200).json({
    success: true,
    message: "Apprael Details Updated Successfully",
    appraelData,
  });
});
// ............................................................................................................................//
exports.creditLimitController = catchAsyncError(async (req, res, next) => {
  const { creditLimitHeading, creditLimitSubHeading } = req.body;

  let newcreditImage = null;

  const existingCreditData = await onBoarding.findOne({ creditLimitHeading });

  if (existingCreditData) {
    return next(new AppError("Apprael Detail already exist!", 400));
  }

  if (req.files.creditLimitImages && req.files.creditLimitImages.length > 0) {
    const addingCreditImage = req.files.creditLimitImages[0];
    newcreditImage = await uploadToS3(addingCreditImage);
  }

  const addedCreditContent = await onBoarding.create({
    creditLimitImage: newcreditImage,
    creditLimitHeading,
    creditLimitSubHeading,
  });

  return res.status(201).json({
    success: true,
    message: "Addded Credit Limit Content Successfully",
    addedCreditContent,
  });
});

exports.UpdateCreditContent = catchAsyncError(async (req, res, next) => {
  const { creditLimitHeading, creditLimitSubHeading } = req.body;

  const fetchingCreditID = req.body.id;
  console.log("fetchingCreditID is:", fetchingCreditID);

  const creditData = await onBoarding.findById({ _id: fetchingCreditID });
  if (!creditData) {
    return next(new AppError("creditImage Details does not exist", 400));
  }

  if (creditLimitHeading) {
    creditData.creditLimitHeading = creditLimitHeading;
  }

  if (creditLimitSubHeading) {
    creditData.creditLimitSubHeading = creditLimitSubHeading;
  }

  let updatedCreditImage;

  if (
    req.files &&
    req.files.creditLimitImages &&
    req.files.creditLimitImages[0]
  ) {
    const file = req.files.creditLimitImages[0];
    updatedCreditImage = await uploadToS3(file);
    // Delete existing businessPancard file from the store if it exists
    if (creditData.creditLimitImage) {
      try {
        await deleteFromS3(creditData.creditLimitImage);
        console.log("Existing creditImage deleted successfully.");
      } catch (error) {
        console.error("Error deleting existing creditImage:", error);
      }
    }
    creditData.creditLimitImage = updatedCreditImage;
  }
  await creditData.save();

  res.status(200).json({
    success: true,
    message: "Credit Details Updated Successfully",
    creditData,
  });
});

// ............................................................................................................................//

exports.fastdeliveryController = catchAsyncError(async (req, res, next) => {
  const { fastDeliveryHeading, fastDeliverySubHeading } = req.body;

  let newfastDeliveryImage = null;

  const existingFastDelievryData = await onBoarding.findOne({
    fastDeliveryHeading,
  });

  if (existingFastDelievryData) {
    return next(new AppError("Fast Delivery Detail already exist!", 400));
  }

  if (req.files.fastDeliveryImages && req.files.fastDeliveryImages.length > 0) {
    const addingFastDeliveryImage = req.files.fastDeliveryImages[0];
    newfastDeliveryImage = await uploadToS3(addingFastDeliveryImage);
  }

  const addedFastDeliveryContent = await onBoarding.create({
    fastDeliveryImage: newfastDeliveryImage,
    fastDeliveryHeading,
    fastDeliverySubHeading,
  });

  return res.status(201).json({
    success: true,
    message: "Addded Fast Delivery Content Successfully",
    addedFastDeliveryContent,
  });
});

exports.UpdateFastDeliveryContent = catchAsyncError(async (req, res, next) => {
  const { fastDeliveryHeading, fastDeliverySubHeading } = req.body;

  const fetchingFDID = req.body.id;
  console.log("fetchingFDID is:", fetchingFDID);

  const FastDeliverytData = await onBoarding.findById({ _id: fetchingFDID });
  if (!FastDeliverytData) {
    return next(new AppError("Fast Delivery Details does not exist", 400));
  }

  if (fastDeliveryHeading) {
    FastDeliverytData.fastDeliveryHeading = fastDeliveryHeading;
  }

  if (fastDeliverySubHeading) {
    FastDeliverytData.fastDeliverySubHeading = fastDeliverySubHeading;
  }

  let updatedFastDeliveryImage;

  if (
    req.files &&
    req.files.fastDeliveryImages &&
    req.files.fastDeliveryImages[0]
  ) {
    const file = req.files.fastDeliveryImages[0];
    updatedFastDeliveryImage = await uploadToS3(file);
    // Delete existing businessPancard file from the store if it exists
    if (FastDeliverytData.fastDeliveryImage) {
      try {
        await deleteFromS3(FastDeliverytData.fastDeliveryImage);
        console.log("Existing creditImage deleted successfully.");
      } catch (error) {
        console.error("Error deleting existing creditImage:", error);
      }
    }
    FastDeliverytData.fastDeliveryImage = updatedFastDeliveryImage;
  }
  await FastDeliverytData.save();

  res.status(200).json({
    success: true,
    message: "Fast Delivery Details Updated Successfully",
    FastDeliverytData,
  });
});

// ............................................................................................................................//

exports.getAllOnBoardContent = catchAsyncError(async (req, res, next) => {
  const fetchingOnBoardingData = await onBoarding.find();

  return res.status(200).json({
    success: true,
    message: "OnBoarding Data Fetched Successfully",
    fetchingOnBoardingData: fetchingOnBoardingData,
  });
});
