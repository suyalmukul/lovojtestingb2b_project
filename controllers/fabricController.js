const Fabrics = require("../models/fabric");
const FabricsForSuperadmin = require("../models/FabricForSuperadmin");
const FabricForUSerMakingCharges = require("../models/fabricForUser");
const fabricInventory = require("../models/fabricInventory");
const QRCode = require('qrcode');
const Store = require("../models/stores");
const uploadToS3 = require("../utils/s3Upload");
// const { uploadToS3 } = require("../utils/s3Upload");

const Cart = require("../models/cart");
const fabricService = require("../services/fabric.service");
const deleteFromS3 = require("../utils/deleteFroms3");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const AppError = require("../utils/errorHandler");
const findCombinations = require("../utils/combination"); // Import the findCombinations function
const { generateQRCode } = require("../utils/others");
const { getIO } = require("../utils/setupSocket");
const xlsx = require("xlsx");
// const fs = require("fs");
// const fs = require('fs').promises; // Use promise-based file system
const path = require('path');
const unzipper = require("unzipper");
const extractFolder = 'uploads/extracted/'; // Ensure this is the correct extraction folder
const AdmZip = require("adm-zip");
const fs = require("fs-extra");
const OthersService = require("../services/others.service");
const FabricForSuperadmin = require("../models/FabricForSuperadmin");
//createFabricDashNumber

/***************** ADD FABRIC ***************/

exports.addFabric = catchAsyncError(async (req, res, next) => {
  const io = await getIO();
  const user = req.user;
  const { storeId } = user;
  const data = req.body;

  // Insert the fabric and get the created fabric object
  const fabric = await fabricService.insertFabric(storeId, data);

  // Generate QR code 
  const getFabricAPIUrl = `https://admin.lovoj.com/${fabric._id}`;
  const base64String = await generateQRCode(getFabricAPIUrl);
  const qrCodeURL = base64String.replace(/^data:image\/png;base64,/, '');

  fabric.qrCodeURL = qrCodeURL;
  await fabric.save();

  // Socket emit
  if (io) {
    await io.emit('newFabric', fabric);
  }

  return res.status(200).json({
    success: true,
    message: "Fabric added successfully to the database.",
    fabric,
    qrCodeURL
  });
});



exports.getFabricForQrCode = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  try {
    // Find fabric by id
    const fabric = await Fabrics.findById(id);

    if (!fabric) {
      return res.status(404).json({ error: 'Fabric not found' });
    }

    // Extract specific properties
    const extractedData = {
      fabNumber: fabric.fabNumber,
      fabDashNumber: fabric.fabDashNumber,
      fabName: fabric.fabName,
      fabImage: fabric.fabImage,
      fabricCategory: fabric.fabricCategory,
      fabricBrand: fabric.fabricBrand,
      fabricColor: fabric.fabricColor,
      fabricComposition: fabric.fabricComposition,
      fabricSubCategory: fabric.fabricSubCategory,
      fabricMaterial: fabric.fabricMaterial,
      fabricPattern: fabric.fabricPattern,
      fabricType: fabric.fabricType,
      fabricCharacteristics: fabric.fabricCharacteristics,
      fabricSeason: fabric.fabricSeason,
    };

    return res.status(200).json({
      message: "Fabric Data list...",
      success: true,
      fabric: extractedData,
    });
  } catch (error) {
    console.error('Error Message:', error.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});

exports.getSuperadminFabricForQrCode = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  try {
    // Find fabric by id
    const fabricforsuperadmin = await FabricsForSuperadmin.findById(id);

    if (!fabricforsuperadmin) {
      return res.status(404).json({ error: 'Fabric not found' });
    }

    // Extract specific properties
    const extractedData = {
      fabNumber: fabricforsuperadmin.fabNumber,
      fabDashNumber: fabricforsuperadmin.fabDashNumber,
      fabName: fabricforsuperadmin.fabName,
      fabImage: fabricforsuperadmin.fabImage,
      fabricCategory: fabricforsuperadmin.fabricCategory,
      fabricBrand: fabricforsuperadmin.fabricBrand,
      fabricColor: fabricforsuperadmin.fabricColor,
      fabricComposition: fabricforsuperadmin.fabricComposition,
      fabricSubCategory: fabricforsuperadmin.fabricSubCategory,
      fabricMaterial: fabricforsuperadmin.fabricMaterial,
      fabricPattern: fabricforsuperadmin.fabricPattern,
      fabricType: fabricforsuperadmin.fabricType,
      fabricCharacteristics: fabricforsuperadmin.fabricCharacteristics,
      fabricSeason: fabricforsuperadmin.fabricSeason,
    };

    return res.status(200).json({
      message: "Fabric Data list...",
      success: true,
      fabricforsuperadmin: extractedData,
    });
  } catch (error) {
    console.error('Error Message:', error.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});

exports.getFabricByDashNumber = catchAsyncError(async (req, res, next) => {
  const fabDashNumber = req.params.fabDashNumber;
  try {
    const fabric = await Fabrics.findOne({ fabDashNumber });

    if (!fabric) {
      return res.status(404).json({ error: 'Fabric not found' });
    }

    // Extract specific properties
    const extractedData = {
      id: fabric._id,
      qrCodeURL: fabric.qrCodeURL,
      stockLocation: fabric.stockLocation,
      hascode: fabric.stockLocation,
      rollInfo: fabric.rollInfo,
    };

    return res.status(200).json({
      message: "Fabric QrUrl found successfully...",
      success: true,
      fabric: extractedData,
    });
  } catch (error) {
    console.error('Error Message:', error.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});


/****************************************************************************/

exports.getFabric = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;
  let { pipeline, countPipeline, totalCount } =
    await fabricService.getFabricPipeline(req.query, page, limit);

  const fabrics = await Fabrics.aggregate(pipeline);

  const countResult = await Fabrics.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };

  res.status(200).json({
    success: true,
    message: "Your Fabric lists",
    totalCount,
    page,
    showingResults,
    fabrics,
  });
});


/********************************** Serach fabric by fabric Dash Number *******************************************/

exports.visitStoregetFabric = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { storeId } = user;
  // console.log("storeId",storeId)
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;
  let { pipeline, countPipeline, totalCount } =
    await fabricService.visitStoregetFabricPipeline(storeId, req.query, page, limit);

  const fabrics = await Fabrics.aggregate(pipeline);

  const countResult = await Fabrics.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };

  res.status(200).json({
    success: true,
    message: "Your Fabric lists",
    totalCount,
    page,
    showingResults,
    fabrics,
  });
});

/***************** UPDATE FABRIC ***************/
/***************** URL : {{LOCAL_URL}}/fabric/updatefab/:id ***************/
exports.updateFabric = catchAsyncError(async (req, res, next) => {
  const fabricCollection = await Fabrics.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!fabricCollection) {
    return next(new AppError("Fabric not found", 404));
  }

  if (req.file) {
    const fileObj = req.file;
    const fileUrl = await uploadToS3(fileObj);
    await deleteFromS3(fabricCollection.fabImage);
    fabricCollection.fabImage = fileUrl;
  }

  await fabricCollection.save();

  res.status(200).json({
    success: true,
    message: "Fabric updated successfully",
    updates: fabricCollection,
  });
});


/***************** GET FABRIC BY ID ***************/
/***************** URL : {{LOCAL_URL}}/fabric/getfabric/:id ***************/
exports.getFab = catchAsyncError(async (req, res, next) => {
  const fabricId = req.params.id;
  const fabric = await Fabrics.findById(fabricId);

  if (!fabric) {
    return next(new AppError("Fabric not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Fabric found successfully",
    fabric,
  });
});

/***************** GET FABRIC BY StoreNumber ***************/
/***************** URL : {{LOCAL_URL}}/fabric/getfabric/:storeNumber ***************/

exports.getFabStoreNumber = catchAsyncError(async (req, res, next) => {
  const fabricStoreNumber = req.params.storeNumber;
  const fabric = await Fabrics.findOne({
    fabricStoreNumber: fabricStoreNumber,
  });
  console.log("fabricStoreNumber is:", fabricStoreNumber);
  console.log("fabric data is:", fabric);

  if (!fabric) {
    return next(new AppError("Fabric not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Fabric found successfully",
    fabric,
  });
});

/***************** DELETE FABRIC ***************/
/***************** URL : {{LOCAL_URL}}/fabric/deletefab/:id ***************/
exports.deleteFabrics = catchAsyncError(async (req, res, next) => {
  const fabricId = req.params.id;
  console.log("fabid", fabricId);
  const deletedFabric = await Fabrics.findByIdAndDelete(fabricId);
  await deleteFromS3(deletedFabric.fabImage);

  if (!deletedFabric) {
    return next(new AppError("Fabric not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Fabric deleted successfully",
    deletedFabric: deletedFabric,
  });
});

/**********************************delete fabric by fabricDashNumber ************************/

exports.deleteFabric = catchAsyncError(async (req, res, next) => {
  const fabricId = req.params.fabDashNumber;
  const deletedFabric = await Fabrics.findByIdAndDelete(fabricId);
  await deleteFromS3(deletedFabric.fabImage);

  if (!deletedFabric) {
    return next(new AppError("Fabric not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Fabric deleted successfully",
    deletedFabric: deletedFabric,
  });
});

/********************************************Tushar k liyeeeee*******************************************************/

exports.getFabrics = async (req, res, next) => {
  try {
    const fabricId = req.params.id;
    const fabric = await Fabrics.findById(fabricId);
    if (!fabric) {
      return res
        .status(404)
        .json({ success: false, message: "Fabric not found" });
    }

    return res.status(200).json({ success: true, fabric });
  } catch (error) {
    return next(error);
  }
};

/***************************************** Check fabricDashNumber in Database **********************************/

// exports.checkFabDashNumber = catchAsyncError(async (req, res, next) => {
//   const { fabDashNumber, superadmin,inventory } = req.query; 

//   if (!fabDashNumber) {
//     return res.status(400).json({
//       success: false,
//       message: "fabDashNumber is required in query parameters.",
//     });
//   }

//   let existingFabric;
//   if (superadmin === "true") {
//     existingFabric = await FabricsForSuperadmin.findOne({ fabDashNumber });
//   } else {
//     existingFabric = await Fabrics.findOne({ fabDashNumber });
//   }

//   let existingFabric;
//   if (inventory === "true") {
//     existingFabric = await fabricInventory.findOne({ fabDashNumber });
//   } else {
//     existingFabric = await fabricInventory.findOne({ fabDashNumber });
//   }

//   //fabricInventory
//   if (existingFabric) {
//     return res.status(400).json({
//       success: false,
//       message: "The fabDashNumber already exists in the database. Please choose another number.",
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     message: "The fabDashNumber is available.",
//   });
// });



exports.checkFabDashNumber = catchAsyncError(async (req, res, next) => {
  const { fabDashNumber,dashnumber, superadmin, inventory } = req.query;

  if (!fabDashNumber) {
    return res.status(400).json({
      success: false,
      message: "fabDashNumber is required in query parameters.",
    });
  }

  // Check in FabricsForSuperadmin collection if superadmin is true
  if (superadmin === "true") {
    const existingSuperadminFabric = await FabricsForSuperadmin.findOne({ fabDashNumber });
    if (existingSuperadminFabric) {
      return res.status(400).json({
        success: false,
        message: "The fabDashNumber already exists in the Superadmin database. Please choose another number.",
      });
    }
  }

  // Check in fabricInventory collection if inventory is true
  if (inventory === "true") {
    const existingInventoryFabric = await fabricInventory.findOne({ dashnumber });
    if (existingInventoryFabric) {
      return res.status(400).json({
        success: false,
        message: "The fabDashNumber already exists in the Inventory database. Please choose another number.",
      });
    }
  }

  // Check in the main Fabrics collection (only if neither superadmin nor inventory is specified)
  if (!superadmin && !inventory) {
    const existingFabric = await Fabrics.findOne({ fabDashNumber });
    if (existingFabric) {
      return res.status(400).json({
        success: false,
        message: "The fabDashNumber already exists in the main Fabrics database. Please choose another number.",
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: "The fabDashNumber is available.",
  });
});



/************************************************* Combination testing Api For Roll with static data********************************/
/******************************************* Main and Working Combination Code *******************************************/

exports.getRollLength = catchAsyncError(async (req, res) => {
  const { target, id } = req.body; // Extract "target" and "id" from the request body

  if (!target || !id) {
    return res.status(400).json({
      error: 'Both "target" and "id" must be provided in the request body.',
    });
  }

  try {
    // Fetch the necessary data from the "Fabrics" collection based on the provided ID
    const fabric = await Fabrics.findById(
      id,
      "rollInfo perMeterPrice fabricDiscount"
    ); // Include perMeterPrice and fabricDiscount

    if (!fabric) {
      return res
        .status(404)
        .json({ error: "Fabric with the provided ID not found." });
    }

    let rollInfo = fabric.rollInfo; // Extract the "rollInfo" array
    const perMeterPrice = fabric.perMeterPrice;
    const fabricDiscount = fabric.fabricDiscount;

    // Calculate the beforeDiscount and afterDiscount prices
    const beforeDiscountPrice = target * perMeterPrice;
    const afterDiscountPrice = beforeDiscountPrice * (1 - fabricDiscount / 100);

    // Initialize an array to store combinations
    const combinations = [];

    /************************************* Normal data *******************************/

    // const normalData = await getFabricsGreaterThanTarget(target);
    // // Filter the additionaldbData array to include only one object with "rollLength" greater than the target
    // const filteredData = normalData
    //   .filter((data) => data._id.toString() === id)
    //   .map((data) => {
    //     const rollWithGreaterLength = data.rollInfo.find(
    //       (roll) => roll.rollLength >= target
    //     );

    //     if (rollWithGreaterLength) {
    //       // If a roll with greater length is found, include it in the response
    //       data.rollInfo = [rollWithGreaterLength];
    //     } else {
    //       // If no matching roll is found, set rollInfo as an empty array
    //       data.rollInfo = [];
    //     }

    //     // Create a new object with the desired response structure
    //     const responseObject = {
    //       perMeterPrice: data.perMeterPrice,
    //       fabricDiscount: data.fabricDiscount,
    //       beforeDiscount: beforeDiscountPrice, // Include beforeDiscountPrice before rollInfo
    //       rollInfo: data.rollInfo.map((roll) => ({
    //         rollLength: roll.rollLength,
    //         rollIdentity: roll.rollIdentity,
    //       })),
    //     };
    //     console.log("beforedst", beforeDiscountPrice);

    //     return responseObject;
    //   });

    const normalData = await getFabricsGreaterThanTarget(target);

    // Filter the additionaldbData array to include only one object with "rollLength" greater than or equal to the target
    const filteredData = normalData
      .filter((data) => data._id.toString() === id)
      .map((data) => {
        const rollsMatchingCondition = data.rollInfo
          .filter((roll) => roll.rollLength >= target)
          .sort((a, b) => a.rollLength - b.rollLength);
        if (rollsMatchingCondition.length > 0) {
          // If rolls with greater or equal length are found, include the one with the closest greater length
          const closestGreaterRoll = rollsMatchingCondition[0];
          data.rollInfo = [
            {
              rollLength: closestGreaterRoll.rollLength,
              rollIdentity: closestGreaterRoll.rollIdentity,
              _id: closestGreaterRoll._id,
            },
          ];
        } else {
          // If no matching rolls are found, set rollInfo as an empty array
          data.rollInfo = [];
        }
        // Create a new object with the desired response structure
        const responseObject = {
          perMeterPrice: data.perMeterPrice,
          fabricDiscount: data.fabricDiscount,
          beforeDiscount: beforeDiscountPrice, // Include beforeDiscountPrice before rollInfo
          rollInfo: data.rollInfo,
        };

        console.log("beforedst", beforeDiscountPrice);

        return responseObject;
      });


    /********************************************************************/

    // Check if target is greater than 10
    if (target > 10) {
      // Check if any roll in the array has a rollLength greater than or equal to the target
      const rollsMatchingTarget = rollInfo.filter(
        (roll) => roll.rollLength >= target
      );

      if (rollsMatchingTarget.length > 0) {
        // Find the roll with the minimum rollLength that is greater than or equal to the target
        const closestRoll = rollsMatchingTarget.reduce((prev, curr) => {
          return Math.abs(curr.rollLength - target) <
            Math.abs(prev.rollLength - target)
            ? curr
            : prev;
        });

        const combinationToAdd = {
          rollLength: closestRoll.rollLength,
          rollIdentity: closestRoll.rollIdentity,
          beforeDiscount: beforeDiscountPrice,
          afterDiscount: afterDiscountPrice, // Include beforeDiscountPrice in this object
        };

        // Set the response structure as an array of arrays
        const combinations = [[combinationToAdd]];

        // Calculate the total number of combinations (which is 1 in this case)
        const totalCombination = combinations.length;

        // Prepare and send the response with the desired structure
        return res.status(200).json({
          success: true,
          message: "Here is fabric Role",
          totalCombination,
          combinations,
          normalData: filteredData,
        });
      } else {
        // No matching combinations found in the database
        return res.status(200).json({
          success: true,
          message: "No matching combinations found in the database",
          totalCombination: 0,
          combinations: [],
        });
      }
    }

    // Create an array of objects that include both rollLength, rollIdentity, beforeDiscount, and afterDiscount
    const resultWithDetails = rollInfo.map((roll) => ({
      rollLength: roll.rollLength,
      rollIdentity: roll.rollIdentity,
      beforeDiscount: beforeDiscountPrice,
      afterDiscount: afterDiscountPrice,
    }));

    // // Calculate combinations based on the entire array of objects
    // const calculatedCombinations = calculateCombinations(
    //   resultWithDetails,
    //   target
    // );

    // // Calculate the total number of combinations
    // const totalCombination = calculatedCombinations.length;

    // // Calculate beforeDiscount and afterDiscount for each roll in each combination

    // const combinationsWithPrices = calculatedCombinations.map((combination) => {
    //   const combinationWithPrices = combination.map((roll) => {
    //     const rollBeforeDiscount = roll.rollLength * perMeterPrice;
    //     const rollAfterDiscount =
    //       rollBeforeDiscount * (1 - fabricDiscount / 100);
    //     return {
    //       ...roll,
    //       beforeDiscount: rollBeforeDiscount,
    //       afterDiscount: rollAfterDiscount,
    //     };
    //   });
    //   return combinationWithPrices;
    // });
    // console.log("combinationnsssss", combinationsWithPrices.length);

    /*****************/

    // Calculate combinations based on the entire array of objects
    const calculatedCombinations = calculateCombinations(
      resultWithDetails,
      target
    );

    // Filter out combinations where any roll has a rollLength exactly equal to the target
    const filteredCombinations = calculatedCombinations.filter(
      (combination) => {
        return combination.every((roll) => roll.rollLength !== target);
      }
    );

    // Calculate the total number of combinations after filtering
    const totalCombination = filteredCombinations.length;

    // Calculate beforeDiscount and afterDiscount for each roll in each combination
    const combinationsWithPrices = filteredCombinations.map((combination) => {
      const combinationWithPrices = combination.map((roll) => {
        const rollBeforeDiscount = roll.rollLength * perMeterPrice;
        const rollAfterDiscount =
          rollBeforeDiscount * (1 - fabricDiscount / 100);
        return {
          ...roll,
          beforeDiscount: rollBeforeDiscount,
          afterDiscount: rollAfterDiscount,
        };
      });
      return combinationWithPrices;
    });

    // If no combinations were found and target is less than or equal to 10
    if (combinationsWithPrices.length <= 0 && target <= 10) {
      // Filter rolls with a rollLength greater than the target
      const rollsGreaterThanTarget = rollInfo.filter(
        (roll) => roll.rollLength > target
      );

      /***************** main code ************ */

      // if (rollsGreaterThanTarget.length > 0) {
      //   // Find the roll with the minimum rollLength that is greater than the target
      //   const closestRoll = rollsGreaterThanTarget.reduce((prev, curr) => {
      //     return curr.rollLength < prev.rollLength ? curr : prev;
      //   });

      //   // Calculate beforeDiscountPrice and afterDiscountPrice
      //   const beforePrice = closestRoll.rollLength * perMeterPrice;
      //   const afterPrice = beforePrice * (1 - fabricDiscount / 100);

      //   // Push the roll information into the combinations array
      //   combinations.push({
      //     rollLength: closestRoll.rollLength,
      //     rollIdentity: closestRoll.rollIdentity,
      //     beforeDiscount: beforePrice,
      //     afterDiscount: afterPrice, // Include afterDiscountPrice in this object
      //   });
      // }


      /*********************** */


      const maxDifference = 3;

      // Filter rolls that are less than or equal to 10
      const rollsUnderTen = rollInfo.filter(roll => roll.rollLength <= 10);

      if (rollsUnderTen.length > 0) {
        // Sort rollsUnderTen array based on the absolute difference between rollLength and target
        rollsUnderTen.sort((a, b) => Math.abs(a.rollLength - target) - Math.abs(b.rollLength - target));

        // Find the first roll within the specified difference from the target
        const nearestRoll = rollsUnderTen.find(roll => Math.abs(roll.rollLength - target) <= maxDifference);

        // If there is a roll within the specified difference, include it in the response
        if (nearestRoll) {
          const beforePrice = nearestRoll.rollLength * perMeterPrice;
          const afterPrice = beforePrice * (1 - fabricDiscount / 100);

          // Push the roll information into the combinations array
          combinations.push([{
            rollLength: nearestRoll.rollLength,
            rollIdentity: nearestRoll.rollIdentity,
            beforeDiscount: beforePrice,
            afterDiscount: afterPrice,
          }]);
        }
      }


      return res.status(200).json({
        success: true,
        message: "Here is fabric Roleeeee.",
        totalCombination,
        combinations: combinations,
        normalData: filteredData,
      });
    }

    // Prepare and send the response
    return res.status(200).json({
      success: true,
      message: "Here are available combinations",
      totalCombination,
      fabricDiscount,
      combinations: combinationsWithPrices,
      normalData: filteredData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
});

exports.getRollLengthV1 = catchAsyncError(async (req, res) => {
  const { requiredMeters, id, stockLocation } = req.body;
  if (requiredMeters === undefined || id === undefined || typeof requiredMeters !== 'number' || !isFinite(requiredMeters)) {
    console.log(requiredMeters, id)
    return res.status(400).json({
      error: 'Bad Request - "requiredMeters" must be a valid number and "id" is required.',
    });
  }
  try {
    const fabric = await Fabrics.findById(
      id,
      "rollInfo perMeterPrice fabricDiscount"
    ).lean();

    if (!fabric) {
      return res
        .status(404)
        .json({ error: "Fabric with the provided ID not found." });
    }
    const { perMeterPrice, fabricDiscount } = fabric
    const rolls = fabric.rollInfo ? fabric.rollInfo : []
    if (stockLocation) {
      rolls = rolls.map(m => m.stockLocation == stockLocation)
    }
    let normalStock = findFabricsGreaterThanTarget(rolls, requiredMeters)
    if (normalStock) {
      normalStock.perMeterPrice = perMeterPrice
    }

    const combinedStocks = getAvailableOptions(rolls, requiredMeters, perMeterPrice, fabricDiscount, 2);
    let response = {
      success: true,
      message: "Here are available combinations",
      data: {
        combinedRollList: combinedStocks,
        singleRoll: normalStock,
        perMeterPrice: perMeterPrice,
        fabricDiscountRate: fabricDiscount
      }
    }
    res.status(200).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
});
exports.getRollCombination = catchAsyncError(async (req, res) => {
  const { requiredMeters, id, stockLocation } = req.query;
  if (requiredMeters === undefined || id === undefined || !stockLocation) {
    return res.status(400).json({
      error: 'Bad Request - "requiredMeters" must be a valid number and "id" is required.',
    });
  }
  try {
    const fabric = await FabricForSuperadmin.findById(
      id,
      "rollInfo perMeterPrice fabricDiscount"
    ).lean();

    if (!fabric) {
      return res
        .status(404)
        .json({ error: "Fabric with the provided ID not found." });
    }
    const { perMeterPrice, fabricDiscount } = fabric
    let rolls = fabric.rollInfo ? fabric.rollInfo : []
    if (stockLocation) {
      rolls = rolls.filter(m => m.stockLocation == stockLocation)
    }
    let normalStock = findFabricsGreaterThanTarget(rolls, requiredMeters)
    if (normalStock) {
      normalStock.perMeterPrice = perMeterPrice
    }

    const combinedStocks = getAvailableOptionsnoStockClearance(rolls, requiredMeters, perMeterPrice, fabricDiscount, 0);
    let response = {
      success: true,
      message: "Here are available combinations",
      data: {
        combinedRollList: combinedStocks,
        singleRoll: normalStock,
        perMeterPrice: perMeterPrice,
        fabricDiscountRate: fabricDiscount
      }
    }
    res.status(200).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
});


function getAvailableOptions(rolls, requiredCapacity, pricePerMeter, discount, extra) {
  const results = [];
  discount = discount / 100;

  function findValidCombinations(remainingRolls, remainingCapacity, currentSelection) {
    const totalInMeters = currentSelection.reduce((sum, { roll }) => sum + roll.rollLength, 0);

    if (
      totalInMeters >= requiredCapacity &&
      totalInMeters <= requiredCapacity + extra &&
      currentSelection.length > 1 // Skip options with a single roll
    ) {
      // Calculate the total cost before discount
      const totalCost = currentSelection.reduce(
        (sum, { roll }) => sum + roll.rollLength * pricePerMeter,
        0
      );

      // Calculate the discounted cost
      const discountedCost =
        currentSelection.length > 1 ? totalCost - totalCost * discount : totalCost;

      const combinationKey = currentSelection
        .map(({ roll }) => roll.rollLength)
        .sort((a, b) => a - b)
        .join('-');

      if (!seenCombinations.has(combinationKey)) {
        results.push({
          selectedRolls: [...currentSelection],
          priceBeforeDiscount: totalCost,
          priceAfterDiscount: discountedCost,
          totalInMeters,
        });
        seenCombinations.add(combinationKey);
      }
    }

    if (remainingRolls.length === 0 || totalInMeters > requiredCapacity + 2) {
      return;
    }

    const [currentRoll, ...restRolls] = remainingRolls;

    findValidCombinations(
      restRolls,
      remainingCapacity - currentRoll.rollLength,
      [...currentSelection, { roll: currentRoll }]
    );

    findValidCombinations(restRolls, remainingCapacity, currentSelection);
  }

  const seenCombinations = new Set();
  rolls.sort((a, b) => a.rollLength - b.rollLength);

  findValidCombinations(rolls, requiredCapacity, []);

  return results;
}
function getAvailableOptionsnoStockClearance(rolls, requiredCapacity, pricePerMeter, discount, extra) {
  const results = [];
  discount = discount / 100;

  function findValidCombinations(remainingRolls, remainingCapacity, currentSelection) {
    const totalInMeters = currentSelection.reduce((sum, { roll }) => sum + roll.deductLength, 0);

    if (
      totalInMeters >= requiredCapacity &&
      totalInMeters <= requiredCapacity &&
      currentSelection.length > 1 // Ensure at least two rolls
    ) {
      const totalCost = currentSelection.reduce(
        (sum, { roll }) => sum + roll.deductLength * pricePerMeter,
        0
      );
      const discountedCost =
        currentSelection.length > 1 ? totalCost - totalCost * discount : totalCost;

      const combinationKey = currentSelection
        .map(({ roll }) => roll.deductLength)
        .sort((a, b) => a - b)
        .join('-');

      if (!seenCombinations.has(combinationKey)) {
        results.push({
          selectedRolls: [...currentSelection],
          priceBeforeDiscount: totalCost,
          priceAfterDiscount: discountedCost,
          totalInMeters,
        });
        seenCombinations.add(combinationKey);
      }
    }

    if (remainingRolls.length === 0 || totalInMeters >= requiredCapacity) {
      return;
    }

    const [currentRoll, ...restRolls] = remainingRolls;

    // Option 1: Use the full roll (without modifying rollLength, introduce deductLength)
    findValidCombinations(
      restRolls,
      remainingCapacity - currentRoll.rollLength,
      [...currentSelection, { roll: { ...currentRoll, deductLength: currentRoll.rollLength } }]
    );

    // Option 2: Use a partial roll if the roll is larger than requiredCapacity
    if (currentRoll.rollLength > remainingCapacity) {
      findValidCombinations(
        restRolls,
        0, // Remaining capacity is now 0 since we're splitting this roll
        [...currentSelection, { roll: { ...currentRoll, deductLength: remainingCapacity } }]
      );
    }

    // Option 3: Skip the current roll
    findValidCombinations(restRolls, remainingCapacity, currentSelection);
  }

  const seenCombinations = new Set();
  rolls.sort((a, b) => a.rollLength - b.rollLength);

  findValidCombinations(rolls, requiredCapacity, []);

  return results;
}

// function getAvailableOptionsnoStockClearance(rolls, requiredCapacity, pricePerMeter, discount, extra) {
//   const results = [];
//   discount = discount / 100;

//   function findValidCombinations(remainingRolls, remainingCapacity, currentSelection) {
//     const totalInMeters = currentSelection.reduce((sum, { roll }) => sum + roll.rollLength, 0);

//     if (
//       totalInMeters >= requiredCapacity &&
//       totalInMeters <= requiredCapacity &&
//       currentSelection.length > 1 // Ensure at least two rolls
//     ) {
//       const totalCost = currentSelection.reduce(
//         (sum, { roll }) => sum + roll.rollLength * pricePerMeter,
//         0
//       );
//       const discountedCost =
//         currentSelection.length > 1 ? totalCost - totalCost * discount : totalCost;

//       const combinationKey = currentSelection
//         .map(({ roll }) => roll.rollLength)
//         .sort((a, b) => a - b)
//         .join('-');

//       if (!seenCombinations.has(combinationKey)) {
//         results.push({
//           selectedRolls: [...currentSelection],
//           priceBeforeDiscount: totalCost,
//           priceAfterDiscount: discountedCost,
//           totalInMeters,
//         });
//         seenCombinations.add(combinationKey);
//       }
//     }

//     if (remainingRolls.length === 0 || totalInMeters >= requiredCapacity) {
//       return;
//     }

//     const [currentRoll, ...restRolls] = remainingRolls;

//     // Option 1: Use the full roll
//     findValidCombinations(
//       restRolls,
//       remainingCapacity - currentRoll.rollLength,
//       [...currentSelection, { roll: currentRoll }]
//     );

//     // Option 2: Use a partial roll if the roll is larger than requiredCapacity
//     if (currentRoll.rollLength > remainingCapacity) {
//       findValidCombinations(
//         restRolls,
//         0, // Remaining capacity is now 0 since we're splitting this roll
//         [...currentSelection, { roll: { ...currentRoll, rollLength: remainingCapacity } }]
//       );
//     }

//     // Option 3: Skip the current roll
//     findValidCombinations(restRolls, remainingCapacity, currentSelection);
//   }

//   const seenCombinations = new Set();
//   rolls.sort((a, b) => a.rollLength - b.rollLength);

//   findValidCombinations(rolls, requiredCapacity, []);

//   return results;
// }


/************* Function for Normal role in one response *********************/


const getFabricsGreaterThanTarget = async (target) => {
  try {
    // Fetch fabrics with roll lengths greater than or equal to the target
    const fabrics = await Fabrics.find({
      "rollInfo.rollLength": { $gte: target },
    }).select("rollInfo perMeterPrice fabricDiscount");

    return fabrics;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const findFabricsGreaterThanTarget = (rollinfo, target) => {
  // Filter rolls with rollLength greater than or equal to the target
  const filtered = rollinfo.filter(roll => roll.rollLength >= target);

  // Find the next greater roll (minimum rollLength >= target)
  const nextGreater = filtered.reduce((acc, roll) => {
    return !acc || roll.rollLength <= acc.rollLength ? roll : acc;
  }, null);

  return nextGreater;
};
/******************** NearbyData *****************/
/************************************************************************/
function calculateCombinations(arr, target) {
  const result = [];

  function dfs(index, currentCombination, currentSum) {
    if (currentSum === target) {
      result.push([...currentCombination]);
      return;
    }

    if (currentSum > target || index === arr.length) {
      return;
    }

    const roll = arr[index];
    currentCombination.push(roll);
    dfs(index + 1, currentCombination, currentSum + roll.rollLength);
    currentCombination.pop();
    dfs(index + 1, currentCombination, currentSum);
  }

  dfs(0, [], 0);
  return result;
}


/************************************* Update Fabric (Main)******************/

exports.updateFabricById = catchAsyncError(async (req, res, next) => {
  const fabricId = req.params.id;
  const { user } = req;
  const { storeId } = user;
  const data = req.body;

  // Find the fabric by ID
  let fabric = await Fabrics.findById(fabricId);

  if (!fabric) {
    return res.status(404).json({
      success: false,
      message: "Fabric not found.",
    });
  }

  // Update the fabric fields
  fabric = await fabricService.updateFabric(fabric, data);

  return res.status(200).json({
    success: true,
    message: "Fabric updated successfully.",
    fabric,
  });
});




/*********************************** Update Fabric  ********************/

exports.updateRollInfo = catchAsyncError(async (req, res, next) => {
  const fabricId = req.params.id;
  const rollId = req.params.rollId;
  const rollData = req.body;

  const existingFabric = await Fabrics.findById(fabricId);

  if (!existingFabric) {
    return next(new AppError("Fabric not found", 404));
  }

  const rollIndex = existingFabric.rollInfo.findIndex(
    (roll) => roll._id.toString() === rollId
  );

  if (rollIndex === -1) {
    return next(new AppError("Roll not found", 404));
  }

  // Update the specific element in the array
  existingFabric.rollInfo[rollIndex].rollLength = rollData.rollLength;
  existingFabric.rollInfo[rollIndex].rollIdentity = rollData.rollIdentity;
  // Add other properties if needed

  // Save the updated fabric
  const updatedFabric = await existingFabric.save();

  return res.status(200).json({
    success: true,
    message: "RollInfo updated successfully",
    fabric: updatedFabric,
  });
});

/***************************** For Worker Cut Fabric ******************/
exports.updateRollLengthFabric = catchAsyncError(async (req, res, next) => {
  const io = await getIO();
  const { fabDashNumber, rollIdentity, rollLength } = req.body;

  try {
    const updatedFabric = await fabricService.updateFabricRollLength(fabDashNumber, rollIdentity, rollLength);
    if (updatedFabric) {
      // Socket emit
      if (io) {
        await io.emit('fabricUpdated', updatedFabric);
      }
      return res.status(200).json({
        success: true,
        message: "Roll length updated successfully",
        fabric: updatedFabric
      });

    } else {
      return res.status(404).json({
        success: true,
        message: "Roll not found Chose another roll.."
      });
    }
  } catch (error) {
    console.error("An error occurred while updating fabric:", error);
    return next(new AppError("An error occurred while updating fabric. Please try again later.", 500))
  }
});





/**********************************************************************************/
/********************************** Add Fabric For Superadmin  ********************/
exports.addFabricForSuperadmin = catchAsyncError(async (req, res, next) => {
  const data = req.body;
  const fileObj = req.files && req.files.fabImage ? req.files.fabImage[0] : null;

  // Add new fields for optional images
  const optionalFileObj1 = req.files && req.files.fabImageOptional1 ? req.files.fabImageOptional1[0] : null;
  const optionalFileObj2 = req.files && req.files.fabImageOptional2 ? req.files.fabImageOptional2[0] : null;
  const optionalFileObj3 = req.files && req.files.fabImageOptional3 ? req.files.fabImageOptional3[0] : null;

  // Insert the fabric and get the created fabric object
  const fabric = await fabricService.insertFabricForSuperadmin(data, fileObj, optionalFileObj1, optionalFileObj2, optionalFileObj3);

  // Generate QR code 
  //  const getFabricAPIUrl = `${process.env.BACKEND_URL}/fabric/getFabricById/${fabric._id}`
  // const getFabricAPIUrl = `https://vtushar.dlr9tim7wl44e.amplifyapp.com/fabric-qr-scan/${fabric._id}`
  const getFabricAPIUrl = `  https://admin.lovoj.com/${fabric._id}`
  const base64String = await generateQRCode(getFabricAPIUrl)
  const qrCodeURL = base64String.replace(/^data:image\/png;base64,/, '');

  fabric.qrCodeURL = qrCodeURL;
  await fabric.save();

  return res.status(200).json({
    success: true,
    message: "Fabric added successfully to the database.",
    fabric,
    qrCodeURL
  });

});


/********************************** Update Fabric For Superadmin  ********************/
exports.updateFabricForSuperadminById = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  // Find the fabric by ID
  let fabric = await FabricsForSuperadmin.findById(id);

  if (!fabric) {
    return res.status(404).json({
      success: false,
      message: "Fabric not found.",
    });
  }

  // Update the fabric fields
  fabric = await fabricService.updateFabricForSuperadmin(FabricsForSuperadmin, fabric, req.body); // Pass the fabric instance and the request body

  return res.status(200).json({
    success: true,
    message: "Fabric updated successfully.",
    fabric,
  });
});



/****************************** Get Fabric For Admin ****************************/
exports.getSuperadminFabrics = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 60;
  const page = parseInt(req.query.page) || 1;
  let { pipeline, countPipeline, totalCount } =
    await fabricService.getFabricPipeline(req.query, page, limit);

  const fabrics = await FabricsForSuperadmin.aggregate(pipeline);

  const countResult = await FabricsForSuperadmin.aggregate(countPipeline);

  totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };

  res.status(200).json({
    success: true,
    message: "Your Fabric lists",
    totalCount,
    page,
    showingResults,
    fabrics,
  });
});

/****************************** Delete Fabric For Admin ****************************/
exports.deleteSuperadminFabric = catchAsyncError(async (req, res, next) => {
  const fabricId = req.params.fabricId;
  const fabric = await FabricsForSuperadmin.findById(fabricId);
  if (!fabric) {
    return next(new AppError("Fabric not found", 404));
  }
  // Delete the fabric
  await fabric.remove();

  res.status(200).json({
    success: true,
    message: "Fabric deleted successfully",
  });
});


/************************** Add Fabric For admin In apresel page ****************/
exports.addFabricInStaringPage = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { storeId } = user;
  const data = req.body;

  // Insert the fabric and get the created fabric object
  const fabric = await fabricService.insertFabricForStatingPage(storeId, data,);

  // Generate QR code 
  //  const getFabricAPIUrl = `${process.env.BACKEND_URL}/fabric/getFabricById/${fabric._id}`
  // const getFabricAPIUrl = `https://vtushar.dlr9tim7wl44e.amplifyapp.com/fabric-qr-scan/${fabric._id}`
  const getFabricAPIUrl = `  https://admin.lovoj.com/${fabric._id}`
  const base64String = await generateQRCode(getFabricAPIUrl)
  const qrCodeURL = base64String.replace(/^data:image\/png;base64,/, '');

  fabric.qrCodeURL = qrCodeURL;
  await fabric.save();

  return res.status(200).json({
    success: true,
    message: "Fabric added successfully to the database.",
    fabric,
    qrCodeURL
  });

});



exports.createFabricForUserMakingCharges = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { storeId } = user;
  const { productType, fabricCutting, makingCharges, contrastCharges } = req.body;

  const newFabricForUser = new FabricForUSerMakingCharges({
    storeId,
    productType,
    fabricCutting,
    makingCharges,
    contrastCharges
  });

  await newFabricForUser.save();

  res.status(201).json({
    success: true,
    message: "Fabric for User created successfully",
    data: newFabricForUser
  });
});


/*************************** Upload Bulk Fabric **************************/

// exports.uploadBulkFabrics = catchAsyncError(async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "Please upload an Excel file" });
//   }

//   // Parse Excel file
//   const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   if (jsonData.length === 0) {
//     return res.status(400).json({ message: "Excel file is empty" });
//   }

//   // Ensure storeId and storeNumber are available in req.user
//   if (!req.user || !req.user.storeId || !req.user.storeNumber) {
//     return res.status(400).json({ message: "User storeId and storeNumber are required" });
//   }

//   const { storeId, storeNumber } = req.user;
//   console.log("storeId:", storeId, "storeNumber:", storeNumber);

//   // Function to convert comma-separated strings to arrays
//   const convertToArray = (value) => {
//     if (typeof value === "string") {
//       return value.split(",").map((item) => item.trim()); // Convert to array
//     }
//     return Array.isArray(value) ? value : []; // Ensure it's an array
//   };

//   // Parse rollInfo field if present and add storeId and storeNumber
//   const parsedData = jsonData.map((item) => {
//     if (item.rollInfo) {
//       try {
//         item.rollInfo = JSON.parse(item.rollInfo);
//       } catch (error) {
//         console.error("Error parsing rollInfo:", error);
//         return res.status(400).json({
//           success: false,
//           message: "Invalid rollInfo format in Excel file",
//         });
//       }
//     }

//     return {
//       ...item,
//       storeId,
//       storeNumber, // Include storeNumber
//       fabricCategory: convertToArray(item.fabricCategory),
//       fabricBrand: convertToArray(item.fabricBrand),
//       fabricColor: convertToArray(item.fabricColor),
//       fabricComposition: convertToArray(item.fabricComposition),
//       fabricSubCategory: convertToArray(item.fabricSubCategory),
//       fabricMaterial: convertToArray(item.fabricMaterial),
//       fabricPattern: convertToArray(item.fabricPattern),
//       fabricType: convertToArray(item.fabricType),
//       fabricCharacteristics: convertToArray(item.fabricCharacteristics),
//       fabricSeason: convertToArray(item.fabricSeason),
//       fabricGsm: convertToArray(item.fabricGsm),
//     };
//   });

//   // Insert data into MongoDB
//   const insertedFabrics = await Fabrics.insertMany(parsedData);

//   // Generate QR code URL for each inserted fabric
//   for (const fabric of insertedFabrics) {
//     const getFabricAPIUrl = `https://admin.lovoj.com/${fabric._id}`;
//     const base64String = await generateQRCode(getFabricAPIUrl);
//     const qrCodeURL = base64String.replace(/^data:image\/png;base64,/, '');

//     // Update fabric with qrCodeURL
//     fabric.qrCodeURL = qrCodeURL;
//     await fabric.save();
//   }

//   return res.status(200).json({
//     success: true,
//     message: "Fabrics uploaded successfully with QR codes",
//     insertedCount: insertedFabrics.length,
//   });
// });


/********************************** */

// exports.uploadZipFile = async (req, res) => {
//     try {
//         if (!req.files || !req.files.zip) {
//             return res.status(400).json({ message: "No zip file uploaded" });
//         }

//         const zipFile = req.files.zip[0];
//         const zip = new AdmZip(zipFile.buffer);

//         // Temporary extraction path
//         const extractPath = path.join(__dirname, "../temp", Date.now().toString());
//         await fs.ensureDir(extractPath);

//         // Extract ZIP contents
//         zip.extractAllTo(extractPath, true);
//         console.log("ZIP extracted to:", extractPath);

//         // Read all extracted files
//         let files = await fs.readdir(extractPath);

//         // ✅ Filter only valid image files (ignore system files)
//         const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
//         files = files.filter(file => {
//             const ext = path.extname(file).toLowerCase();
//             return allowedExtensions.includes(ext) && !file.startsWith("._") && !file.includes(".DS_Store");
//         });

//         console.log("Filtered valid files:", files);

//         // Upload each image to S3
//         const uploadPromises = files.map(async (file) => {
//             const filePath = path.join(extractPath, file);
//             const fileBuffer = await fs.readFile(filePath);

//             console.log("Uploading file:", file);
//             return uploadToS3({
//                 originalname: file,
//                 buffer: fileBuffer,
//                 mimetype: "image/jpeg", // Adjust as needed
//             });
//         });

//         // Wait for all uploads to complete
//         const uploadedUrls = await Promise.all(uploadPromises);

//         // Cleanup: Remove extracted folder
//         await fs.remove(extractPath);

//         // Send response
//         res.status(200).json({ message: "Files uploaded successfully", urls: uploadedUrls });

//     } catch (error) {
//         console.error("Error processing ZIP file:", error);
//         res.status(500).json({ message: "File upload failed", error: error.message });
//     }
// };



/************************************************************************/
// /******************************** main now ******************************/
// exports.uploadBulkFabrics = async (req, res) => {
//   try {
//     if (!req.files || !req.files.excel || !req.files.zip) {
//       return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
//     }

//     // Read Excel data
//     const workbook = xlsx.read(req.files.excel[0].buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     if (jsonData.length === 0) {
//       return res.status(400).json({ success: false, message: "Excel file is empty" });
//     }

//     if (!req.user || !req.user.storeId || !req.user.storeNumber) {
//       return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
//     }
//     const { storeId, storeNumber } = req.user;

//     // Retrieve only the fabrics that have a fabDashNumber in the "F-DASH" format
//     const existingDashFabrics = await Fabrics.find(
//       { fabDashNumber: /^F-DASH\d+$/ },
//       { fabDashNumber: 1 }
//     );

//     // Find the maximum numeric value from the F-DASH fabricDashNumbers
//     let maxNumber = 99; // start at 99 so that the first generated number is 100
//     existingDashFabrics.forEach(fabric => {
//       const num = parseInt(fabric.fabDashNumber.replace("F-DASH", ""), 10);
//       if (num > maxNumber) {
//         maxNumber = num;
//       }
//     });

//     // Initialize the last dash number object with the max value found
//     let lastDashNumberObj = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };

//     // Generate unique fabDashNumbers sequentially for each Excel row
//     const generatedFabDashNumbers = [];
//     for (let i = 0; i < jsonData.length; i++) {
//       const newDash = await OthersService.createFabricDashNumber(lastDashNumberObj);
//       generatedFabDashNumbers.push(newDash);
//       const numericPart = parseInt(newDash.replace("F-DASH", ""), 10);
//       lastDashNumberObj = { dashNumber: newDash, orderNumber: numericPart };
//     }

//     // Check for existing fabDashNumbers in DB (if needed)
//     const existingFabrics = await Fabrics.find({ fabDashNumber: { $in: generatedFabDashNumbers } });
//     if (existingFabrics.length > 0) {
//       const duplicateNumbers = existingFabrics.map(fabric => fabric.fabDashNumber);
//       return res.status(400).json({
//         success: false,
//         message: "These fabDashNumbers are already present",
//         duplicateFabDashNumbers: duplicateNumbers,
//       });
//     }

//     // Extract and validate ZIP file
//     const zipFile = req.files.zip[0];
//     const zip = new AdmZip(zipFile.buffer);
//     const extractPath = path.join(__dirname, "../temp", Date.now().toString());
//     await fs.ensureDir(extractPath);
//     zip.extractAllTo(extractPath, true);

//     let files = await fs.readdir(extractPath);
//     const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
//     files = files.filter(file =>
//       allowedExtensions.includes(path.extname(file).toLowerCase()) &&
//       !file.startsWith("._")
//     );

//     if (files.length !== jsonData.length) {
//       await fs.remove(extractPath);
//       return res.status(400).json({
//         success: false,
//         message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${files.length}) must be equal.`,
//       });
//     }

//     // Upload images to S3
//     const uploadPromises = files.map(async (file, index) => {
//       const filePath = path.join(extractPath, file);
//       const fileBuffer = await fs.readFile(filePath);
//       return uploadToS3({ originalname: file, buffer: fileBuffer, mimetype: "image/jpeg" });
//     });
//     const uploadedUrls = await Promise.all(uploadPromises);
//     await fs.remove(extractPath);

//     // Helper function to convert values to arrays
//     const convertToArray = (value) => {
//       if (!value) return [];
//       if (Array.isArray(value)) return value;
//       return value.toString().split(",").map((item) => item.trim());
//     };

//     // Parse rollInfo and structure fabric data
//     const parsedData = jsonData.map((item, index) => {
//       let rollInfo = item.rollInfo;
//       try {
//         rollInfo = rollInfo ? JSON.parse(rollInfo) : null;
//       } catch (error) {
//         console.error("Error parsing rollInfo:", error);
//         rollInfo = null;
//       }

//       return {
//         ...item,
//         rollInfo,
//         storeId,
//         storeNumber,
//         fabDashNumber: generatedFabDashNumbers[index],
//         fabImage: uploadedUrls[index] || "",
//         fabricCategory: convertToArray(item.fabricCategory),
//         fabricBrand: convertToArray(item.fabricBrand),
//         fabricColor: convertToArray(item.fabricColor),
//         fabricComposition: convertToArray(item.fabricComposition),
//         fabricSubCategory: convertToArray(item.fabricSubCategory),
//         fabricMaterial: convertToArray(item.fabricMaterial),
//         fabricPattern: convertToArray(item.fabricPattern),
//         fabricType: convertToArray(item.fabricType),
//         fabricCharacteristics: convertToArray(item.fabricCharacteristics),
//         fabricSeason: convertToArray(item.fabricSeason),
//         fabricGsm: convertToArray(item.fabricGsm),
//       };
//     });

//     // Insert into MongoDB
//     const insertedFabrics = await Fabrics.insertMany(parsedData);

//     // Generate QR codes for each fabric
//     for (const fabric of insertedFabrics) {
//       const getFabricAPIUrl = `https://admin.lovoj.com/${fabric._id}`;
//       const base64String = await generateQRCode(getFabricAPIUrl);
//       fabric.qrCodeURL = base64String.replace(/^data:image\/png;base64,/, '');
//       await fabric.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Fabrics uploaded successfully",
//       insertedCount: insertedFabrics.length,
//     });
//   } catch (error) {
//     console.error("Error processing bulk upload:", error);
//     return res.status(500).json({ success: false, message: "File upload failed", error: error.message });
//   }
// };



/************* */

// exports.uploadBulkFabrics = async (req, res) => {
//   try {
//     const { files, user } = req;
//     if (!files || !files.excel || !files.zip)
//       return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
//     if (!user || !user.storeId || !user.storeNumber)
//       return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
//     const { storeId, storeNumber } = user;

//     // Parse Excel data
//     const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = xlsx.utils.sheet_to_json(sheet);
//     if (!jsonData.length)
//       return res.status(400).json({ success: false, message: "Excel file is empty" });

//     // Get max F-DASH number
//     const dashFabrics = await Fabrics.find({ fabDashNumber: /^F-DASH\d+$/ }, { fabDashNumber: 1 });
//     const maxNumber = dashFabrics.reduce((max, { fabDashNumber }) => {
//       const num = parseInt(fabDashNumber.replace("F-DASH", ""), 10);
//       return num > max ? num : max;
//     }, 99);
//     let last = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };
//     const dashNumbers = [];
//     for (let i = 0; i < jsonData.length; i++) {
//       const newDash = await OthersService.createFabricDashNumber(last);
//       dashNumbers.push(newDash);
//       last = { dashNumber: newDash, orderNumber: parseInt(newDash.replace("F-DASH", ""), 10) };
//     }
//     // Check duplicates
//     const dup = await Fabrics.find({ fabDashNumber: { $in: dashNumbers } });
//     if (dup.length)
//       return res.status(400).json({
//         success: false,
//         message: "These fabDashNumbers are already present",
//         duplicateFabDashNumbers: dup.map(f => f.fabDashNumber)
//       });

//     // Process ZIP images
//     const zip = new AdmZip(files.zip[0].buffer);
//     const extractPath = path.join(__dirname, "../temp", Date.now().toString());
//     await fs.ensureDir(extractPath);
//     zip.extractAllTo(extractPath, true);
//     let zipFiles = (await fs.readdir(extractPath)).filter(f =>
//       [".jpg", ".jpeg", ".png", ".gif"].includes(path.extname(f).toLowerCase()) && !f.startsWith("._")
//     );
//     if (zipFiles.length !== jsonData.length) {
//       await fs.remove(extractPath);
//       return res.status(400).json({
//         success: false,
//         message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.`
//       });
//     }
//     const uploadedUrls = await Promise.all(
//       zipFiles.map(f =>
//         fs.readFile(path.join(extractPath, f)).then(buf =>
//           uploadToS3({ originalname: f, buffer: buf, mimetype: "image/jpeg" })
//         )
//       )
//     );
//     await fs.remove(extractPath);

//     const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));
//     const data = jsonData.map((item, i) => {
//       let rollInfo;
//       try { rollInfo = item.rollInfo ? JSON.parse(item.rollInfo) : null; } catch { rollInfo = null; }
//       return {
//         ...item,
//         rollInfo,
//         storeId,
//         storeNumber,
//         fabDashNumber: dashNumbers[i],
//         fabImage: uploadedUrls[i] || "",
//         fabricCategory: toArr(item.fabricCategory),
//         fabricBrand: toArr(item.fabricBrand),
//         fabricColor: toArr(item.fabricColor),
//         fabricComposition: toArr(item.fabricComposition),
//         fabricSubCategory: toArr(item.fabricSubCategory),
//         fabricMaterial: toArr(item.fabricMaterial),
//         fabricPattern: toArr(item.fabricPattern),
//         fabricType: toArr(item.fabricType),
//         fabricCharacteristics: toArr(item.fabricCharacteristics),
//         fabricSeason: toArr(item.fabricSeason),
//         fabricGsm: toArr(item.fabricGsm)
//       };
//     });

//     const inserted = await Fabrics.insertMany(data);
//     await Promise.all(inserted.map(async fabric => {
//       const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
//       fabric.qrCodeURL = qr.replace(/^data:image\/png;base64,/, '');
//       await fabric.save();
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Fabrics uploaded successfully",
//       insertedCount: inserted.length
//     });
//   } catch (err) {
//     console.error("Error processing bulk upload:", err);
//     return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
//   }
// };




/****************************** */

// function parseMultipleRollInfo(str) {
//   if (!str) return [];
//   return str.split(";").map(segment => {
//     const obj = {};
//     segment.split(",").forEach(part => {
//       const [key, value] = part.split(":").map(x => x.trim());
//       if (key) obj[key] = value;
//     });
//     return obj;
//   });
// }

// exports.uploadBulkFabrics = async (req, res) => {
//   try {
//     const { files, user } = req;
//     if (!files || !files.excel || !files.zip)
//       return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
//     if (!user || !user.storeId || !user.storeNumber)
//       return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
//     const { storeId, storeNumber } = user;

//     // Parse Excel data
//     const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = xlsx.utils.sheet_to_json(sheet);
//     if (!jsonData.length)
//       return res.status(400).json({ success: false, message: "Excel file is empty" });

//     // Get max F-DASH number
//     const dashFabrics = await Fabrics.find({ fabDashNumber: /^F-DASH\d+$/ }, { fabDashNumber: 1 });
//     const maxNumber = dashFabrics.reduce((max, { fabDashNumber }) => {
//       const num = parseInt(fabDashNumber.replace("F-DASH", ""), 10);
//       return num > max ? num : max;
//     }, 99);
//     let last = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };
//     const dashNumbers = [];
//     for (let i = 0; i < jsonData.length; i++) {
//       const newDash = await OthersService.createFabricDashNumber(last);
//       dashNumbers.push(newDash);
//       last = { dashNumber: newDash, orderNumber: parseInt(newDash.replace("F-DASH", ""), 10) };
//     }
//     // Check duplicates
//     const dup = await Fabrics.find({ fabDashNumber: { $in: dashNumbers } });
//     if (dup.length)
//       return res.status(400).json({
//         success: false,
//         message: "These fabDashNumbers are already present",
//         duplicateFabDashNumbers: dup.map(f => f.fabDashNumber)
//       });

//     // Process ZIP images
//     const zip = new AdmZip(files.zip[0].buffer);
//     const extractPath = path.join(__dirname, "../temp", Date.now().toString());
//     await fs.ensureDir(extractPath);
//     zip.extractAllTo(extractPath, true);
//     let zipFiles = (await fs.readdir(extractPath)).filter(f =>
//       [".jpg", ".jpeg", ".png", ".gif"].includes(path.extname(f).toLowerCase()) && !f.startsWith("._")
//     );
//     if (zipFiles.length !== jsonData.length) {
//       await fs.remove(extractPath);
//       return res.status(400).json({
//         success: false,
//         message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.`
//       });
//     }
//     const uploadedUrls = await Promise.all(
//       zipFiles.map(f =>
//         fs.readFile(path.join(extractPath, f)).then(buf =>
//           uploadToS3({ originalname: f, buffer: buf, mimetype: "image/jpeg" })
//         )
//       )
//     );
//     await fs.remove(extractPath);

//     // Helper function to convert a field to an array
//     const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));
//     // Build the data objects for insertion
//     const data = jsonData.map((item, i) => {
//       // Parse multiple roll data into an array of objects
//       const rollInfo = parseMultipleRollInfo(item.rollInfo);
//       return {
//         ...item,
//         rollInfo,
//         storeId,
//         storeNumber,
//         fabDashNumber: dashNumbers[i],
//         fabImage: uploadedUrls[i] || "",
//         fabricCategory: toArr(item.fabricCategory),
//         fabricBrand: toArr(item.fabricBrand),
//         fabricColor: toArr(item.fabricColor),
//         fabricComposition: toArr(item.fabricComposition),
//         fabricSubCategory: toArr(item.fabricSubCategory),
//         fabricMaterial: toArr(item.fabricMaterial),
//         fabricPattern: toArr(item.fabricPattern),
//         fabricType: toArr(item.fabricType),
//         fabricCharacteristics: toArr(item.fabricCharacteristics),
//         fabricSeason: toArr(item.fabricSeason),
//         fabricGsm: toArr(item.fabricGsm)
//       };
//     });

//     const inserted = await Fabrics.insertMany(data);
//     await Promise.all(inserted.map(async fabric => {
//       const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
//       fabric.qrCodeURL = qr.replace(/^data:image\/png;base64,/, '');
//       await fabric.save();
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Fabrics uploaded successfully",
//       insertedCount: inserted.length
//     });
//   } catch (err) {
//     console.error("Error processing bulk upload:", err);
//     return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
//   }
// };



/**************** */

// function parseRollInfo(str) {
//   if (!str) return [];

//   // Regex to find each key ("rollLength", "unit", etc.) and its comma-separated values
//   const fieldRegex = /(rollLength|unit|rollIdentity|rackNumber|stockLocation)\s*:\s*([^,]+(?:,[^,]+)*)/gi;

//   // We'll store arrays of values for each key here
//   const fields = {
//     rollLength: [],
//     unit: [],
//     rollIdentity: [],
//     rackNumber: [],
//     stockLocation: []
//   };
//   let maxLen = 0;
//   let match;

//   // Extract key-value pairs from the string
//   while ((match = fieldRegex.exec(str)) !== null) {
//     const key = match[1].trim();        // e.g. "rollLength"
//     const valuesStr = match[2];         // e.g. "60,40"
//     const valuesArr = valuesStr.split(",").map(v => v.trim());

//     fields[key] = valuesArr;
//     if (valuesArr.length > maxLen) {
//       maxLen = valuesArr.length;
//     }
//   }

//   // Build an array of roll objects, one object per roll
//   const result = [];
//   for (let i = 0; i < maxLen; i++) {
//     const rollObj = {};
//     // For each key, pick the i-th value (or empty string if none)
//     for (const k of Object.keys(fields)) {
//       rollObj[k] = fields[k][i] || "";
//     }
//     result.push(rollObj);
//   }
//   return result;
// }


// exports.uploadBulkFabrics = async (req, res) => {
//   try {
//     const { files, user } = req;
//     if (!files || !files.excel || !files.zip) {
//       return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
//     }
//     if (!user || !user.storeId || !user.storeNumber) {
//       return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
//     }
//     const { storeId, storeNumber } = user;

//     // 1) Parse Excel data
//     const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = xlsx.utils.sheet_to_json(sheet);
//     if (!jsonData.length) {
//       return res.status(400).json({ success: false, message: "Excel file is empty" });
//     }

//     // 2) Generate F-DASH numbers
//     const dashFabrics = await Fabrics.find({ fabDashNumber: /^F-DASH\d+$/ }, { fabDashNumber: 1 });
//     const maxNumber = dashFabrics.reduce((max, { fabDashNumber }) => {
//       const num = parseInt(fabDashNumber.replace("F-DASH", ""), 10);
//       return num > max ? num : max;
//     }, 99);
//     let last = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };
//     const dashNumbers = [];
//     for (let i = 0; i < jsonData.length; i++) {
//       const newDash = await OthersService.createFabricDashNumber(last);
//       dashNumbers.push(newDash);
//       last = { dashNumber: newDash, orderNumber: parseInt(newDash.replace("F-DASH", ""), 10) };
//     }

//     // 3) Check duplicates
//     const dup = await Fabrics.find({ fabDashNumber: { $in: dashNumbers } });
//     if (dup.length) {
//       return res.status(400).json({
//         success: false,
//         message: "These fabDashNumbers are already present",
//         duplicateFabDashNumbers: dup.map(f => f.fabDashNumber)
//       });
//     }

//     // 4) Process ZIP images
//     const zip = new AdmZip(files.zip[0].buffer);
//     const extractPath = path.join(__dirname, "../temp", Date.now().toString());
//     await fs.ensureDir(extractPath);
//     zip.extractAllTo(extractPath, true);

//     let zipFiles = await fs.readdir(extractPath);
//     const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
//     zipFiles = zipFiles.filter(f =>
//       allowedExtensions.includes(path.extname(f).toLowerCase()) && !f.startsWith("._")
//     );

//     if (zipFiles.length !== jsonData.length) {
//       await fs.remove(extractPath);
//       return res.status(400).json({
//         success: false,
//         message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.`
//       });
//     }

//     // 5) Upload images
//     const uploadedUrls = await Promise.all(
//       zipFiles.map(async (file) => {
//         const filePath = path.join(extractPath, file);
//         const buffer = await fs.readFile(filePath);
//         // Optionally compress with sharp if desired
//         // const compressedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
//         return uploadToS3({ originalname: file, buffer, mimetype: "image/jpeg" });
//       })
//     );
//     await fs.remove(extractPath);

//     // 6) Convert certain columns to arrays
//     const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));

//     // 7) Build data objects for insertion
//     const data = jsonData.map((item, i) => {
//       // Parse the rollInfo column with our new function
//       const rollInfo = parseRollInfo(item.rollInfo);

//       return {
//         ...item,
//         rollInfo,
//         storeId,
//         storeNumber,
//         fabDashNumber: dashNumbers[i],
//         fabImage: uploadedUrls[i] || "",
//         fabricCategory: toArr(item.fabricCategory),
//         fabricBrand: toArr(item.fabricBrand),
//         fabricColor: toArr(item.fabricColor),
//         fabricComposition: toArr(item.fabricComposition),
//         fabricSubCategory: toArr(item.fabricSubCategory),
//         fabricMaterial: toArr(item.fabricMaterial),
//         fabricPattern: toArr(item.fabricPattern),
//         fabricType: toArr(item.fabricType),
//         fabricCharacteristics: toArr(item.fabricCharacteristics),
//         fabricSeason: toArr(item.fabricSeason),
//         fabricGsm: toArr(item.fabricGsm)
//       };
//     });

//     // 8) Insert into MongoDB
//     const inserted = await Fabrics.insertMany(data);

//     // 9) Generate QR codes (in parallel)
//     await Promise.all(
//       inserted.map(async (fabric) => {
//         const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
//         fabric.qrCodeURL = qr.replace(/^data:image\/png;base64,/, '');
//         await fabric.save();
//       })
//     );

//     // 10) Return success
//     return res.status(200).json({
//       success: true,
//       message: "Fabrics uploaded successfully",
//       insertedCount: inserted.length
//     });
//   } catch (err) {
//     console.error("Error processing bulk upload:", err);
//     return res.status(500).json({
//       success: false,
//       message: "File upload failed",
//       error: err.message
//     });
//   }
// };




/********************** */

// Helper function to build rollInfo array from separate columns
function parseRollInfoFromColumns(row) {
  // Define the keys that are expected
  const keys = ["rollLength", "unit", "rollIdentity", "rackNumber", "stockLocation"];
  const arrays = {};
  let numRolls = 0;
  keys.forEach(key => {
    if (row[key]) {
      // Split by comma and trim each value
      arrays[key] = row[key].toString().split(",").map(x => x.trim());
      if (arrays[key].length > numRolls) {
        numRolls = arrays[key].length;
      }
    }
  });
  // Build an array of roll objects
  const result = [];
  for (let i = 0; i < numRolls; i++) {
    const rollObj = {};
    keys.forEach(key => {
      // If a value is missing for a given key, default to an empty string.
      rollObj[key] = arrays[key] ? (arrays[key][i] || "") : "";
      // Optionally convert rollLength to a number if required by your schema:
      if (key === "rollLength") {
        rollObj[key] = Number(rollObj[key]) || 0;
      }
    });
    result.push(rollObj);
  }
  return result;
}

exports.uploadBulkFabrics = async (req, res) => {
  try {
    const { files, user } = req;
    if (!files || !files.excel || !files.zip) {
      return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
    }
    if (!user || !user.storeId || !user.storeNumber) {
      return res.status(400).json({ success: false, message: "User storeId and storeNumber are required" });
    }
    const { storeId, storeNumber } = user;

    // 1. Parse Excel data
    const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    if (!jsonData.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    // 2. Generate F-DASH numbers sequentially
    const dashFabrics = await Fabrics.find({ fabDashNumber: /^F-DASH\d+$/ }, { fabDashNumber: 1 });
    const maxNumber = dashFabrics.reduce((max, { fabDashNumber }) => {
      const num = parseInt(fabDashNumber.replace("F-DASH", ""), 10);
      return num > max ? num : max;
    }, 99);
    let last = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };
    const dashNumbers = [];
    for (let i = 0; i < jsonData.length; i++) {
      const newDash = await OthersService.createFabricDashNumber(last);
      dashNumbers.push(newDash);
      last = { dashNumber: newDash, orderNumber: parseInt(newDash.replace("F-DASH", ""), 10) };
    }

    // 3. Check for duplicate fabDashNumbers
    const dup = await Fabrics.find({ fabDashNumber: { $in: dashNumbers } });
    if (dup.length) {
      return res.status(400).json({
        success: false,
        message: "These fabDashNumbers are already present",
        duplicateFabDashNumbers: dup.map(f => f.fabDashNumber)
      });
    }

    // 4. Process ZIP images
    const zip = new AdmZip(files.zip[0].buffer);
    const extractPath = path.join(__dirname, "../temp", Date.now().toString());
    await fs.ensureDir(extractPath);
    zip.extractAllTo(extractPath, true);
    let zipFiles = await fs.readdir(extractPath);
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    zipFiles = zipFiles.filter(f =>
      allowedExtensions.includes(path.extname(f).toLowerCase()) && !f.startsWith("._")
    );
    if (zipFiles.length !== jsonData.length) {
      await fs.remove(extractPath);
      return res.status(400).json({
        success: false,
        message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.`
      });
    }
    const uploadedUrls = await Promise.all(
      zipFiles.map(async (f) => {
        const filePath = path.join(extractPath, f);
        const buffer = await fs.readFile(filePath);
        // Optionally, compress with sharp if desired:
        // const compressedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
        return uploadToS3({ originalname: f, buffer, mimetype: "image/jpeg" });
      })
    );
    await fs.remove(extractPath);

    // 5. Build data objects for insertion, using separate roll columns
    const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));
    const data = jsonData.map((item, i) => {
      // Use the helper to create rollInfo from separate columns
      const rollInfo = parseRollInfoFromColumns(item);

      // Optionally remove roll-specific fields from the item if you don't want them stored separately
      const newItem = { ...item };
      delete newItem.rollLength;
      delete newItem.unit;
      delete newItem.rollIdentity;
      delete newItem.rackNumber;
      delete newItem.stockLocation;

      return {
        ...newItem,
        rollInfo,
        storeId,
        storeNumber,
        fabDashNumber: dashNumbers[i],
        fabImage: uploadedUrls[i] || "",
        fabricCategory: toArr(item.fabricCategory),
        fabricBrand: toArr(item.fabricBrand),
        fabricColor: toArr(item.fabricColor),
        fabricComposition: toArr(item.fabricComposition),
        fabricSubCategory: toArr(item.fabricSubCategory),
        fabricMaterial: toArr(item.fabricMaterial),
        fabricPattern: toArr(item.fabricPattern),
        fabricType: toArr(item.fabricType),
        fabricCharacteristics: toArr(item.fabricCharacteristics),
        fabricSeason: toArr(item.fabricSeason),
        fabricGsm: toArr(item.fabricGsm)
      };
    });

    // 6. Insert into MongoDB and generate QR codes in parallel
    const inserted = await Fabrics.insertMany(data);
    await Promise.all(inserted.map(async fabric => {
      const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
      fabric.qrCodeURL = qr.replace(/^data:image\/png;base64,/, '');
      await fabric.save();
    }));

    return res.status(200).json({
      success: true,
      message: "Fabrics uploaded successfully",
      insertedCount: inserted.length
    });
  } catch (err) {
    console.error("Error processing bulk upload:", err);
    return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
  }
};


exports.uploadBulkFabricsForSuperadmin = async (req, res) => {
  try {
    const { files } = req;
    if (!files || !files.excel || !files.zip) {
      return res.status(400).json({ success: false, message: "Both Excel and ZIP files are required" });
    }

    const workbook = xlsx.read(files.excel[0].buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    if (!jsonData.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    const dashFabrics = await FabricsForSuperadmin.find({ fabDashNumber: /^F-DASH\d+$/ }, { fabDashNumber: 1 });
    const maxNumber = dashFabrics.reduce((max, { fabDashNumber }) => {
      const num = parseInt(fabDashNumber.replace("F-DASH", ""), 10);
      return num > max ? num : max;
    }, 99);
    let last = { dashNumber: `F-DASH${maxNumber}`, orderNumber: maxNumber };
    const dashNumbers = [];
    for (let i = 0; i < jsonData.length; i++) {
      const newDash = await OthersService.createFabricDashNumber(last);
      dashNumbers.push(newDash);
      last = { dashNumber: newDash, orderNumber: parseInt(newDash.replace("F-DASH", ""), 10) };
    }

    const dup = await FabricsForSuperadmin.find({ fabDashNumber: { $in: dashNumbers } });
    if (dup.length) {
      return res.status(400).json({
        success: false,
        message: "These fabDashNumbers are already present",
        duplicateFabDashNumbers: dup.map(f => f.fabDashNumber)
      });
    }

    const zip = new AdmZip(files.zip[0].buffer);
    const extractPath = path.join(__dirname, "../temp", Date.now().toString());
    await fs.ensureDir(extractPath);
    zip.extractAllTo(extractPath, true);
    let zipFiles = await fs.readdir(extractPath);
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    zipFiles = zipFiles.filter(f =>
      allowedExtensions.includes(path.extname(f).toLowerCase()) && !f.startsWith("._")
    );
    if (zipFiles.length !== jsonData.length) {
      await fs.remove(extractPath);
      return res.status(400).json({
        success: false,
        message: `Mismatch: Excel rows (${jsonData.length}) and ZIP images (${zipFiles.length}) must be equal.`
      });
    }
    const uploadedUrls = await Promise.all(
      zipFiles.map(async (f) => {
        const filePath = path.join(extractPath, f);
        const buffer = await fs.readFile(filePath);
        return uploadToS3({ originalname: f, buffer, mimetype: "image/jpeg" });
      })
    );
    await fs.remove(extractPath);

    const toArr = v => (!v ? [] : Array.isArray(v) ? v : v.toString().split(",").map(s => s.trim()));
    const data = jsonData.map((item, i) => {
      const rollInfo = parseRollInfoFromColumns(item);
      const newItem = { ...item };
      delete newItem.rollLength;
      delete newItem.unit;
      delete newItem.rollIdentity;
      delete newItem.rackNumber;
      delete newItem.stockLocation;

      return {
        ...newItem,
        rollInfo,
        fabDashNumber: dashNumbers[i],
        fabImage: uploadedUrls[i] || "",
        fabricCategory: toArr(item.fabricCategory),
        fabricBrand: toArr(item.fabricBrand),
        fabricColor: toArr(item.fabricColor),
        fabricComposition: toArr(item.fabricComposition),
        fabricSubCategory: toArr(item.fabricSubCategory),
        fabricMaterial: toArr(item.fabricMaterial),
        fabricPattern: toArr(item.fabricPattern),
        fabricType: toArr(item.fabricType),
        fabricCharacteristics: toArr(item.fabricCharacteristics),
        fabricSeason: toArr(item.fabricSeason),
        fabricGsm: toArr(item.fabricGsm)
      };
    });

    const inserted = await FabricsForSuperadmin.insertMany(data);
    await Promise.all(inserted.map(async fabric => {
      const qr = await generateQRCode(`https://admin.lovoj.com/${fabric._id}`);
      fabric.qrCodeURL = qr.replace(/^data:image\/png;base64,/, '');
      await fabric.save();
    }));

    return res.status(200).json({
      success: true,
      message: "Fabrics uploaded successfully",
      insertedCount: inserted.length
    });
  } catch (err) {
    console.error("Error processing bulk upload:", err);
    return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
  }
};
