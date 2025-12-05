// const path = require("path");
// const AWS = require("aws-sdk");

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   Bucket: process.env.S3_BUCKET_NAME,
//   BucketUrl: process.env.BUCKET_BASE_URL,
// });

// const uploadToS3 = async (file) => {
//   try {
//     if (!file || !file.originalname) {
//       throw new Error("File is undefined or has no originalname property.");
//     }

//     console.log("Uploading file:", file.originalname);
//     const ext = path.extname(file.originalname.toString());
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: null,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };

//     let keyName;

//     if (
//       file.fieldname === "uploadAdharCardFront" ||
//       file.fieldname === "uploadAdharCardBack" ||
//       file.fieldname === "uploadPassport" ||
//       file.fieldname === "uploadResidence"||
//       file.fieldname === "uploadPanCard" ||
//       file.fieldname === "uploadVoterPassportId" ||
//       file.fieldname === "uploadDrivingLicense" ||
//       file.fieldname === "uploadElectricWaterBill"||
//       file.fieldname === "uploadBankPassbook"||
//       file.fieldname === "uploadOtherDetails"||
      
//       file.fieldname === "adminPersonalPhotos"

//     ) {
//       keyName = `uploads/addressFiles/${Date.now()}${ext}`;
//     }
//     if (
//       file.fieldname === "designerImage" ||
//       file.fieldname === "fabricImage" ||
//       file.fieldname === "titleImage1"
//       // file.fieldname === "fabricProfileImage"
//       // file.fieldname === "designerImage"
//     ) {
//       keyName = `uploads/CategoryImagesSplashScreen/${Date.now()}${ext}`;
//     }

//     if (
//       file.fieldname === "businessPancard" ||
//       file.fieldname === "businessBankStatementPicture" ||
//       file.fieldname === "uploadSelfieWithShop"||
//       file.fieldname === "businessProfileImage" ||
//       file.fieldname === "businessInformationCetificate" ||
//       file.fieldname === "businessGstCertificate"||
//       file.fieldname === "businessElectricWater" ||
//       file.fieldname === "businessVisitingCard" ||
//       file.fieldname === "businessSaleBillRecord"||
//       file.fieldname === "businessShopPicture" ||
//       file.fieldname === "businessOtherDocment"||

//       file.fieldname === "adminBusinessPhotos"
//     ) {
//       keyName = `uploads/busenessFiles/${Date.now()}${ext}`;
//     }
//     if (file.fieldname === "businessBankStatementPDF") {
//       keyName = `uploads/busenessFiles/pdfs/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "shopPhoto1" || file.fieldname === "shopPhoto2") {
//       keyName = `uploads/shopFiles/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "fabImage") {
//       keyName = `uploads/fabImage/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "fabImageOptional1"||
//         file.fieldname === "fabImageOptional2"||
//         file.fieldname === "fabImageOptional3"
//         ) {
//       keyName = `uploads/fabImageOptional/${Date.now()}${ext}`;
//     }


//     if (file.fieldname === "profileImage") {
//       keyName = `uploads/profileImage/${Date.now()}${ext}`;
//     }

//     // if (file.fieldname === "signatureImage") {
//     //   keyName = `uploads/signatureImage/${Date.now()}${ext}`;
//     // }

//     if (
//       file.fieldname === "signatureFile1" ||
//       file.fieldname === "signatureFile2" 
//     ) {
//       keyName = `uploads/signatureImage/${Date.now()}${ext}`;
//     }


// /************************************************************/

//     if (
//       file.fieldname === "QuickOrderImages"
//     ) {
//       keyName = `uploads/QuickOrderImages/${Date.now()}${ext}`;
//     }

//     if (
//       file.fieldname === "QuickOrderImages1"
//     ) {
//       keyName = `uploads/QuickOrderImages1/${Date.now()}${ext}`;
//     }

// /************************************************************/




//     ////////////////
//     if (
//       file.fieldname === "customerFront" ||
//       file.fieldname === "customerBack" ||
//       file.fieldname === "customerSide" 
//     ) {
//       keyName = `uploads/offlineCustomerImages/${Date.now()}${ext}`;
//     }
//     ////////////////
//         ////////////////
//         if (
//           file.fieldname === "InstructionPhoto" ||
//           file.fieldname === "InstructionNotes" ||
//           file.fieldname === "InstructionVoice" 
//         ) {
//           keyName = `uploads/InstructionPhotoNotesVoice/${Date.now()}${ext}`;
//         }
//         ////////////////

//         ////////////////
//         if (
//           file.fieldname === "contrastStylePhoto"
//         ) {
//           keyName = `uploads/contrastStylePhoto/${Date.now()}${ext}`;
//         }        

//       ////////////////
      
//       if (
//         file.fieldname === "customerOwnFabricImage"
//       ) {
//         keyName = `uploads/customerOwnFabricImage/${Date.now()}${ext}`;
//       }
//       ////////////////

    

//     if (file.fieldname === "discountImage") {
//       keyName = `uploads/discountImage/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "file") {
//       keyName = `uploads/file/${Date.now()}${ext}`;
//     }
//     if (file.fieldname === "address") {
//       keyName = `uploads/address/${Date.now()}${ext}`;
//     }
//     if (file.fieldname === "businessSalePurchaseFile") {
//       keyName = `uploads/businessSalePurchaseFile/${Date.now()}${ext}`;
//     }



//     //////////////////////////////////////////////////
//     if (
//       file.fieldname === "workerProfileImage"||
//       file.fieldname === "aadharCardFront"||
//       file.fieldname === "aadharCardBack"||
//       file.fieldname === "panCardFront"
//       // file.fieldname === "employmentDocumentPdf1"||
//       // file.fieldname === "employmentDocumentPdf2"||
//       // file.fieldname === "otherDocument1"||
//       // file.fieldname === "otherDocument2"
      
//       ) {
//       keyName = `uploads/workerProfileImage/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "employmentDocumentPdf1"||
//         file.fieldname === "employmentDocumentPdf2"||
//         file.fieldname === "otherDocument1"||
//         file.fieldname === "otherDocument2"
        
//     ) {
//       keyName = `uploads/workerProfileImage/pdfs/${Date.now()}${ext}`;
//     }

//   //////////////////////////////////////////////////


//     if (
//       file.fieldname === "appraelImages" ||
//       file.fieldname === "creditLimitImages" ||
//       file.fieldname === "fastDeliveryImages"
//     ) {
//       keyName = `uploads/onboardingpageImages/${Date.now()}${ext}`;
//     }
//     if (file.fieldname === "storeImage") {
//       keyName = `uploads/storeImage/${Date.now()}${ext}`;
//     }

    
//    /********************for audio file ************************/
//     if (file.fieldname === "adminAudio") {
//       keyName = `uploads/adminAudioFiles/${Date.now()}${ext}`;
//     }


//     /*********************************************************/
//     if (file.fieldname === "CategoryImage"||
//         file.fieldname === "CategoryProductImg"
//     ) {
//       keyName = `uploads/CategoryImageFiles/${Date.now()}${ext}`;
//     }


//     if (file.fieldname === "SubCategoryImage") {
//       keyName = `uploads/SubCategoryImageFiles/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "mesurmentImage") {
//       keyName = `uploads/mesurmentImageFiles/${Date.now()}${ext}`;
//     }


//     if (file.fieldname === "customerOwnMeasurmentImage") {
//       keyName = `uploads/customerOwnMeasurmentImageFiles/${Date.now()}${ext}`;
//     }


//     if (file.fieldname === "buttonImage") {
//       keyName = `uploads/buttonImageFiles/${Date.now()}${ext}`;
//     }

//     if (file.fieldname === "buttonHoleImage") {
//       keyName = `uploads/buttonHoleImageFiles/${Date.now()}${ext}`;
//     }

//     /*************************ReadymadeProductImage and ReadymadeAccessoriesImage*******************/
         
//           ////////////////
      
//           if (
//             file.fieldname === "ReadymadeProductImage"
//           ) {
//             keyName = `uploads/ReadymadeProductImage/${Date.now()}${ext}`;
//           }
//           ////////////////



//           ////////////////
      
//           if (
//             file.fieldname === "ReadymadeAccessoriesImage"
//           ) {
//             keyName = `uploads/ReadymadeAccessoriesImage/${Date.now()}${ext}`;
//           }
//           ////////////////    
          
          
// ///////////////////////////////// new start with Quickorder setup superadmin ///////////



//           ////////////////
      
//           if (
//             file.fieldname === "SuperadminProductPhoto"
//           ) {
//             keyName = `uploads/SuperadminProductPhoto/${Date.now()}${ext}`;
//           }
//           ////////////////

//           ////////////////
      
//           if (
//             file.fieldname === "SuperadminSubproductPhoto"
//           ) {
//             keyName = `uploads/SuperadminSubproductPhoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "SuperadminStylePhoto"
//           ) {
//             keyName = `uploads/SuperadminStylePhoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

// /////////////////////////////////////////////////////////////////////////////////////          


// ///////////////////////////////// new start with Quickorder setup admin ///////////


//           ////////////////
      
//           if (
//             file.fieldname === "adminProductPhoto"
//           ) {
//             keyName = `uploads/adminProductPhoto/${Date.now()}${ext}`;
//           }
//           ////////////////

//           ////////////////
      
//           if (
//             file.fieldname === "adminSubproductPhoto"
//           ) {
//             keyName = `uploads/adminSubproductPhoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "adminStylePhoto"
//           ) {
//             keyName = `uploads/adminStylePhoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

// ///////////////////////////////////////////////////////////////////////////////////// 

//           ////////////////Superadmin
      
//           if (
//             file.fieldname === "superadminMeasurmentphoto"
//           ) {
//             keyName = `uploads/superadminMeasurmentphoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////Admin
      
//           if (
//             file.fieldname === "adminMeasurmentphoto"
//           ) {
//             keyName = `uploads/adminMeasurmentphoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

// ////////////////////////////////////////////////////////////////////////////////



// ///////////////////////////////////////////////////////////////////////////////////// 

//           ////////////////
      
//           if (
//             file.fieldname === "superadminButtonPthoto"
//           ) {
//             keyName = `uploads/superadminButtonPthoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "superadminButtonHolePthoto"
//           ) {
//             keyName = `uploads/superadminButtonHolePthoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "superadminButtonThreadPthoto"
//           ) {
//             keyName = `uploads/superadminButtonThreadPthoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

// ////////////////////////////////////////////////////////////////////////////////



// ///////////////////////////////////////////////////////////////////////////////////// 

//           ////////////////
      
//           if (
//             file.fieldname === "adminButtonPthoto"
//           ) {
//             keyName = `uploads/adminButtonPthoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "adminButtonHolePthoto"
//           ) {
//             keyName = `uploads/adminButtonHolePthoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "adminButtonThreadPthoto"
//           ) {
//             keyName = `uploads/adminButtonThreadPthoto/${Date.now()}${ext}`;
//           }
//           ////////////////  

//           ////////////////
      
//           if (
//             file.fieldname === "adminQrImages"
//           ) {
//             keyName = `uploads/adminQrImages/${Date.now()}${ext}`;
//           }
//           //////////////// 


//            ////////////////
      
//           if (
//             file.fieldname === "adminProductsImage"
//           ) {
//             keyName = `uploads/adminProductsImages/${Date.now()}${ext}`;
//           }
//           //////////////// 
//           ////////////////
      
//           if (
//             file.fieldname === "adminFabricsImage"
//           ) {
//             keyName = `uploads/fabImage/${Date.now()}${ext}`;
//           }
//           //////////////// 

//           //    
// ////////////////////////////////////////////////////////////////////////////////



//     console.log("Key Name:", keyName);

//     params.Key = keyName;
//     const data = await s3.upload(params).promise();
//     console.log("File uploaded successfully. Location:", data.Location);
//     return data.Location;
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw error;
//   }
// };
// module.exports = uploadToS3;






/********************* */

// const path = require("path");
// const AWS = require("aws-sdk");

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   Bucket: process.env.S3_BUCKET_NAME,
//   BucketUrl: process.env.BUCKET_BASE_URL,
// });

// const uploadToS3 = async (file) => {
//   try {
//     if (!file || !file.originalname) {
//       throw new Error("File is undefined or has no originalname property.");
//     }

//     console.log("Uploading file:", file.originalname);
//     const ext = path.extname(file.originalname.toString());
    
//     const fileCategoryMap = {
//       "uploadAdharCardFront": "addressFiles",
//       "uploadAdharCardBack": "addressFiles",
//       "uploadPassport": "addressFiles",
//       "uploadResidence": "addressFiles",
//       "uploadPanCard": "addressFiles",
//       "uploadVoterPassportId": "addressFiles",
//       "uploadDrivingLicense": "addressFiles",
//       "uploadElectricWaterBill": "addressFiles",
//       "uploadBankPassbook": "addressFiles",
//       "uploadOtherDetails": "addressFiles",
//       "adminPersonalPhotos": "addressFiles",
//       "designerImage": "CategoryImagesSplashScreen",
//       "fabricImage": "CategoryImagesSplashScreen",
//       "titleImage1": "CategoryImagesSplashScreen",
//       "businessPancard": "busenessFiles",
//       "businessBankStatementPicture": "busenessFiles",
//       "uploadSelfieWithShop": "busenessFiles",
//       "businessProfileImage": "busenessFiles",
//       "businessInformationCetificate": "busenessFiles",
//       "businessGstCertificate": "busenessFiles",
//       "businessElectricWater": "busenessFiles",
//       "businessVisitingCard": "busenessFiles",
//       "businessSaleBillRecord": "busenessFiles",
//       "businessShopPicture": "busenessFiles",
//       "businessOtherDocment": "busenessFiles",
//       "adminBusinessPhotos": "busenessFiles",
//       "businessBankStatementPDF": "busenessFiles/pdfs",
//       "shopPhoto1": "shopFiles",
//       "shopPhoto2": "shopFiles",
//       "fabImage": "fabImage",
//       "fabImageOptional1": "fabImageOptional",
//       "fabImageOptional2": "fabImageOptional",
//       "fabImageOptional3": "fabImageOptional",
//       "profileImage": "profileImage",
//       "signatureFile1": "signatureImage",
//       "signatureFile2": "signatureImage",
//       "QuickOrderImages": "QuickOrderImages",
//       "QuickOrderImages1": "QuickOrderImages1",
//       "customerFront": "offlineCustomerImages",
//       "customerBack": "offlineCustomerImages",
//       "customerSide": "offlineCustomerImages",
//       "InstructionPhoto": "InstructionPhotoNotesVoice",
//       "InstructionNotes": "InstructionPhotoNotesVoice",
//       "InstructionVoice": "InstructionPhotoNotesVoice",
//       "contrastStylePhoto": "contrastStylePhoto",
//       "customerOwnFabricImage": "customerOwnFabricImage",
//       "discountImage": "discountImage",
//       "file": "file",
//       "address": "address",
//       "businessSalePurchaseFile": "businessSalePurchaseFile",
//       "workerProfileImage": "workerProfileImage",
//       "aadharCardFront": "workerProfileImage",
//       "aadharCardBack": "workerProfileImage",
//       "panCardFront": "workerProfileImage",
//       "employmentDocumentPdf1": "workerProfileImage/pdfs",
//       "employmentDocumentPdf2": "workerProfileImage/pdfs",
//       "otherDocument1": "workerProfileImage/pdfs",
//       "otherDocument2": "workerProfileImage/pdfs",
//       "appraelImages": "onboardingpageImages",
//       "creditLimitImages": "onboardingpageImages",
//       "fastDeliveryImages": "onboardingpageImages",
//       "storeImage": "storeImage",
//       "adminAudio": "adminAudioFiles",
//       "CategoryImage": "CategoryImageFiles",
//       "CategoryProductImg": "CategoryImageFiles",
//       "SubCategoryImage": "SubCategoryImageFiles",
//       "mesurmentImage": "mesurmentImageFiles",
//       "customerOwnMeasurmentImage": "customerOwnMeasurmentImageFiles",
//       "buttonImage": "buttonImageFiles",
//       "buttonHoleImage": "buttonHoleImageFiles",
//       "ReadymadeProductImage": "ReadymadeProductImage",
//       "ReadymadeAccessoriesImage": "ReadymadeAccessoriesImage",
//       "SuperadminProductPhoto": "SuperadminProductPhoto",
//       "SuperadminSubproductPhoto": "SuperadminSubproductPhoto",
//       "SuperadminStylePhoto": "SuperadminStylePhoto",
//       "adminProductPhoto": "adminProductPhoto",
//       "adminSubproductPhoto": "adminSubproductPhoto",
//       "adminStylePhoto": "adminStylePhoto"
//     };

//     const folderName = fileCategoryMap[file.fieldname] || "uploads/others";
//     const keyName = `${folderName}/${Date.now()}${ext}`;

//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: keyName,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };

//     const data = await s3.upload(params).promise();
//     console.log("File uploaded successfully:", data.Location);
//     return data.Location;
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw error;
//   }
// };

// module.exports = { uploadToS3 };





/*************** */


const path = require("path");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  Bucket: process.env.S3_BUCKET_NAME,
  BucketUrl: process.env.BUCKET_BASE_URL,
});

const uploadToS3 = async (file) => {
  try {
    if (!file || !file.originalname) {
      throw new Error("File is undefined or has no originalname property.");
    }

    console.log("Uploading file:", file.originalname);
    const ext = path.extname(file.originalname.toString()).toLowerCase();

    const fileCategoryMap = {
      "uploadZip": "zipFiles", // Explicitly handle ZIP uploads
      "uploadAdharCardFront": "addressFiles",
      "uploadAdharCardBack": "addressFiles",
      "uploadPassport": "addressFiles",
      "uploadResidence": "addressFiles",
      "uploadPanCard": "addressFiles",
      "uploadVoterPassportId": "addressFiles",
      "uploadDrivingLicense": "addressFiles",
      "uploadElectricWaterBill": "addressFiles",
      "uploadBankPassbook": "addressFiles",
      "uploadOtherDetails": "addressFiles",
      "adminPersonalPhotos": "addressFiles",
      "designerImage": "CategoryImagesSplashScreen",
      "fabricImage": "CategoryImagesSplashScreen",
      "titleImage1": "CategoryImagesSplashScreen",
      "businessPancard": "busenessFiles",
      "businessBankStatementPicture": "busenessFiles",
      "uploadSelfieWithShop": "busenessFiles",
      "businessProfileImage": "busenessFiles",
      "businessInformationCetificate": "busenessFiles",
      "businessGstCertificate": "busenessFiles",
      "businessElectricWater": "busenessFiles",
      "businessVisitingCard": "busenessFiles",
      "businessSaleBillRecord": "busenessFiles",
      "businessShopPicture": "busenessFiles",
      "businessOtherDocment": "busenessFiles",
      "adminBusinessPhotos": "busenessFiles",
      "businessBankStatementPDF": "busenessFiles/pdfs",
      "shopPhoto1": "shopFiles",
      "shopPhoto2": "shopFiles",
      "fabImage": "fabImage",
      "fabImageOptional1": "fabImageOptional",
      "fabImageOptional2": "fabImageOptional",
      "fabImageOptional3": "fabImageOptional",
      "profileImage": "profileImage",
      "signatureFile1": "signatureImage",
      "signatureFile2": "signatureImage",
      "QuickOrderImages": "QuickOrderImages",
      "QuickOrderImages1": "QuickOrderImages1",
      "customerFront": "offlineCustomerImages",
      "customerBack": "offlineCustomerImages",
      "customerSide": "offlineCustomerImages",
      "InstructionPhoto": "InstructionPhotoNotesVoice",
      "InstructionNotes": "InstructionPhotoNotesVoice",
      "InstructionVoice": "InstructionPhotoNotesVoice",
      "contrastStylePhoto": "contrastStylePhoto",
      "customerOwnFabricImage": "customerOwnFabricImage",
      "discountImage": "discountImage",
      "file": "file",
      "address": "address",
      "businessSalePurchaseFile": "businessSalePurchaseFile",
      "workerProfileImage": "workerProfileImage",
      "aadharCardFront": "workerProfileImage",
      "aadharCardBack": "workerProfileImage",
      "panCardFront": "workerProfileImage",
      "employmentDocumentPdf1": "workerProfileImage/pdfs",
      "employmentDocumentPdf2": "workerProfileImage/pdfs",
      "otherDocument1": "workerProfileImage/pdfs",
      "otherDocument2": "workerProfileImage/pdfs",
      "appraelImages": "onboardingpageImages",
      "creditLimitImages": "onboardingpageImages",
      "fastDeliveryImages": "onboardingpageImages",
      "storeImage": "storeImage",
      "adminAudio": "adminAudioFiles",
      "CategoryImage": "CategoryImageFiles",
      "CategoryProductImg": "CategoryImageFiles",
      "SubCategoryImage": "SubCategoryImageFiles",
      "mesurmentImage": "mesurmentImageFiles",
      "customerOwnMeasurmentImage": "customerOwnMeasurmentImageFiles",
      "buttonImage": "buttonImageFiles",
      "buttonHoleImage": "buttonHoleImageFiles",
      "ReadymadeProductImage": "ReadymadeProductImage",
      "ReadymadeAccessoriesImage": "ReadymadeAccessoriesImage",
      "SuperadminProductPhoto": "SuperadminProductPhoto",
      "SuperadminSubproductPhoto": "SuperadminSubproductPhoto",
      "SuperadminStylePhoto": "SuperadminStylePhoto",
      "adminProductPhoto": "adminProductPhoto",
      "adminSubproductPhoto": "adminSubproductPhoto",
      "adminStylePhoto": "adminStylePhoto"
    };

    // Determine folder name
    let folderName = fileCategoryMap[file.fieldname] || "uploads/others";

    // Ensure all ZIP files go to "zipFiles" folder regardless of fieldname
    if (ext === ".zip") {
      folderName = "zipFiles";
    }

    const keyName = `${folderName}/${Date.now()}${ext}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: keyName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    console.log("File uploaded successfully:", data.Location);
    return data.Location;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

module.exports = uploadToS3;
