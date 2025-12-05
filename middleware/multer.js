// const multer = require("multer");
// const path = require("path");
// const sharp = require("sharp");

// const fileStorage = multer.memoryStorage({
//   destination: (req, file, cb) => {
//     if (file.fieldname === "file") {
//       cb(null, "./images/file/");
//     } else if (
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
//       cb(null, "./images/address/");
//     } else if (
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
//       cb(null, "./images/buseness/");
//     } else if (file.fieldname === "businessBankStatementPDF") {
//       cb(null, "./images/buseness/pdfs");
//     } else if (file.fieldname === "profileImage") {
//       cb(null, "./images/profile/");
//     }

//     //  else if (file.fieldname === "signatureImage") {
//     //   cb(null, "./images/signature/");
//     // } 
//     else if (
//       file.fieldname === "signatureFile1 " ||
//       file.fieldname === "signatureFile2" 
//     ) {
//       cb(null, "./images/signature/");
//     }

// /*****************************************************/
//        /////////////
//        else if (
//         file.fieldname === " QuickOrderImages"
        
//       ) {
//         cb(null, "./images/QuickOrderImages/");
//       }
//       ////////////

//       else if (
//         file.fieldname === " QuickOrderImages1"
        
//       ) {
//         cb(null, "./images/QuickOrderImages1/");
//       }
//       ////////////


// /*****************************************************/

//     /////////////
//     else if (
//       file.fieldname === " customerFront" ||
//       file.fieldname === "customerBack" ||
//       file.fieldname === "customerSide"
      
//     ) {
//       cb(null, "./images/offlineCustomer/");
//     }
//     ////////////


//      /////////////
//      else if (
//       file.fieldname === " excel" ||
//       file.fieldname === "zip" 
      
//     ) {
//       cb(null, "./images/excel_zip_folder/");
//     }
//     ////////////


//         /////////////
//         else if (
//           file.fieldname === " customerOwnFabricImage" 
//         ) {
//           cb(null, "./images/customerOwnFabricImage/");
//         }
//         ////////////


//         /////////////
//         else if (
//           file.fieldname === " CategoryImage"||
//           file.fieldname === "CategoryProductImg" 
//         ) 
//         {
//           cb(null, "./images/CategoryImage/");
//         }
//         ////////////


//            /////////////
//            else if (
//             file.fieldname === " mesurmentImage"
//           ) 
//           {
//             cb(null, "./images/mesurmentImage/");
//           }
//           ////////////

//              /////////////
//              else if (
//               file.fieldname === " customerOwnMeasurmentImage"
//             ) 
//             {
//               cb(null, "./images/customerOwnMeasurmentImage/");
//             }
//             ////////////


//                    /////////////
//                    else if (
//                     file.fieldname === " InstructionPhoto"||
//                     file.fieldname === " InstructionNotes"||
//                     file.fieldname === " InstructionVoice"
//                   ) 
//                   {
//                     cb(null, "./images/InstructionPhotoNotesVoice/");
//                   }
//                   ////////////

//                    /////////////
//                    else if (
//                     file.fieldname === " contrastStylePhoto"
//                   ) 
//                   {
//                     cb(null, "./images/contrastStylePhoto/");
//                   }
//                   ////////////


//            else if (
//             file.fieldname === " buttonImage"
//           ) 
//           {
//             cb(null, "./images/buttonImage/");
//           }
//           ////////////



//            /////////////
//            else if (
//             file.fieldname === " buttonHoleImage"
//           ) 
//           {
//             cb(null, "./images/buttonHoleImage/");
//           }
//           ////////////



//         /////////////
//         else if (
//         file.fieldname === " SubCategoryImage"
                  
//         ) {
//         cb(null, "./images/SubCategoryImage/");
//         }
//         ////////////


        
        

//     else if (file.fieldname === "discountImage") {
//       cb(null, "./images/discount/");
//     } else if (
//       file.fieldname === "shopPhoto1" ||
//       file.fieldname === "shopPhoto2"
//     ) {
//       cb(null, "./images/shop/");
//     } 
//     /********* */

//     else if (file.fieldname === "fabImage") {
//       cb(null, "./images/fabImage/");
//     } 

//     else if (file.fieldname === "fabImageOptional1"||
//              file.fieldname === "fabImageOptional2"||
//              file.fieldname === "fabImageOptional3"
//              ) {
//       cb(null, "./images/fabImageOptional/");
//     } 

//     /********** */


//     else if (file.fieldname === "profileImage") {
//       cb(null, "./images/profileImage/");
//     } else if (
//       file.fieldname === "designerImage" ||
//       file.fieldname === "fabricImage" ||
//       file.fieldname === "titleImage1"
//     ) {
//       cb(null, "./images/Category/");
//     } else if (file.fieldname === "businessSalePurchaseFile") {
//       cb(null, "./images/businessSalePurchaseFile/");
//     } 
    


//     else if 
//     (file.fieldname === "workerProfileImage"||
//     file.fieldname === "aadharCardFront"||
//     file.fieldname === "aadharCardBack"||
//     file.fieldname === "panCardFront"||
//     file.fieldname === "employmentDocumentPdf1"||
//     file.fieldname === "employmentDocumentPdf2"||
//     file.fieldname === "otherDocument1"||
//     file.fieldname === "otherDocument2"
//     ){
//       cb(null, "./images/workerProfileImage/");
//     } 


//     /************ Redimate Products and accessories ********/



//         /////////////
//         else if (
//           file.fieldname === " ReadymadeProductImage"
                    
//           ) {
//           cb(null, "./images/ReadymadeProductImage/");
//           }
//           ////////////
  

//           /////////////
//         else if (
//           file.fieldname === " ReadymadeAccessoriesImage"
                    
//           ) {
//           cb(null, "./images/ReadymadeAccessoriesImage/");
//           }
//           ////////////
  

// //////////// New Start with Quickorder setup for superadmin///////////

//          /////////////
//          else if (
//           file.fieldname === " SuperadminProductPhoto"
                    
//           ) {
//           cb(null, "./images/SuperadminProductPhoto/");
//           }
//           ////////////

//           /////////////
//          else if (
//           file.fieldname === " SuperadminSubproductPhoto"
                    
//           ) {
//           cb(null, "./images/SuperadminSubproductPhoto/");
//           }
//           ////////////


//           /////////////
//          else if (
//           file.fieldname === " SuperadminStylePhoto"
                    
//           ) {
//           cb(null, "./images/SuperadminStylePhoto/");
//           }
//           ////////////          

// //////////////////////////////////////////////////////////////////
    
// //////////// New Start with Quickorder setup for admin///////////

//          /////////////
//          else if (
//           file.fieldname === " adminProductPhoto"
                    
//           ) {
//           cb(null, "./images/adminProductPhoto/");
//           }
//           ////////////

//           /////////////
//          else if (
//           file.fieldname === " adminSubproductPhoto"
                    
//           ) {
//           cb(null, "./images/adminSubproductPhoto/");
//           }
//           ////////////


//           /////////////
//          else if (
//           file.fieldname === " adminStylePhoto"
                    
//           ) {
//           cb(null, "./images/adminStylePhoto/");
//           }
//           ////////////          

// //////////////////////////////////////////////////////////////////
    
//          /////////////
//          else if (
//           file.fieldname === " superadminMeasurmentphoto"
                    
//           ) {
//           cb(null, "./images/superadminMeasurmentphoto/");
//           }
//           ////////////

//                    /////////////
//          else if (
//           file.fieldname === " adminMeasurmentphoto"
                    
//           ) {
//           cb(null, "./images/adminMeasurmentphoto/");
//           }
//           ////////////

// ////////////////////////////////////////////////////////////////////////



// //////////////////////////////////////////////////////////////////
    
//          /////////////
//          else if (
//           file.fieldname === " superadminButtonPthoto"
                    
//           ) {
//           cb(null, "./images/superadminButtonPthoto/");
//           }
//           ////////////

//          /////////////
//          else if (
//           file.fieldname === " superadminButtonHolePthoto"
                    
//           ) {
//           cb(null, "./images/superadminButtonHolePthoto/");
//           }
//           ////////////


//           /////////////
//          else if (
//           file.fieldname === " superadminButtonThreadPthoto"
                    
//           ) {
//           cb(null, "./images/superadminButtonThreadPthoto/");
//           }
//           ////////////

// ////////////////////////////////////////////////////////////////////////


// //////////////////////////////////////////////////////////////////
    
//          /////////////
//          else if (
//           file.fieldname === " adminButtonPthoto"
                    
//           ) {
//           cb(null, "./images/adminButtonPthoto/");
//           }
//           ////////////

//          /////////////
//          else if (
//           file.fieldname === " adminButtonHolePthoto"
                    
//           ) {
//           cb(null, "./images/adminButtonHolePthoto/");
//           }
//           ////////////


//           /////////////
//          else if (
//           file.fieldname === " adminButtonThreadPthoto"
                    
//           ) {
//           cb(null, "./images/adminButtonThreadPthoto/");
//           }
//           ////////////


//           /////////////
//          else if (
//           file.fieldname === " adminQrImages"
                    
//           ) {
//           cb(null, "./images/adminQrImages/");
//           }
//           ////////////


//           /////////////Universal Image Picker////////////
//          else if (
//           file.fieldname === " adminProductsImage"
                    
//           ) {
//           cb(null, "./images/adminProductsImage/");
//           }
//           //////////////////////////////////////////////
//          /////////////Universal Image Picker////////////
//          else if (
//           file.fieldname === " adminFabricsImage"
                    
//           ) {
//           cb(null, "./images/fabImage/");
//           }
//           //////////////////////////////////////////////





// ////////////////////////////////////////////////////////////////////////


//     else if (
//       file.fieldname === "appraelImages" ||
//       file.fieldname === "creditLimitImages" ||
//       file.fieldname === "fastDeliveryImages"
//     ) {
//       cb(null, "./images/onboardingpageImages/");
//     } else if (file.fieldname === "storeImage") {
//       cb(null, "./images/storeImage/");
//     }



//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: fileStorage,
//   limits: {
//     fileSize: 47185920, // 45MB in bytes (45 * 1024 * 1024)
//   },

// fileFilter: (req, file, cb) => {
//   console.log('Field Name:', file.fieldname);
//   console.log('Original Name:', file.originalname);
  
//   if (
//     file.fieldname === "file" ||
//     file.fieldname === "profileImage" ||
//     file.fieldname === "uploadAdharCardFront" ||
//     file.fieldname === "uploadAdharCardBack" ||
//     file.fieldname === "uploadPassport" ||
//     file.fieldname === "uploadResidence" ||
//     file.fieldname === "uploadPanCard" ||
//     file.fieldname === "uploadVoterPassportId" ||
//     file.fieldname === "uploadDrivingLicense" ||
//     file.fieldname === "uploadElectricWaterBill"||
//     file.fieldname === "uploadBankPassbook"||
//     file.fieldname === "uploadOtherDetails"||

//     file.fieldname === "adminPersonalPhotos"||

    
//     file.fieldname === "fabImage" ||
//     // file.fieldname === "signatureImage" ||
//     file.fieldname === "signatureFile1" ||
//     file.fieldname === "signatureFile2" ||


//     file.fieldname === "businessPancard" ||
//     file.fieldname === "businessBankStatementPDF" ||
//     file.fieldname === "businessBankStatementPicture" ||
//     file.fieldname === "uploadSelfieWithShop" ||
//     file.fieldname === "businessProfileImage" ||
//     file.fieldname === "businessInformationCetificate" ||
//     file.fieldname === "businessGstCertificate"||
//     file.fieldname === "businessElectricWater" ||
//     file.fieldname === "businessVisitingCard" ||
//     file.fieldname === "businessSaleBillRecord"||
//     file.fieldname === "businessShopPicture" ||
//     file.fieldname === "businessOtherDocment"||

//     file.fieldname === "adminBusinessPhotos"||


//     file.fieldname === "designerImage" ||

//     file.fieldname === "fabricImage" ||
//     file.fieldname === "fabImageOptional1" ||
//     file.fieldname === "fabImageOptional2" ||
//     file.fieldname === "fabImageOptional3" ||

    
//     file.fieldname === "titleImage1" ||
//     file.fieldname === "businessSalePurchaseFile" ||


//     file.fieldname === "workerProfileImage" ||
//     file.fieldname === "aadharCardFront" ||
//     file.fieldname === "aadharCardBack" ||
//     file.fieldname === "panCardFront" ||
//     file.fieldname === "employmentDocumentPdf1" ||
//     file.fieldname === "employmentDocumentPdf2" ||
//     file.fieldname === "otherDocument1" ||
//     file.fieldname === "otherDocument2" ||


//     file.fieldname === "appraelImages" ||
//     file.fieldname === "creditLimitImages" ||
//     file.fieldname === "fastDeliveryImages" ||
//     file.fieldname === "discountImage" ||
//     file.fieldname === "storeImage" ||
//     file.fieldname === "adminAudio"||

//     file.fieldname === "QuickOrderImages"||
//     file.fieldname === "QuickOrderImages1"||
    


//     file.fieldname === "customerFront"||
//     file.fieldname === "customerBack" ||
//     file.fieldname === "customerSide" ||




//     file.fieldname === "customerOwnFabricImage" ||



    
//     file.fieldname === "CategoryImage" ||

//     file.fieldname === "SubCategoryImage"||

//     file.fieldname === "CategoryProductImg"||
    

    
//     file.fieldname === "mesurmentImage" ||
//     file.fieldname === "customerOwnMeasurmentImage" ||

    
//     file.fieldname === "InstructionPhoto" ||
//     file.fieldname === "InstructionNotes" ||
//     file.fieldname === "InstructionVoice" ||

    
//     file.fieldname === "contrastStylePhoto" ||



//     file.fieldname === "buttonImage" ||

//     file.fieldname === "buttonHoleImage" ||

    
//     file.fieldname === "ReadymadeProductImage" ||
//     file.fieldname === "ReadymadeAccessoriesImage"||





//     file.fieldname === "SuperadminProductPhoto" ||    
//     file.fieldname === "SuperadminSubproductPhoto" ||
//     file.fieldname === "SuperadminStylePhoto" ||


//     file.fieldname === "adminProductPhoto" ||    
//     file.fieldname === "adminSubproductPhoto" ||
//     file.fieldname === "adminStylePhoto"||


//     file.fieldname === "superadminMeasurmentphoto"||
//     file.fieldname === "adminMeasurmentphoto"||


//     file.fieldname === "superadminButtonPthoto"||
//     file.fieldname === "superadminButtonHolePthoto"||
//     file.fieldname === "superadminButtonThreadPthoto"||

//     file.fieldname === "adminButtonPthoto"||
//     file.fieldname === "adminButtonHolePthoto"||
//     file.fieldname === "adminButtonThreadPthoto"||

//     file.fieldname === "adminQrImages"||


//     file.fieldname === "adminProductsImage"||
//     file.fieldname === "adminFabricsImage"||

//     file.fieldname === " excel" ||
//     file.fieldname === "zip" 



    
//   ) {
//     // const allowedExtensions = /\.(jpg|jpeg|png|pdf|mp3|mp4)$/i;
//     const allowedExtensions = /\.(jpg|jpeg|png|pdf|webp|mpeg|mp3|mp4|mov|mkv|flv|m4a|ogg|wav|aiff|flac|unitypackage|asset|prefab|obj|glb|xlsx|csv|zip)$/i;


//     if (!file.originalname.match(allowedExtensions)) {
//       if (file.fieldname === "adminAudio") {
//         cb(new Error("Please upload an mp3 or mp4 audio file."));
//       } else {
//         cb(new Error("Please upload an image. "));
//       }
//     } else {
//       cb(null, true);
//     }
//   } else {
//     cb(new Error("Invalid field name"));
//   }
// },
// });


// module.exports = { upload };





const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

// Define a lookup object to map fieldnames to their respective folders
const uploadDirectories = {
  file: "./images/file/",
  uploadAdharCardFront: "./images/address/",
  uploadAdharCardBack: "./images/address/",
  uploadPassport: "./images/address/",
  uploadResidence: "./images/address/",
  uploadPanCard: "./images/address/",
  uploadVoterPassportId: "./images/address/",
  uploadDrivingLicense: "./images/address/",
  uploadElectricWaterBill: "./images/address/",
  uploadBankPassbook: "./images/address/",
  uploadOtherDetails: "./images/address/",
  adminPersonalPhotos: "./images/address/",
  businessPancard: "./images/buseness/",
  businessBankStatementPicture: "./images/buseness/",
  uploadSelfieWithShop: "./images/buseness/",
  businessProfileImage: "./images/buseness/",
  businessInformationCetificate: "./images/buseness/",
  businessGstCertificate: "./images/buseness/",
  businessElectricWater: "./images/buseness/",
  businessVisitingCard: "./images/buseness/",
  businessSaleBillRecord: "./images/buseness/",
  businessShopPicture: "./images/buseness/",
  businessOtherDocment: "./images/buseness/",
  adminBusinessPhotos: "./images/buseness/",
  businessBankStatementPDF: "./images/buseness/pdfs",
  profileImage: "./images/profile/",
  signatureFile1: "./images/signature/",
  signatureFile2: "./images/signature/",
  QuickOrderImages: "./images/QuickOrderImages/",
  QuickOrderImages1: "./images/QuickOrderImages1/",
  customerFront: "./images/offlineCustomer/",
  customerBack: "./images/offlineCustomer/",
  customerSide: "./images/offlineCustomer/",
  excel: "./images/excel_zip_folder/",
  zip: "./images/excel_zip_folder/",
  customerOwnFabricImage: "./images/customerOwnFabricImage/",
  CategoryImage: "./images/CategoryImage/",
  CategoryProductImg: "./images/CategoryImage/",
  mesurmentImage: "./images/mesurmentImage/",
  customerOwnMeasurmentImage: "./images/customerOwnMeasurmentImage/",
  InstructionPhoto: "./images/InstructionPhotoNotesVoice/",
  InstructionNotes: "./images/InstructionPhotoNotesVoice/",
  InstructionVoice: "./images/InstructionPhotoNotesVoice/",
  contrastStylePhoto: "./images/contrastStylePhoto/",
  buttonImage: "./images/buttonImage/",
  buttonHoleImage: "./images/buttonHoleImage/",
  SubCategoryImage: "./images/SubCategoryImage/",
  discountImage: "./images/discount/",
  shopPhoto1: "./images/shop/",
  shopPhoto2: "./images/shop/",
  fabImage: "./images/fabImage/",
  fabImageOptional1: "./images/fabImageOptional/",
  fabImageOptional2: "./images/fabImageOptional/",
  fabImageOptional3: "./images/fabImageOptional/",
  designerImage: "./images/Category/",
  fabricImage: "./images/Category/",
  titleImage1: "./images/Category/",
  businessSalePurchaseFile: "./images/businessSalePurchaseFile/",
  workerProfileImage: "./images/workerProfileImage/",
  aadharCardFront: "./images/workerProfileImage/",
  aadharCardBack: "./images/workerProfileImage/",
  panCardFront: "./images/workerProfileImage/",
  employmentDocumentPdf1: "./images/workerProfileImage/",
  employmentDocumentPdf2: "./images/workerProfileImage/",
  otherDocument1: "./images/workerProfileImage/",
  otherDocument2: "./images/workerProfileImage/",
  ReadymadeProductImage: "./images/ReadymadeProductImage/",
  ReadymadeAccessoriesImage: "./images/ReadymadeAccessoriesImage/",
  SuperadminProductPhoto: "./images/SuperadminProductPhoto/",
  SuperadminSubproductPhoto: "./images/SuperadminSubproductPhoto/",
  SuperadminStylePhoto: "./images/SuperadminStylePhoto/",
  adminProductPhoto: "./images/adminProductPhoto/",
  adminSubproductPhoto: "./images/adminSubproductPhoto/",
  adminStylePhoto: "./images/adminStylePhoto/",
  superadminMeasurmentphoto: "./images/superadminMeasurmentphoto/",
  adminMeasurmentphoto: "./images/adminMeasurmentphoto/",
  superadminButtonPthoto: "./images/superadminButtonPthoto/",
  superadminButtonHolePthoto: "./images/superadminButtonHolePthoto/",
  superadminButtonThreadPthoto: "./images/superadminButtonThreadPthoto/",
  adminButtonPthoto: "./images/adminButtonPthoto/",
  adminButtonHolePthoto: "./images/adminButtonHolePthoto/",
  adminButtonThreadPthoto: "./images/adminButtonThreadPthoto/",
  adminQrImages: "./images/adminQrImages/",
};

// Define the storage configuration
const fileStorage = multer.memoryStorage({
  destination: (req, file, cb) => {
    const uploadPath = uploadDirectories[file.fieldname]; // Get path from the map
    if (uploadPath) {
      cb(null, uploadPath);
    } else {
      cb(new Error("Invalid file fieldname"), null);
    }
  },
});

// Export the configured multer instance
const upload = multer({ storage: fileStorage });

module.exports = upload;
