const Fabrics = require("../models/fabric");
const User = require("../models/user");
const PersonalDet = require("../models/personalDet");
const Business = require("../models/BusinessDet");
const ProfileImage = require('../models/profileImage');
const cron = require('node-cron');

const FactoryProfile = require('../models/profileFactory');
const SignatureImage = require('../models/signature');
const uploadToS3 = require("../utils/s3Upload");
const deleteFromS3 = require("../utils/deleteFroms3");
const Store = require("../models/stores");
const HomeDiscount = require("../models/HomeDiscount")
const { catchAsyncError } = require("../middleware/catchAsyncError");
const AppError = require("../utils/errorHandler");


/***************************************************************************************************************** */
exports.personalDetail = catchAsyncError(async (req, res, next) => {
  // User ID
  const user = req.user._id;
  const storeId = req.user.storeId;

  // Request Body
  const {
    name,
    email,
    phoneNumber,
    ownerAddress1,
    ownerAddress2,
    country,
    state,
    ownerCityName,
    ownerAreaPinCode,
    Nominee,
    NomineePhoneNumber,
    NomineeAdharNumber,
  } = req.body;

  let addressProof1Url = null;
  let addressProof2Url = null;
  let addressProof3Url = null;
  let addressProof4Url = null;
  let addressProof5Url = null;
  let addressProof6Url = [];
  let addressProof7Url = null;
  let addressProof8Url = [];
  let addressProof9Url = null;
  let addressProof10Url = [];

  // Check if personal details already exist for the user
  const existingDetails = await PersonalDet.findOne({ user });

  if (existingDetails) {
    return next(
      new AppError("Personal details already exist for this user.", 400)
    );
  }


  // Check if addressProof1 file is provided
  if (req.files.uploadAdharCardFront && req.files.uploadAdharCardFront.length > 0) {
    const addressProof1obj = req.files.uploadAdharCardFront[0];
    addressProof1Url = await uploadToS3(addressProof1obj);
  }

  // Check if addressProof2 file is provided
  if ( req.files.uploadAdharCardBack && req.files.uploadAdharCardBack.length > 0) {
    const addressProof2obj = req.files.uploadAdharCardBack[0];
    addressProof2Url = await uploadToS3(addressProof2obj);
  }

  // Check if addressProof3 file is provided
  if (req.files.uploadPassport && req.files.uploadPassport.length > 0) {
    const addressProof3obj = req.files.uploadPassport[0];
    addressProof3Url = await uploadToS3(addressProof3obj);
  }

   // Check if addressProof4 file is provided
   if (req.files.uploadResidence && req.files.uploadResidence.length > 0) {
    const addressProof4obj = req.files.uploadResidence[0];
    addressProof4Url = await uploadToS3(addressProof4obj);
   }

    // Check if addressProof1 file is provided
    if (req.files.uploadPanCard && req.files.uploadPanCard.length > 0) {
      const addressProof5obj = req.files.uploadPanCard[0];
      addressProof5Url = await uploadToS3(addressProof5obj);
    }

    if (req.files.uploadVoterPassportId && req.files.uploadVoterPassportId.length > 0) {
      const files = req.files.uploadVoterPassportId;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      addressProof6Url.push(data);
    }
  
    // Check if addressProof3 file is provided
    if (req.files.uploadDrivingLicense && req.files.uploadDrivingLicense.length > 0) {
      const addressProof7obj = req.files.uploadDrivingLicense[0];
      addressProof7Url = await uploadToS3(addressProof7obj);
    }

    if (req.files.uploadElectricWaterBill && req.files.uploadElectricWaterBill.length > 0) {
      const files = req.files.uploadElectricWaterBill;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      addressProof8Url.push(data);
    }

    // Check if addressProof4 file is provided
    if (req.files.uploadBankPassbook && req.files.uploadBankPassbook.length > 0) {
      const addressProof9obj = req.files.uploadBankPassbook[0];
      addressProof9Url = await uploadToS3(addressProof9obj);
    }

    if (req.files.uploadOtherDetails && req.files.uploadOtherDetails.length > 0) {
    const files = req.files.uploadOtherDetails;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    addressProof10Url.push(data);
    }

  // Insert Data
  const personalDetails = await PersonalDet.create({
    user,
    name,
    email,
    phoneNumber,
    ownerAddress1,
    ownerAddress2,
    country,
    state,
    ownerCityName,
    ownerAreaPinCode,
    Nominee,
    NomineePhoneNumber,
    NomineeAdharNumber,
    uploadAdharCardFront: addressProof1Url,
    uploadAdharCardBack: addressProof2Url,
    uploadPassport: addressProof3Url,
    uploadResidence: addressProof4Url,
    
    uploadPanCard: addressProof5Url,
    uploadVoterPassportId: addressProof6Url,
    uploadDrivingLicense: addressProof7Url,
    uploadElectricWaterBill: addressProof8Url,
    uploadBankPassbook: addressProof9Url,
    uploadOtherDetails:addressProof10Url
  });
  /************************************************************ */
  const userFromDb = await User.findById(user);
  if (!userFromDb) {
    return next(new AppError("User not found", 404));
  }
  userFromDb.personalProfileStatus = true;
  await userFromDb.save();

  // Update store's personalProfileStatus
  const storeFromDb = await Store.findById(storeId);
  if (!storeFromDb) {
    return next(new AppError("Store not found", 404));
  }
  storeFromDb.personalProfileStatus = true;
  await storeFromDb.save();

  return res.status(201).json({
    success: true,
    message: "Personal Detail Updated Successfully",
    personalProfileStatus: user.personalProfileStatus,
    personalDetails,
  });
});

exports.updatepersonalDlt = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    ownerAddress1,
    ownerAddress2,
    ownerCityName,
    ownerAreaPinCode,
    Nominee,
    NomineePhoneNumber,
    NomineeAdharNumber,
    country,
    state,
  } = req.body;

  const user = req.user._id;

  // Fetch personal details for the user
  const personalDetails = await PersonalDet.findOne({ user });

  if (!personalDetails) {
    return next(new AppError("User does not exist", 400));
  }

  // Update the fields that were sent in the request body
  if (name) {
    personalDetails.name = name;
  }
  if (email) {
    personalDetails.email = email;
  }
  if (phoneNumber) {
    personalDetails.phoneNumber = phoneNumber;
  }
  if (ownerAddress1) {
    personalDetails.ownerAddress1 = ownerAddress1;
  }
  if (ownerAddress2) {
    personalDetails.ownerAddress2 = ownerAddress2;
  }
  if (ownerCityName) personalDetails.ownerCityName = ownerCityName;
  if (ownerAreaPinCode) personalDetails.ownerAreaPinCode = ownerAreaPinCode;
  if (Nominee) personalDetails.Nominee = Nominee;
  if (NomineePhoneNumber) personalDetails.NomineePhoneNumber = NomineePhoneNumber;
  if (NomineeAdharNumber) personalDetails.NomineeAdharNumber = NomineeAdharNumber;
  if (country) personalDetails.country = country;
  if (state) personalDetails.state = state;

  // Update addressProof1 file if provided
  if (
    req.files &&
    req.files.uploadAdharCardFront &&
    req.files.uploadAdharCardFront[0]
  ) {
    const file = req.files.uploadAdharCardFront[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof1 file from the store if it exists
    if (personalDetails.uploadAdharCardFront) {
      await deleteFromS3(personalDetails.uploadAdharCardFront);
    }

    // Update the addressProof1 URL in the personalDetails object
    personalDetails.uploadAdharCardFront = imageUrl;
  }

  // Update addressProof2 file if provided
  if (
    req.files &&
    req.files.uploadAdharCardBack &&
    req.files.uploadAdharCardBack[0]
  ) {
    const file = req.files.uploadAdharCardBack[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof2 file from the store if it exists
    if (personalDetails.uploadAdharCardBack) {
      await deleteFromS3(personalDetails.uploadAdharCardBack);
    }

    // Update the addressProof2 URL in the personalDetails object
    personalDetails.uploadAdharCardBack = imageUrl;
  }

  // Update addressProof3 file if provided
  if (
    req.files &&
    req.files.uploadPassport &&
    req.files.uploadPassport[0]
  ) {
    const file = req.files.uploadPassport[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof3 file from the store if it exists
    if (personalDetails.uploadPassport) {
      await deleteFromS3(personalDetails.uploadPassport);
    }

    // Update the addressProof3 URL in the personalDetails object
    personalDetails.uploadPassport = imageUrl;
  }

  // Update addressProof4 file if provided
  if (
    req.files &&
    req.files.uploadResidence &&
    req.files.uploadResidence[0]
  ) {
    const file = req.files.uploadResidence[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof4 file from the store if it exists
    if (personalDetails.uploadResidence) {
      await deleteFromS3(personalDetails.uploadResidence);
    }

    // Update the addressProof4 URL in the personalDetails object
    personalDetails.uploadResidence = imageUrl;
  }

  // Update addressProof5 file if provided
  if (
    req.files &&
    req.files.uploadPanCard &&
    req.files.uploadPanCard[0]
  ) {
    const file = req.files.uploadPanCard[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof5 file from the store if it exists
    if (personalDetails.uploadPanCard) {
      await deleteFromS3(personalDetails.uploadPanCard);
    }

    // Update the addressProof5 URL in the personalDetails object
    personalDetails.uploadPanCard = imageUrl;
  }

  // Update addressProof6 files if provided
  if (
    req.files &&
    req.files.uploadVoterPassportId &&
    req.files.uploadVoterPassportId.length > 0
  ) {
    const files = req.files.uploadVoterPassportId;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));

    // Delete existing addressProof6 files from the store if they exist
    if (personalDetails.uploadVoterPassportId) {
      await Promise.all(
        personalDetails.uploadVoterPassportId.map((file) => deleteFromS3(file))
      );
    }

    // Update the addressProof6 URLs in the personalDetails object
    personalDetails.uploadVoterPassportId = data;
  }

  // Update addressProof7 file if provided
  if (
    req.files &&
    req.files.uploadDrivingLicense &&
    req.files.uploadDrivingLicense[0]
  ) {
    const file = req.files.uploadDrivingLicense[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof7 file from the store if it exists
    if (personalDetails.uploadDrivingLicense) {
      await deleteFromS3(personalDetails.uploadDrivingLicense);
    }

    // Update the addressProof7 URL in the personalDetails object
    personalDetails.uploadDrivingLicense = imageUrl;
  }

  // Update addressProof8 files if provided
  if (
    req.files &&
    req.files.uploadElectricWaterBill &&
    req.files.uploadElectricWaterBill.length > 0
  ) {
    const files = req.files.uploadElectricWaterBill;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));

    // Delete existing addressProof8 files from the store if they exist
    if (personalDetails.uploadElectricWaterBill) {
      await Promise.all(
        personalDetails.uploadElectricWaterBill.map((file) =>
          deleteFromS3(file)
        )
      );
    }

    // Update the addressProof8 URLs in the personalDetails object
    personalDetails.uploadElectricWaterBill = data;
  }

  // Update addressProof9 file if provided
  if (
    req.files &&
    req.files.uploadBankPassbook &&
    req.files.uploadBankPassbook[0]
  ) {
    const file = req.files.uploadBankPassbook[0];
    const imageUrl = await uploadToS3(file);

    // Delete existing addressProof9 file from the store if it exists
    if (personalDetails.uploadBankPassbook) {
      await deleteFromS3(personalDetails.uploadBankPassbook);
    }

    // Update the addressProof9 URL in the personalDetails object
    personalDetails.uploadBankPassbook = imageUrl;
  }

  // Update addressProof10 files if provided
  if (
    req.files &&
    req.files.uploadOtherDetails &&
    req.files.uploadOtherDetails.length > 0
  ) {
    const files = req.files.uploadOtherDetails;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));

    // Delete existing addressProof10 files from the store if they exist
    if (personalDetails.uploadOtherDetails) {
      await Promise.all(
        personalDetails.uploadOtherDetails.map((file) => deleteFromS3(file))
      );
    }

    // Update the addressProof10 URLs in the personalDetails object
    personalDetails.uploadOtherDetails = data;
  }

  // Save the updated personalDetails object
  await personalDetails.save();

  res.status(200).json({
    success: true,
    message: "Personal Details Updated Successfully",
    personalDetails,
  });
});


/***************** URL :  ***************/
exports.addBusinessDetail = catchAsyncError(async (req, res, next) => {
  // User ID
  const user = req.user._id;
  const storeId = req.user.storeId;

  // Check if business details already exist for the user
  const business = await Business.findOne({ user });

  if (business) {
    // Business details already exist for the user
    return next(
      new AppError("Business details already exist for this user.", 400)
    );
  }

  // Request Body
  let {
    businessName,
    businessEmail,
    mobNumber,
    businessAddress1,
    businessAddress2,
    country,
    state,
    city,
    cityPinCode,
    RegistrationNumber,
    GstNumber,
    PanNumber,
  } = req.body;

  let businessIdProof1Url = null;
  let businessIdProof2Url = null;
  let businessIdProof3Url = null;
  let shopPhoto1Url = null;
  let businessIdProof4Url = [];

  let businessprofile1Url = null;
  let businessprofile2Url = null;
  let businessprofile3Url = null;
  let businessprofile4Url = [];
  let businessprofile5Url = null;
  let businessprofile6Url = [];
  let businessprofile7Url = null;
  let businessprofile8Url = [];

  /********** */

    // Check if businessIdProof1 file is provided
    if (req.files.businessProfileImage && req.files.businessProfileImage.length > 0) {
    const businessprofile1Obj = req.files.businessProfileImage[0];
    businessprofile1Url = await uploadToS3(businessprofile1Obj);
    }
  
    // Check if businessIdProof1 file is provided
    if (req.files.businessInformationCetificate && req.files.businessInformationCetificate.length > 0) {
      const businessprofile2Obj = req.files.businessInformationCetificate[0];
      businessprofile2Url = await uploadToS3(businessprofile2Obj);
    }
  
    // Check if businessIdProof2 file is provided
    if (req.files.businessGstCertificate && req.files.businessGstCertificate.length > 0) {
      const businessprofile3Obj = req.files.businessGstCertificate[0];
      businessprofile3Url = await uploadToS3(businessprofile3Obj);
    }

    if (req.files.businessElectricWater && req.files.businessElectricWater.length > 0) {
      const files = req.files.businessElectricWater;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      businessprofile4Url.push(data);
    }


    // Check if shopPhoto1 file is provided
    if ( req.files.businessVisitingCard && req.files.businessVisitingCard.length > 0) {
      const businessprofile4Obj = req.files.businessVisitingCard[0];
      businessprofile5Url = await uploadToS3(businessprofile4Obj);
    }
  
    if (req.files.businessSaleBillRecord && req.files.businessSaleBillRecord.length > 0) {
      const files = req.files.businessSaleBillRecord;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      businessprofile6Url.push(data);
    }

    // Check if shopPhoto1 file is provided
    if ( req.files.businessShopPicture && req.files.businessShopPicture.length > 0) {
      const businessprofile5Obj = req.files.businessShopPicture[0];
      businessprofile7Url = await uploadToS3(businessprofile5Obj);
    }
  
    if (req.files.businessOtherDocment && req.files.businessOtherDocment.length > 0) {
      const files = req.files.businessOtherDocment;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      businessprofile8Url.push(data);
    }

  /********** */
    // Check if businessIdProof1 file is provided
    if (req.files.businessPancard && req.files.businessPancard.length > 0) {
      const businessIdProof1Obj = req.files.businessPancard[0];
      businessIdProof1Url = await uploadToS3(businessIdProof1Obj);
    }

  // Check if businessIdProof1 file is provided
  if (req.files.businessPancard && req.files.businessPancard.length > 0) {
    const businessIdProof1Obj = req.files.businessPancard[0];
    businessIdProof1Url = await uploadToS3(businessIdProof1Obj);
  }

  // Check if businessIdProof2 file is provided
  if (req.files.businessBankStatementPDF && req.files.businessBankStatementPDF.length > 0) {
    const businessIdProof2Obj = req.files.businessBankStatementPDF[0];
    businessIdProof2Url = await uploadToS3(businessIdProof2Obj);
  }

  // Check if businessIdProof3 file is provided
  if (req.files.businessBankStatementPicture && req.files.businessBankStatementPicture.length > 0) {
    const businessIdProof3Obj = req.files.businessBankStatementPicture[0];
    businessIdProof3Url = await uploadToS3(businessIdProof3Obj);
  }

  // Check if shopPhoto1 file is provided
  if ( req.files.uploadSelfieWithShop && req.files.uploadSelfieWithShop.length > 0) {
    const shopPhoto1Obj = req.files.uploadSelfieWithShop[0];
    shopPhoto1Url = await uploadToS3(shopPhoto1Obj);
  }

  if (req.files.businessSalePurchaseFile && req.files.businessSalePurchaseFile.length > 0) {
    const files = req.files.businessSalePurchaseFile;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    businessIdProof4Url.push(data);
  }

  const businessDetails = await Business.create({
    user,
    businessName,
    businessEmail,
    mobNumber,
    businessAddress1,
    businessAddress2,
    country,
    state,
    city,
    cityPinCode,
    RegistrationNumber,
    GstNumber,
    PanNumber,
    businessPancard: businessIdProof1Url,
    businessBankStatementPDF: businessIdProof2Url,
    businessBankStatementPicture: businessIdProof3Url,
    uploadSelfieWithShop: shopPhoto1Url,
    businessSalePurchaseFile: businessIdProof4Url,

    businessProfileImage: businessprofile1Url,
    businessInformationCetificate: businessprofile2Url,
    businessGstCertificate: businessprofile3Url,
    businessElectricWater: businessprofile4Url,
    businessVisitingCard: businessprofile5Url,
    businessSaleBillRecord: businessprofile6Url,
    businessShopPicture: businessprofile7Url,
    businessOtherDocment: businessprofile8Url,
  });

  const userFromDb = await User.findById(user);
  if (!userFromDb) {
    return next(new AppError("User not found", 404));
  }
  userFromDb.businessProfileStatus = true;
  userFromDb.save();

  // Update store's personalProfileStatus
  const storeFromDb = await Store.findById(storeId);
  if (!storeFromDb) {
    return next(new AppError("Store not found", 404));
  }
  storeFromDb.businessProfileStatus = true;
  await storeFromDb.save();

  return res.status(201).json({
    success: true,
    message: "Business Details Updated Successfully",
    businessProfileStatus: userFromDb.businessProfileStatus,
    businessDetails,
  });
});

exports.updatebusinessDlt = catchAsyncError(async (req, res, next) => {
  const {
    businessName,
    businessEmail,
    mobNumber,
    businessAddress1,
    businessAddress2,
    city,
    cityPinCode,
  } = req.body;



  const user = req.user._id;

  // console.log("userrrrrrrrrrrrrrrrrrrrrrrr",user)

  // Fetch personal details for the user
  const businessDetails = await Business.findOne({ user });



  if (!businessDetails) {
    return next(new AppError("User does not exist", 400));
  }

  // Update the fields that were sent in the request body
  if (businessName) {
    businessDetails.businessName = businessName;
  }
  if (businessEmail) {
    businessDetails.businessEmail = businessEmail;
  }
  if (mobNumber) {
    businessDetails.mobNumber = mobNumber;
  }
  if (businessAddress1) businessDetails.businessAddress1 = businessAddress1;
  if (businessAddress2) businessDetails.businessAddress2 = businessAddress2;
  if (city) businessDetails.city = city;
  if (cityPinCode) businessDetails.cityPinCode = cityPinCode;

  //   // Update businessPancard file if provided
  let imageUrlPancard;
  if (req.files && req.files.businessPancard && req.files.businessPancard[0]) {
    const file = req.files.businessPancard[0];
    // console.log("file..................:", file);
    imageUrlPancard = await uploadToS3(file);

    // Delete existing businessPancard file from the store if it exists
    if (businessDetails.businessPancard) {
      try {
        await deleteFromS3(businessDetails.businessPancard);
        // console.log("Existing businessPancard deleted successfully.");
      } catch (error) {
        console.error("Error deleting existing businessPancard:", error);
      }
    }
  }
  // Update the businessPancard URL in the businessDetails object
  businessDetails.businessPancard = imageUrlPancard;
  // Update businessBankStatementPDF file if provided
  let imageUrlBankStatementPDF;
  if (
    req.files &&
    req.files.businessBankStatementPDF &&
    req.files.businessBankStatementPDF[0]
  ) {
    const file = req.files.businessBankStatementPDF[0];
    // console.log("file..................:", file);
    imageUrlBankStatementPDF = await uploadToS3(file);

    // Delete existing businessBankStatementPDF file from the store if it exists
    if (businessDetails.businessBankStatementPDF) {
      try {
        await deleteFromS3(businessDetails.businessBankStatementPDF);
        console.log("Existing businessBankStatementPDF deleted successfully.");
      } catch (error) {
        console.error(
          "Error deleting existing businessBankStatementPDF:",
          error
        );
      }
    }

    // Update the businessBankStatementPDF URL in the businessDetails object
    businessDetails.businessBankStatementPDF = imageUrlBankStatementPDF;
  }

  // Update businessBankStatementPicture file if provided
  let imageUrlBankStatementPicture;
  if (
    req.files &&
    req.files.businessBankStatementPicture &&
    req.files.businessBankStatementPicture[0]
  ) {
    const file = req.files.businessBankStatementPicture[0];
    // console.log("file..................:", file);
    imageUrlBankStatementPicture = await uploadToS3(file);

    // Delete existing businessBankStatementPicture file from the store if it exists
    if (businessDetails.businessBankStatementPicture) {
      await deleteFromS3(businessDetails.businessBankStatementPicture);
    }

    // Update the businessBankStatementPicture URL in the businessDetails object
    businessDetails.businessBankStatementPicture = imageUrlBankStatementPicture;
  }

  // Update businessSalePurchaseFile files if provided
  if (
    req.files &&
    req.files.businessSalePurchaseFile &&
    req.files.businessSalePurchaseFile.length > 0
  ) {
    const files = req.files.businessSalePurchaseFile;
    // console.log("files..................:", files);

    // Upload all files to S3 and get an array of URLs
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    // console.log("data..................:", data);

    // Delete existing businessSalePurchaseFile files from the store if they exist
    if (businessDetails.businessSalePurchaseFile) {
      await Promise.all(
        businessDetails.businessSalePurchaseFile.map((fileUrl) => deleteFromS3(fileUrl))
      );
    }

    // Update the businessSalePurchaseFile URLs in the businessDetails object
    businessDetails.businessSalePurchaseFile = data;
  }

  // Update uploadSelfieWithShop file if provided
  let imageUrlSelfieWithShop;
  if (
    req.files &&
    req.files.uploadSelfieWithShop &&
    req.files.uploadSelfieWithShop[0]
  ) {
    const file = req.files.uploadSelfieWithShop[0];
    // console.log("file..................:", file);
    imageUrlSelfieWithShop = await uploadToS3(file);

    // Delete existing uploadSelfieWithShop file from the store if it exists
    if (businessDetails.uploadSelfieWithShop) {
      await deleteFromS3(businessDetails.uploadSelfieWithShop);
    }

    // Update the uploadSelfieWithShop URL in the businessDetails object
    businessDetails.uploadSelfieWithShop = imageUrlSelfieWithShop;
  }

  await businessDetails.save();

  res.status(200).json({
    success: true,
    message: "Business Details Updated Successfully",
    businessDetails,
  });
});






/********************** ...New Personal Business Image Picker...*********************/
exports.adminPersonalBusinessImages = catchAsyncError(async (req, res) => {
  // Process file uploads
  let PersonalPthotoUrl = [];
  let BusinessPhotoUrl = [];

  if (req.files.adminPersonalPhotos && req.files.adminPersonalPhotos.length > 0) {
    const files = req.files.adminPersonalPhotos;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    PersonalPthotoUrl.push(data);
  }

  if (req.files.adminBusinessPhotos && req.files.adminBusinessPhotos.length > 0) {
    const files = req.files.adminBusinessPhotos;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    BusinessPhotoUrl.push(data);
  }
  // Send a response without saving in the database
  return res.status(201).send({
    success:true,
    message: 'Files uploaded successfully!',
    adminProfileImages: [
      {
        adminPersonalPhotos: PersonalPthotoUrl,
        adminBusinessPhotos: BusinessPhotoUrl,
      },
    ],
  });
});

/*************************** ....New Personal Detailss....**************************/
  exports.createPersonalDetails = catchAsyncError(async (req, res, next) => {
  const user = req.user._id;
  const storeId = req.user.storeId;

  const {
    name,
    email,
    phoneNumber,
    ownerAddress1,
    ownerAddress2,
    country,
    state,
    ownerCityName,
    ownerAreaPinCode,
    uploadAdharCardFront,
    uploadAdharCardBack,
    uploadPassport,
    uploadResidence,
    uploadPanCard,
    uploadVoterPassportId,
    uploadDrivingLicense,
    uploadElectricWaterBill,
    uploadBankPassbook,
    uploadOtherDetails,
    Nominee,
    NomineePhoneNumber,
    NomineeAdharNumber,
  } = req.body;

  // Check if personal details already exist for the user
  if (await PersonalDet.exists({ user })) {
    return next(new AppError("Personal details already exist for this user.", 400));
  }

  const personalDetails = await PersonalDet.create({
    user,
    name,
    email,
    phoneNumber,
    ownerAddress1,
    ownerAddress2,
    country,
    state,
    ownerCityName,
    ownerAreaPinCode,
    uploadAdharCardFront,
    uploadAdharCardBack,
    uploadPassport,
    uploadResidence,
    uploadPanCard,
    uploadVoterPassportId,
    uploadDrivingLicense,
    uploadElectricWaterBill,
    uploadBankPassbook,
    uploadOtherDetails,
    Nominee,
    NomineePhoneNumber,
    NomineeAdharNumber,
  });

  // Update user's and store's personalProfileStatus
  await User.findByIdAndUpdate(user, { personalProfileStatus: true });
  await Store.findByIdAndUpdate(storeId, { personalProfileStatus: true });

  return res.status(201).json({
    success: true,
    message: "Personal Detail Saved Successfully....",
    personalProfileStatus: user.personalProfileStatus,
    personalDetails,
  });
  });

  exports.updatePersonalDetails = catchAsyncError(async (req, res, next) => {
    const user = req.user._id;
    // console.log("....user.....",user)
    const {
      name,
      email,
      phoneNumber,
      ownerAddress1,
      ownerAddress2,
      country,
      state,
      ownerCityName,
      ownerAreaPinCode,
      uploadAdharCardFront,
      uploadAdharCardBack,
      uploadPassport,
      uploadResidence,
      uploadPanCard,
      uploadVoterPassportId,
      uploadDrivingLicense,
      uploadElectricWaterBill,
      uploadBankPassbook,
      uploadOtherDetails,
      Nominee,
      NomineePhoneNumber,
      NomineeAdharNumber,
    } = req.body;
  
    // Find and update personal details for the authenticated user
    const updatedPersonalDetails = await PersonalDet.findOneAndUpdate(
      { user },
      {
        name,
        email,
        phoneNumber,
        ownerAddress1,
        ownerAddress2,
        country,
        state,
        ownerCityName,
        ownerAreaPinCode,
        uploadAdharCardFront,
        uploadAdharCardBack,
        uploadPassport,
        uploadResidence,
        uploadPanCard,
        uploadVoterPassportId,
        uploadDrivingLicense,
        uploadElectricWaterBill,
        uploadBankPassbook,
        uploadOtherDetails,
        Nominee,
        NomineePhoneNumber,
        NomineeAdharNumber,
      },
      {
        new: true, // Return the modified document
        runValidators: true, // Run validators for the update
      }
    );
  
    // If personal details not found, return 404 error
    if (!updatedPersonalDetails) {
      return next(new AppError("Personal details not found", 404));
    }
  
    // Send the updated details in the response
    return res.status(200).json({
        success: true,
        message: "Personal Details Updated Successfully",
        updatedPersonalDetails,
    });
  });


/*************************** ....New Business Detailss....**************************/
  exports.createBusinessDetails = catchAsyncError(async (req, res, next) => {
  const { _id: user, storeId } = req.user;

  // Check if business details already exist for the user
  const existingBusiness = await Business.findOne({ user });

  if (existingBusiness) {
    return next(new AppError("Business details already exist for this user.", 400));
  }

  const {
    businessName,
    businessEmail,
    mobNumber,
    businessAddress1,
    businessAddress2,
    city,
    cityPinCode,
    country,
    state,
    RegistrationNumber,
    GstNumber,
    PanNumber,
    businessPancard,
    businessBankStatementPDF,
    businessBankStatementPicture,
    businessSalePurchaseFile,
    uploadSelfieWithShop,
    businessProfileImage,
    businessInformationCetificate,
    businessGstCertificate,
    businessElectricWater,
    businessVisitingCard,
    businessSaleBillRecord,
    businessShopPicture,
    businessOtherDocment,
  } = req.body;

  // Create a new business entry
  const business = new Business({
    user,
    businessName,
    businessEmail,
    mobNumber,
    businessAddress1,
    businessAddress2,
    city,
    cityPinCode,
    country,
    state,
    RegistrationNumber,
    GstNumber,
    PanNumber,
    businessPancard,
    businessBankStatementPDF,
    businessBankStatementPicture,
    businessSalePurchaseFile,
    uploadSelfieWithShop,
    businessProfileImage,
    businessInformationCetificate,
    businessGstCertificate,
    businessElectricWater,
    businessVisitingCard,
    businessSaleBillRecord,
    businessShopPicture,
    businessOtherDocment,
  });
  const savedBusiness = await business.save();

  await User.findByIdAndUpdate(user, { businessProfileStatus: true });
  await Store.findByIdAndUpdate(storeId, { businessProfileStatus: true });
  return res.status(201).json({
    success: true,
    message: 'Business details created successfully...',
    data: savedBusiness,
  });
  });

  exports.updateBusinessDetails = catchAsyncError(async (req, res, next) => {
    const user = req.user._id; // Get authenticated user ID
  
    const {
      businessName,
      businessEmail,
      mobNumber,
      businessAddress1,
      businessAddress2,
      city,
      cityPinCode,
      country,
      state,
      RegistrationNumber,
      GstNumber,
      PanNumber,
      businessPancard,
      businessBankStatementPDF,
      businessBankStatementPicture,
      businessSalePurchaseFile,
      uploadSelfieWithShop,
      businessProfileImage,
      businessInformationCetificate,
      businessGstCertificate,
      businessElectricWater,
      businessVisitingCard,
      businessSaleBillRecord,
      businessShopPicture,
      businessOtherDocment,
    } = req.body;
  
    // Find and update business details by user ID
    const updatedBusinessDetails = await Business.findOneAndUpdate(
      { user },
      {
        businessName,
        businessEmail,
        mobNumber,
        businessAddress1,
        businessAddress2,
        city,
        cityPinCode,
        country,
        state,
        RegistrationNumber,
        GstNumber,
        PanNumber,
        businessPancard,
        businessBankStatementPDF,
        businessBankStatementPicture,
        businessSalePurchaseFile,
        uploadSelfieWithShop,
        businessProfileImage,
        businessInformationCetificate,
        businessGstCertificate,
        businessElectricWater,
        businessVisitingCard,
        businessSaleBillRecord,
        businessShopPicture,
        businessOtherDocment,
      },
      {
        new: true, // Return the modified document
        runValidators: true, // Run validators for the update
      }
    );
  
    if (!updatedBusinessDetails) {
      return next(new AppError("Business details not found", 404));
    }
  
    return res.status(200).json({
      success: true,
      message: 'Business details updated successfully...',
      data: updatedBusinessDetails,
    });
  });
  

/**************************** ....New Get Whole Profile Data....********************/  
  exports.getAllProfileData = catchAsyncError(async (req, res) => {
  try {
    const userID = req.user._id;
 
    // Fetch the user object
    const user = await User.findById(userID).select(
      "name email phoneNumber storeId storeNumber"
    );

    const profileImageData = await ProfileImage.findOne({
      user: userID,
    }).populate("imageUrl");
    const fetchingPersonalProfileData = await PersonalDet.findOne({
      user: userID,
    });
    const fetchingBusinessProfileData = await Business.findOne({
      user: userID,
    });
    const fetchingFactoryEmail = await FactoryProfile.findOne({ user: userID });
    const fetchingSignatureImage = await SignatureImage.findOne({
      user: userID,
    }).populate("signatureFile1 signatureFile2");

    return res.status(200).json({
      success: true,
      message: "Profile Data Fetched Successfully",
      user,
      personalProfileData: fetchingPersonalProfileData ? [fetchingPersonalProfileData] : [],
      businessProfileData: fetchingBusinessProfileData ? [fetchingBusinessProfileData] : [],
      factoryEmailData: fetchingFactoryEmail ? [fetchingFactoryEmail] : [],
      signatureImageData: fetchingSignatureImage ? [fetchingSignatureImage] : [],
      profileImageData: profileImageData ? profileImageData : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching profile data",
      error: error.message,
    });
  }
  });



/**************************************************** User profilephoto post api *********************************/
exports.uploadProfileImage = catchAsyncError(async (req, res, next) => {
    const user = req.user; 
    const image = req.file;

    const fileUrl = await uploadToS3(image); 

    if (!fileUrl) {
      return next(new AppError("An error occurred during profile image upload", 400));
    }

  // Check if a profile image already exists for the user
  const existingProfileImage = await ProfileImage.findOne({ user: user._id });

  if (existingProfileImage) {
    return next(new AppError("Profile image already exists", 400));
  }

    const profileImage = new ProfileImage({
      user: user._id,
      imageUrl: fileUrl,
    });

    await profileImage.save();

      // Update the user's profilePhotoStatus
      user.profilePhotoStatus = true;
      await user.save();

    res.status(200).json({
      success: true,
      profilePhotoStatus: user.profilePhotoStatus,
      message: "Profile image uploaded successfully",
      imageUrl: fileUrl,
    });
  });
/**************************************************** User profilephoto Put api *********************************/
  exports.updateProfileImage = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    const image = req.file;
  
    const fileUrl = await uploadToS3(image);
  
    if (!fileUrl) {
      return next(new AppError("An error occurred during profile image upload", 400));
    }
  
    // Find the existing profile image for the user
    const existingProfileImage = await ProfileImage.findOne({ user: user._id });
  
    if (existingProfileImage) {
      // Log existing image URL
      // console.log('Existing Image URL:', existingProfileImage.imageUrl);
  
      // Delete the previous profile image from storage
      await deleteFromS3(existingProfileImage.imageUrl);
  
      // Log message after deletion
      console.log('Previous Image Deleted Successfully');
  
      // Update the existing profile image with the new image URL
      existingProfileImage.imageUrl = fileUrl;
      await existingProfileImage.save();
    } else {
      // Create a new profile image document
      const profileImage = new ProfileImage({
        user: user._id,
        imageUrl: fileUrl,
      });
      await profileImage.save();
    }
  
    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      imageUrl: fileUrl,
    });
  });
/*********************************************************Delete Profile Image ***********************************/  
exports.deleteProfileImage = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  // Find the existing profile image for the user
  const existingProfileImage = await ProfileImage.findOne({ user: user._id });

  if (!existingProfileImage) {
    return res.status(404).json({ success: false, message: "Profile image not found" });
  }

  // Delete the profile image from storage
  await deleteFromS3(existingProfileImage.imageUrl);

  // Delete the profile image document from the database
  await existingProfileImage.delete();

  res.status(200).json({
    success: true,
    message: "Profile image deleted successfully",
  });
});



/**************************************************** User Signaturephoto post api *********************************/
exports.uploadSignatureImage = catchAsyncError(async (req, res, next) => {
  const user = req.user; // Use req.user directly instead of req.user._id

  let signature1Url = null;
  let signature2Url = null;

  // Check if personal details already exist for the user
  const existingDetails = await SignatureImage.findOne({ user: user._id });

  if (existingDetails) {
    return next(new AppError("Personal details already exist for this user.", 400));
  }

  // Check if singnatureFile1 is provided
  if (req.files.signatureFile1 && req.files.signatureFile1.length > 0) {
    const signatureFile1obj = req.files.signatureFile1[0]; // Correct typo in the field name
    signature1Url = await uploadToS3(signatureFile1obj);
  }

  // Check if singnatureFile2 is provided
  if (req.files.signatureFile2 && req.files.signatureFile2.length > 0) {
    const signatureFile2obj = req.files.signatureFile2[0]; // Correct typo in the field name
    signature2Url = await uploadToS3(signatureFile2obj);
  }

  // Insert Data
  const signatureImgDetails = await SignatureImage.create({
    user: user._id, // Use user._id
    signatureFile1: signature1Url, // Correct field name
    signatureFile2: signature2Url, // Correct field name
  });

  // Update the user's profileSignatureStatus
  user.profileSignatureStatus = true;
  await user.save();

  return res.status(201).json({
    success: true,
    message: "Signature image uploaded successfully",
    profileSignatureStatus: user.profileSignatureStatus,
    signatureImgDetails,
  });
});
/**************************************************** User profilephoto Put api *********************************/
exports.updateSignatureImage = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  // Check if personal details already exist for the user
  const existingDetails = await SignatureImage.findOne({ user: user._id });

  if (!existingDetails) {
    return next(new AppError("Personal details do not exist for this user.", 400));
  }

  // Update file if provided for signatureFile1
  if (req.files && req.files.signatureFile1 && req.files.signatureFile1[0]) {
    const file = req.files.signatureFile1[0];
    // console.log("file..................:", file);
    const signature1Url = await uploadToS3(file);

    // Delete existing file from the store if it exists
    if (existingDetails.signatureFile1) {
      await deleteFromS3(existingDetails.signatureFile1);
    }

    // Update the URL
    existingDetails.signatureFile1 = signature1Url;
  }

  // Update file if provided for signatureFile2
  if (req.files && req.files.signatureFile2 && req.files.signatureFile2[0]) {
    const file = req.files.signatureFile2[0];
    // console.log("file..................:", file);
    const signature2Url = await uploadToS3(file);

    // Delete existing file from the store if it exists
    if (existingDetails.signatureFile2) {
      await deleteFromS3(existingDetails.signatureFile2);
    }

    // Update the URL
    existingDetails.signatureFile2 = signature2Url;
  }

  // Save the updated SignatureImage document
  await existingDetails.save();

  return res.status(200).json({
    success: true,
    message: "Signature image updated successfully",
    signatureImgDetails: existingDetails,
  });
});







/**************************************************** Factory details  Post api *********************************/




exports.createFactoryProfile = catchAsyncError(async (req, res) => {
  const user = req.user;

  const { factoryEmail } = req.body;

  // Check if a factory profile already exists for the user
  const existingFactoryProfile = await FactoryProfile.findOne({ user: user._id });

  if (existingFactoryProfile) {
    return res.status(400).json({
      success: false,
      message: "Factory profile already exists",
    });
  }

  const newFactoryProfile = await FactoryProfile.create({
    user: user._id,
    factoryEmail: factoryEmail,
  });

  user.profileFactoryStatus = true;
  await user.save();

  res.status(201).json({
    success: true,
    message: "Factory email added successfully",
    profileFactoryStatus: user.profileFactoryStatus,
    factoryEmail: newFactoryProfile.factoryEmail,
  });
});


/**************************************************** Factory details  Put api *********************************/


  exports.updateFactoryProfile = catchAsyncError(async (req, res) => {
    const user = req.user;
    const factoryEmail = req.body.factoryEmail;
  
    // Find the existing factory profile for the user
    const existingFactoryProfile = await FactoryProfile.findOne({ user: user._id });
  
    if (existingFactoryProfile) {
      // Update the existing factory profile with the new factory email
      existingFactoryProfile.factoryEmail = factoryEmail;
      await existingFactoryProfile.save();
  
      res.status(200).json({
        success: true,
        message: "Factory profile updated successfully",
        factoryEmail: factoryEmail,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  });
  


/*******************************************Change Password *********************************/

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Find the user by ID
  const user = await User.findById(userId).select("+password");

  console.log("sjcshshfhvh",userId)

  // Check if the current password matches the stored password
  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return next(new AppError("Current password is incorrect", 400));
  }

  // Set the new password
  user.password = newPassword;

  // Save the updated user
  await user.save();

  return res.status(200).json({success: true, message: "Password changed successfully" });
});



/************************************************ Request Api ***********************************/


/************************************************ Request Api save id in store***********************************/
exports.sendRequest = catchAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { storeId } = req.body;

  // Check user's profile completeness
  try {
    const store = await Store.findById(userId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const {
      businessProfileStatus,
      personalProfileStatus,
      // profilePhotoStatus,
      // profileSignatureStatus,
      // profileFactoryStatus,
    } = store ;

    if (
      businessProfileStatus &&
      personalProfileStatus
      // profilePhotoStatus 
      // profileSignatureStatus &&
      // profileFactoryStatus
    ) {

    // Replace 'Associate' with 'notAssociated' in the following sections:

    const designer = await Store.findById(userId);
    const fabric = await Store.findById(storeId);

    // Check if the designerId is already in the fabric's notAssociated or Associated array
    if (fabric.notAssociated.includes(userId) || fabric.Associated.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Request already sent",
      });
    }

    // Check if the fabricId is already in the designer's notAssociated or Associated array
    if (designer.notAssociated.includes(storeId) || designer.Associated.includes(storeId)) {
      return res.status(400).json({
        success: false,
        message: "Request already sent",
      });
    }

    // Check if the userId is already in the fabric's Associated array
    const isUserIdAlreadyAssociated = fabric.Associated.includes(userId);
    if (!isUserIdAlreadyAssociated) {
      // Add the designerId to the fabric's notAssociated array
      fabric.notAssociated.push(userId);
      await fabric.save();
    }

    // Check if the fabricId is already in the designer's Associated array
    const isFabricIdAlreadyAssociated = designer.Associated.includes(storeId);
    if (!isFabricIdAlreadyAssociated) {
      // Add the fabricId to the designer's notAssociated array
      designer.notAssociated.push(storeId);
      await designer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Request sent successfully",
    });
  }
    else {
      // Profile is incomplete, return an error message
      return res.status(400).json({
        success: false,
        message: "Complete your profile",
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


/************************************************* Accept Main Important API ***********************************************************************/


/********************************store id acceplt************************************************************/


exports.acceptRequest = catchAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { storeId } = req.body;

  const fabric = await Store.findById(userId); // Change User to Store
  const designer = await Store.findById(storeId); // Change User to Store

  if (!fabric || !designer) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if the designerId is in the fabric's notAssociated array
  if (!fabric.notAssociated.includes(storeId)) {
    return res.status(400).json({
      success: false,
      message: "Designer request not found",
    });
  }

  // Check if the fabricId is in the designer's notAssociated array
  if (!designer.notAssociated.includes(userId)) {
    return res.status(400).json({
      success: false,
      message: "Fabric request not found",
    });
  }

  // Update the credit for fabric and designer
  const creditLimit = 10000;
  const currentTime = Date.now();

  // Remove the designerId from the fabric's notAssociated array
  fabric.notAssociated.pull(storeId);
  // Add the designerId to the fabric's Associated array along with the current time and credit limit
  fabric.Associated.push({
    id: storeId,
    timer: currentTime,
    creditLimit,
    createdTime: currentTime,
  });
  await fabric.save();

  // Remove the fabricId from the designer's notAssociated array
  designer.notAssociated.pull(userId);
  // Add the fabricId to the designer's Associated array along with the current time and credit limit
  designer.Associated.push({
    id: userId,
    timer: currentTime,
    creditLimit,
    createdTime: currentTime,
  });
  await designer.save();

  return res.status(200).json({
    success: true,
    message: "Request accepted successfully",
  });
});




/*********************************  home discount  ************************/


exports.homeDiscount = catchAsyncError(async (req, res, next) => {
  // const user = req.user; 
  const { fabAddName, fabAddDiscount, storeNumber, fabAddDescription, fabAddCode } = req.body;
  const image = req.file;

  const fileUrl = await uploadToS3(image); 

  if (!fileUrl) {
    return next(new AppError("An error occurred during profile image upload", 400));
  }

  // Check if a HomeDiscount document with the same storeNumber already exists
  const existingHomeDiscount = await HomeDiscount.findOne({ storeNumber });

  if (existingHomeDiscount) {
    return next(new AppError("Home discount with the same storeNumber already exists", 400));
  }

  const homeDiscounthome = new HomeDiscount({
    // user: user._id,
    storeNumber,
    fabAddName,
    fabAddImage: fileUrl,
    fabAddDiscount,
    fabAddDescription,
    fabAddCode,
  });

  await homeDiscounthome.save();

  res.status(200).json({
    success: true,
    message: "Profile image uploaded successfully",
    homeDiscount: homeDiscounthome,
  });
});



/********************************* get home discount  ************************/


 
exports.getHomeDiscount= catchAsyncError(async (req, res, next) => {
  // const user = req.user;

  // Find the home discount details for the user
  const homeDiscount = await HomeDiscount.find();

  if (!homeDiscount) {
    return next(new AppError("Home discount details not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Home discount details retrieved successfully",
    homeDiscount,
  });
});



/********************************* Delete Api  *************************************/


exports.deleteHomeDiscountById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the HomeDiscount document by ID and delete it
  const deletedHomeDiscount = await HomeDiscount.findByIdAndDelete(id);

  // Check if the HomeDiscount document was found and deleted
  if (!deletedHomeDiscount) {
    return next(new AppError('HomeDiscount not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'HomeDiscount deleted successfully',
    deletedHomeDiscount,
  });
});
