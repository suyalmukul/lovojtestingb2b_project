const Store = require("../models/stores");
const uploadToS3 = require("../utils/s3Upload");
const Fabrics = require("../models/fabric");
const FabricForUSer = require("../models/fabricForUser");
const FabricsForSuperadmin = require("../models/FabricForSuperadmin");
const StoreRating = require("../models/storeRating");
const { ObjectId } = require("mongodb");

/******************************************** Add fabric api service For Admin  *********************************************/


// exports.insertFabric = async (storeId, data, fileObj, optionalFileObj1, optionalFileObj2, optionalFileObj3) => {
//   const store = await Store.findById(storeId);

//   const fileUrl = await uploadToS3(fileObj);
//   const optionalFileUrl1 = optionalFileObj1 ? await uploadToS3(optionalFileObj1) : null;
//   const optionalFileUrl2 = optionalFileObj2 ? await uploadToS3(optionalFileObj2) : null;
//   const optionalFileUrl3 = optionalFileObj3 ? await uploadToS3(optionalFileObj3) : null;

//   return await Fabrics.create({
//     ...data,
//     storeId: storeId, 
//     storeNumber: store.storeNumber,
//     fabImage: fileUrl,
//     fabImageOptional1: optionalFileUrl1,
//     fabImageOptional2: optionalFileUrl2,
//     fabImageOptional3: optionalFileUrl3,
//   });
// };

exports.insertFabric = async (storeId, data) => {
  const store = await Store.findById(storeId);

  return await Fabrics.create({
    ...data,
    storeId: storeId, 
    storeNumber: store.storeNumber,
  });
};


/****************************************** Add Fabric Appresel page For Admin ***********************************************/

exports.insertFabricForStatingPage = async (storeId, data,) => {
  const store = await Store.findById(storeId);

  return await Fabrics.create({
    ...data,
    storeId: storeId, 
    storeNumber: store.storeNumber,
  });
};

exports.insertFabricForUser = async (storeId, data,) => {
  const store = await Store.findById(storeId);

  return await FabricForUSer.create({
    ...data,
    storeId: storeId, 
    storeNumber: store.storeNumber,
  });
};

/******************************************** Add fabric api service For Superadmin  *********************************************/

exports.insertFabricForSuperadmin = async ( data, fileObj, optionalFileObj1, optionalFileObj2, optionalFileObj3) => {

  const fileUrl = await uploadToS3(fileObj);
  const optionalFileUrl1 = optionalFileObj1 ? await uploadToS3(optionalFileObj1) : null;
  const optionalFileUrl2 = optionalFileObj2 ? await uploadToS3(optionalFileObj2) : null;
  const optionalFileUrl3 = optionalFileObj3 ? await uploadToS3(optionalFileObj3) : null;

  return await FabricsForSuperadmin.create({
    ...data,
    fabImage: fileUrl,
    fabImageOptional1: optionalFileUrl1,
    fabImageOptional2: optionalFileUrl2,
    fabImageOptional3: optionalFileUrl3,
  });
};

/*********** */

// exports.updateFabric = async (fabric, data) => {
//   // Update fabric data
//   if (data.rollInfo) {
//     data.rollInfo.forEach(roll => {
//       const rollIndex = fabric.rollInfo.findIndex(existingRoll => existingRoll.rollIdentity === roll.rollIdentity);
//       if (rollIndex !== -1) {
//         // Update specific fields within the existing roll object
//         fabric.rollInfo[rollIndex].rollLength = roll.rollLength;
//         fabric.rollInfo[rollIndex].rackNumber = roll.rackNumber;
//         // Add more fields to update as needed
//       } else {
//         // If the rollIdentity is not found, add a new roll object
//         fabric.rollInfo.push(roll);
//       }
//     });
//   }
  
//   // Save the updated fabric
//   await fabric.save();

//   return fabric;
// };


exports.updateFabric = async (fabric, data) => {
  // Update fabric data
  for (const key in data) {
    if (key !== '_id') { // Exclude _id field from update
      fabric[key] = data[key];
    }
  }

  // Save the updated fabric
  await fabric.save();

  return fabric;
};

exports.updateFabricForSuperadmin = async (Fabric, fabric, data) => {
  // Update fabric data
  for (const key in data) {
    if (key !== '_id') { // Exclude _id field from update
      fabric[key] = data[key];
    }
  }

  // Save the updated fabric
  await fabric.save();

  return fabric;
};


/***************************************** Get Fabric and Filter ****************************************************************/


exports.getFabricPipeline = async (query, page, limit) => {
  const {
    search,
    brand,
    fabDashNumber,
    category,
    minPrice,
    maxPrice,
    minDiscount,
    maxDiscount,
    color,
    discount,
    location,
    storeType,
    storeNumber,
    pattern,
    fabricSubCategory,
    material,
    fabName,
    fabricType,
    characteristics,
    season,
    shopTypes,
    gsm,
    id,
    qrCodeURL,
  } = query;
  let matchQuery = {};

  console.log("Query:", query);

  if (search) {
    matchQuery.$or = [
      { fabricCategory: { $regex: search, $options: "i" } },
      { fabricBrand: { $regex: search, $options: "i" } },
      { fabName: { $regex: search, $options: "i" } },
      { fabricColor: { $regex: search, $options: "i" } },
      // { storeType: { $regex: search, $options: "i" } },
      { fabDashNumber: { $eq: search } }, // Use $eq for exact match
      //  { fabDashNumber: { $regex: search, $options: "i" } },
      { storeNumber: { $regex: search, $options: "i" } },
      { storeType: { $regex: search, $options: "i" } },
    ];
  }

  if (brand) {
    // Convert brand to an array if it contains multiple values
    const brandArray = Array.isArray(brand) ? brand : [brand];
    matchQuery.fabricBrand = { $in: brandArray.map((b) => new RegExp(b, "i")) };
  }
  if (fabDashNumber) {
    // Convert fabDashNumber to an array if it contains multiple values
    const fabDashNumberArray = Array.isArray(fabDashNumber) ? fabDashNumber : [fabDashNumber];
    matchQuery.fabDashNumber = { $in: fabDashNumberArray.map((b) => new RegExp(b, "i")) };
  }
  if (category) {
    // Convert category to an array if it contains multiple values
    const categoryArray = Array.isArray(category) ? category : [category];
    matchQuery.fabricCategory = { $in: categoryArray.map((b) => new RegExp(b, "i")) };
  }

  if (id) {
    // Convert id to an array if it contains multiple values
    const idArray = Array.isArray(id) ? id : [id];
    matchQuery._id = { $in: idArray.map((i) => ObjectId(i)) }; // Convert `id` to ObjectId
  }
  // console.log("Filtering by ID:", id);

  if (minPrice && maxPrice) {
    matchQuery.perMeterPrice = {
      $gte: parseInt(minPrice),
      $lte: parseInt(maxPrice),
    };
  } else if (minPrice) {
    matchQuery.perMeterPrice = { $gte: parseInt(minPrice) };
  } else if (maxPrice) {
    matchQuery.perMeterPrice = { $lte: parseInt(maxPrice) };
  }


  if (minDiscount && maxDiscount) {
    matchQuery.fabricDiscount = {
      $gte: parseInt(minDiscount),
      $lte: parseInt(maxDiscount),
    };
  } else if (minDiscount) {
    matchQuery.fabricDiscount= { $gte: parseInt(minDiscount) };
  } else if (maxDiscount) {
    matchQuery.fabricDiscount= { $lte: parseInt(maxDiscount) };
  }


  if (color) {
    // Convert color to an array if it contains multiple values
    const colorsArray = Array.isArray(color) ? color : [color];
    matchQuery.fabricColor = {
      $in: colorsArray.map((c) => new RegExp(c, "i")),
    };
  }


  if (location) {
    // Convert location to an array if it contains multiple values
    const locationsArray = Array.isArray(location) ? location : [location];
    matchQuery.stockLocation = {
      $in: locationsArray.map((l) => new RegExp(l, "i")),
    };
  }

  if (storeType) {
    // Convert storeType to an array if it contains multiple values
    const storeTypesArray = Array.isArray(storeType) ? storeType : [storeType];
    matchQuery.storeType = {
      $in: storeTypesArray.map((s) => new RegExp(s, "i")),
    };
  }

  if (storeNumber) {
    // Convert storeNumber to an array if it contains multiple values
    const storeNumbersArray = Array.isArray(storeNumber)
      ? storeNumber
      : [storeNumber];
    matchQuery.storeNumber = {
      $in: storeNumbersArray.map((sn) => new RegExp(sn, "i")),
    };
  }

  if (pattern) {
    // Convert pattern to an array if it contains multiple values
    const patternsArray = Array.isArray(pattern) ? pattern : [pattern];
    matchQuery.fabricPattern = {
      $in: patternsArray.map((p) => new RegExp(p, "i")),
    };
  }

  if (fabricSubCategory) {
    // Convert fabricSubCategory to an array if it contains multiple values
    const subCategoriesArray = Array.isArray(fabricSubCategory)
      ? fabricSubCategory
      : [fabricSubCategory];
    matchQuery.fabricSubCategory = {
      $in: subCategoriesArray.map((sc) => new RegExp(sc, "i")),
    };
  }

  if (material) {
    // Convert material to an array if it contains multiple values
    const materialsArray = Array.isArray(material) ? material : [material];
    matchQuery.fabricMaterial = {
      $in: materialsArray.map((m) => new RegExp(m, "i")),
    };
  }

  if (fabricType) {
    // Convert fabricType to an array if it contains multiple values
    const typesArray = Array.isArray(fabricType) ? fabricType : [fabricType];
    matchQuery.fabricType = {
      $in: typesArray.map((ft) => new RegExp(ft, "i")),
    };
  }

  if (characteristics) {
    // Convert characteristics to an array if it contains multiple values
    const characteristicsArray = Array.isArray(characteristics)
      ? characteristics
      : [characteristics];
    matchQuery.fabricCharacteristics = {
      $in: characteristicsArray.map((c) => new RegExp(c, "i")),
    };
  }

  if (season) {
    // Convert season to an array if it contains multiple values
    const seasonsArray = Array.isArray(season) ? season : [season];
    matchQuery.fabricSeason = {
      $in: seasonsArray.map((s) => new RegExp(s, "i")),
    };
  }

  if (shopTypes) {
    // Convert shopTypes to an array if it contains multiple values
    const shopTypesArray = Array.isArray(shopTypes) ? shopTypes : [shopTypes];
    matchQuery.shopType = {
      $in: shopTypesArray.map((st) => new RegExp(st, "i")),
    };
  }

  if (gsm) {
    // Convert season to an array if it contains multiple values
    const gsmArray = Array.isArray(gsm) ? gsm : [gsm];
    matchQuery.fabricGsm = {
      $in: gsmArray.map((s) => new RegExp(s, "i")),
    };
  }


  const addFieldsStage = {
    $addFields: {
      tempFabName: "$fabName",
      tempStoreType: "$storeType",
      tempqrCodeURL: "$qrCodeURL",

    },
  };

  const pipeline = [
    { $match: matchQuery },
    {
      $addFields: {
        tempFabName: "$fabName",
        tempStoreType: "$storeType",
        tempqrCodeURL: "$qrCodeURL",
      },
    },
  // const sortQuery = { createdAt: -1 }; // latest record

  // const pipeline = [
  //   { $match: matchQuery },

///////////////////////////////////////////////////

    {
      $project: {
        storeId: 1,
        storeType: "$tempStoreType",
        storeNumber:1,
        shopType: 1,
        fabricCategory: 1,
        fabName: "$tempFabName",
        fabNumber:1,
        fabDashNumber: 1,
        fabWidth:1,
        fabricBrand: 1,
        fabricColor: 1,
        fabricSubCategory: 1,
        fabricMaterial: 1,
        fabricComposition:1,
        fabricPattern: 1,
        fabricType: 1,
        fabricCharacteristics: 1,
        fabricSeason: 1,
        fabImage: 1,
        stockLocation: 1,
        fabricGsm:1,
        fabricQuantity:1,
        unit:1,
        rollInfo:1,
        perMeterPrice:1,
        fabricDiscount:1,
        fabDescription:1,
        tilex: 1,
        tiley: 1,
        contrast:1,
        brightness:1,
        rotation:1,
        glossy: 1,
        defaultFabric:1,
        qrCodeURL: "$tempqrCodeURL",
        createdAt: 1, 
        id: 1,
      },
    },
    // { $sort: sortQuery },
    { '$sort': { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $match: matchQuery },
    { $group: { _id: null, totalCount: { $sum: 1 } } },
    // { $sort: sortQuery },
    { '$sort': { createdAt: -1 } },

  ];

  return { pipeline, countPipeline };
};

 
/************************************************Fabric with StoreDetails by a dashNumber*****************************************/


exports.visitStoregetFabricPipeline = async (storeId,query, page, limit) => {
  const {
    search,
    category,
    fabDashNumber,
    storeNumber,

  } = query;
  let matchQuery = {};

  console.log("Query:", query);

  if (!fabDashNumber) {
    return { error: "fabDashNumber is required." }; // Return an error message if fabDashNumber is empty
  }

  if (search) {
    matchQuery.$or = [
      { fabricCategory: { $regex: search, $options: "i" } },
      { fabDashNumber: { $regex: search, $options: "i" } },
      { storeNumber: { $regex: search, $options: "i" } },
    ];
  }


  if (category) {
    // Convert category to an array if it contains multiple values
    const categoryArray = Array.isArray(category) ? category : [category];
    matchQuery.fabricCategory = { $in: categoryArray.map((b) => new RegExp(b, "i")) };
  }


  if (fabDashNumber) {
    matchQuery.fabDashNumber = { $regex: `^${fabDashNumber}$`, $options: "i" };
  }


  if (storeNumber) {
    matchQuery.storeNumber = { $regex: `^${storeNumber}$`, $options: "i" };
  }

  // Convert storeId string to ObjectId
  const StoreId = ObjectId(storeId);
  // Use the ObjectId obtained from req.user in the match query
  matchQuery.storeId = StoreId;
    
  const sortQuery = { createdAt: -1 }; // latest record

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "stores",
        localField: "storeId",
        foreignField: "_id",
        as: "storeDetails",
      },
    },
    {
      $unwind: {
        path: "$storeDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        id: 1,
        storeId:1,
        fabName:1,
        fabricCategory: 1,
        fabricBrand: 1,
        fabricColor: 1,
        fabricSubCategory: 1,
        fabricMaterial: 1,
        fabricPattern: 1,
        fabricType: 1,
        fabricCharacteristics: 1,
        fabricSeason: 1,
        shopType: 1,
        location: 1,
        fabDashNumber: 1,
        fabImage: 1,
        fabricGsm:1,
        fabDescription:1,
        fabricSupplierContact:1,
        tilex:1,
        tiley:1,
        rotation:1,
        ////////////////////
        fabricQuantity: 1,
        totalRollsLength: 1,
        rollInfo:1,
        perMeterPrice:1,
        fabricDiscount:1,
        qrCodeURL:1,
        ////////////////////
        // storeDetails: {
        //   _id: 1,
        //   storeNumber: 1,
        //   storeType: 1,
        //   email: 1,
        //   mobileNumber: 1,
        //   name: 1,
        //   totalLike: 1,
        //   averageRating: 1,
        //   notAssociated: 1,
        //   Associated: 1,
        //   storeHeading: 1,
        //   storeDescription: 1,
        // },
      },
    },
    { $sort: sortQuery },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $match: matchQuery },
    { $group: { _id: null, totalCount: { $sum: 1 } } },
  ];

  return { pipeline, countPipeline };
};

/****************************************** Homepageapi store pipeline (stores With FabricImages) **********************************/


exports.getStoreFabricPipeline = async (query, page, limit) => {
  const {
    superAdminPermission,
    search,
    storeType,
    id,
    storeNumber,
    // dashNumber,
    name,
    location,
    makingProductList,
    specialist,
    profession,
    minRating,
    maxRating,
    minLike,
    maxLike,
  } = query;
  let matchQuery = {};


  if (!search && !storeNumber && !name && !storeType) {
    throw new Error("Please provide either the 'storeNumber','storeType', or 'name' field.");
  }

  if (superAdminPermission) {
    // matchQuery.superAdminPermission = { $regex: superAdminPermission, $options: "i" };
    (matchQuery.superAdminPermission = {
      $eq: superAdminPermission.toLowerCase() === "true",
    });
  }

  if (search) {
    if (Array.isArray(search)) {
      matchQuery.$or = search.map((value) => ({
        $or: [
          { storeNumber: { $regex: value, $options: "i" } },
          { storeType: { $regex: value, $options: "i" } },
          { name: { $regex: value, $options: "i" } },
          { makingProductList: { $regex: value, $options: "i" } }, // corrected to use `value`
        ],
      }));
    } else {
      matchQuery.$or = [
        { storeNumber: { $regex: search, $options: "i" } },
        { storeType: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { makingProductList: { $regex: search, $options: "i" } }, // corrected to use `search`
      ];
    }
  }
  
  

  if (storeType) {
    if (Array.isArray(storeType)) {
      matchQuery.storeType = { $in: storeType.map(value => ({ $regex: value, $options: "i" })) };
    } else {
      matchQuery.storeType = { $regex: storeType, $options: "i" };
    }
  }
  if (name) {
    matchQuery.name = { $regex: name, $options: "i" };
  }
  if (location) {
    matchQuery.location = { $regex: location, $options: "i" };
  }
  if (storeNumber) {
    matchQuery.storeNumber = { $regex: storeNumber, $options: "i" };
  }
  if (makingProductList) {
    // Convert category to an array if it contains multiple values
    const makingProductListArray = Array.isArray(makingProductList) ? makingProductList : [makingProductList];
    matchQuery.makingProductList = { $in: makingProductListArray.map((b) => new RegExp(b, "i")) };
  }

  // if (specialist) {
  //   // Convert category to an array if it contains multiple values
  //   const specialistArray = Array.isArray(specialist) ? specialist : [specialist];
  //   matchQuery.specialistArray = { $in: specialistArray.map((b) => new RegExp(b, "i")) };
  // }
  if (specialist) {
    const specialistArray = Array.isArray(specialist) ? specialist : [specialist];
    matchQuery.specialist = { $in: specialistArray.map((b) => new RegExp(b, "i")) };
  }

  if (profession) {
    matchQuery.profession = { $regex: profession, $options: "i" };
  }

  // if (makingProductList) {
  //   matchQuery.makingProductList = { $regex: makingProductList, $options: "i" };
  // }
  if (id) {
    const idArray = Array.isArray(id) ? id : [id];
    matchQuery._id = { $in: idArray.map((i) => ObjectId(i)) };
  }
  if (minRating && maxRating) {
    matchQuery.averageRating = {
      $gte: parseInt(minRating),
      $lte: parseInt(maxRating),
    };
  } else if (minRating) {
    matchQuery.averageRating = { $gte: parseInt(minRating) };
  } else if (maxRating) {
    matchQuery.averageRating = { $lte: parseInt(maxRating) };
  }

  if (minLike && maxLike) {
    matchQuery.totalLike = {
      $gte: parseInt(minLike),
      $lte: parseInt(maxLike),
    };
  } else if (minLike) {
    matchQuery.totalLike = { $gte: parseInt(minLike) };
  } else if (maxLike) {
    matchQuery.totalLike = { $lte: parseInt(maxLike) };
  }
  const sortQuery = { createdAt: -1 }; // latest record

  const pipeline = [
    { $match: matchQuery },
    { $sort: sortQuery },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $match: matchQuery },
    { $group: { _id: null, totalCount: { $sum: 1 } } },
  ];

  return { pipeline, countPipeline };
};




/******************************************* Home Page api store service (give FabricImages in HomePage) ***************************/

exports.getFabricImagesOfStores = async (stores) => {
  // Fetch fabImages for each store
  const storeNumbers = stores.map((store) => store.storeNumber);
  const fabImagesPipeline = [
    { $match: { storeNumber: { $in: storeNumbers } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$storeNumber",
        // fabImages: { $push: { fabImage: "$fabImage", fabName: "$fabName" } },
        fabImages: {
          $push: {
            _id:"$_id",
            fabImage: "$fabImage",
            fabName: "$fabName",
            fabNumber: "$fabNumber",
            fabDashNumber:"$fabDashNumber",
            fabricPrice: "$fabricPrice",
            perMeterPrice:"$perMeterPrice",
            fabricCategory: "$fabricCategory",
            fabricBrand: "$fabricBrand",
            fabricColor: "$fabricColor",
            fabricMaterial: "$fabricMaterial",
            fabricType: "$fabricType",
            fabricSubCategory: "$fabricSubCategory",
            fabricCharacteristics: "$fabricCharacteristics",
            fabricSeason: "$fabricSeason",
            fabricPattern: "$fabricPattern",
            shopType: "$shopType",
            fabDescription:"$fabDescription",
            stockLocation: "$stockLocation",
            fabricGsm:"$fabricGsm",
            fabricQuantity:"$fabricQuantity",
            tilex:"$tilex",
            tiley:"$tiley",
            rotation:"$rotation",
            createdAt:"$createdAt",
            updatedAt:"$updatedAt",
            // rollInfo:"$rollInfo",
            // perMeterPrice:"$perMeterPrice",
            fabricDiscount:"$fabricDiscount",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        storeNumber: "$_id",
        fabImages: { $reverseArray: "$fabImages" },
      },
    },
  ];

  const fabImages = await Fabrics.aggregate(fabImagesPipeline);

  return (stores = stores.map((store) => {
    const storeFabImages = fabImages.find(
      (image) => image.storeNumber === store.storeNumber
    );
    return {
      ...store,
      fabImages: storeFabImages ? storeFabImages.fabImages : [],
    };
  }));
};


exports.updateFabricRollLength = async (fabDashNumber, rollIdentity, rollLength) => {
  try {
    console.log("........................chal pda.......")
    const fabric = await Fabrics.findOne({ fabDashNumber });

    const rollData = fabric?.rollInfo.find(roll => roll?.rollIdentity === rollIdentity);
    // return console.log(rollData)
      if (rollData) {
        if (rollData.rollLength >= rollLength) {
          rollData.rollLength -= rollLength; // Subtract rollLength
          await fabric.save(); // Save changes to database
          console.log("Roll length updated successfully");
          return fabric;
        } else {
          console.log("Roll length is smaller than roll length");
        }
        return; // Exit loop after finding the roll
      }
    console.log("Roll not found");
  } catch (error) {
    console.error("An error occurred while updating fabric:", error);
  }
}




exports.getStylishPipeline = async (query, page, limit) => {
  const {
    superAdminPermission,
    search,
    role,
    typeOfStylist,
    id,
    name,
    location,
  } = query;
  let matchQuery = {};


  if (!search ) {
    throw new Error("Please provide the role...");
  }

  if (superAdminPermission) {
    // matchQuery.superAdminPermission = { $regex: superAdminPermission, $options: "i" };
    (matchQuery.superAdminPermission = {
      $eq: superAdminPermission.toLowerCase() === "true",
    });
  }

  if (search) {
    if (Array.isArray(search)) {
      matchQuery.$or = search.map(value => (
        {
          $or: [
            { name: { $regex: value, $options: "i" } },
            { role: { $regex: value, $options: "i" } },
            { typeOfStylist: { $regex: value, $options: "i" } },
          ]
        }
      ));
    } else {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { typeOfStylist: { $regex: search, $options: "i" } },
      ];
    }
  }

  if (name) {
    matchQuery.name = { $regex: name, $options: "i" };
  }
  if (role) {
    matchQuery.role = { $regex: role, $options: "i" };
  }
  if (typeOfStylist) {
    matchQuery.typeOfStylist = { $regex: typeOfStylist, $options: "i" };
  }
  if (location) {
    matchQuery.location = { $regex: location, $options: "i" };
  }

  if (id) {
    const idArray = Array.isArray(id) ? id : [id];
    matchQuery._id = { $in: idArray.map((i) => ObjectId(i)) };
  }

  const sortQuery = { createdAt: -1 }; // latest record

  const pipeline = [
    { $match: matchQuery },
    { $sort: sortQuery },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $match: matchQuery },
    { $group: { _id: null, totalCount: { $sum: 1 } } },
  ];

  return { pipeline, countPipeline };
};