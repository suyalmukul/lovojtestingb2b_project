const Store = require("../models/stores");
const uploadToS3 = require("../utils/s3Upload");
const Fabrics = require("../models/fabric");
const fabricInventory = require("../models/fabricInventory");
const FabricForUSer = require("../models/fabricForUser");
const FabricsForSuperadmin = require("../models/FabricForSuperadmin");
const StoreRating = require("../models/storeRating");
const { ObjectId } = require('mongoose').Types;

/******************************************** Add fabric api service For Admin  *********************************************/

exports.insertFabric = async (storeId, data) => {
  const store = await Store.findById(storeId);

  return await fabricInventory.create({
    ...data,
    storeId: storeId, 
    storeNumber: store.storeNumber,
  });
};




exports.FabricPipeline = async (query, page, limit) => {
    const {
        search, brand, dashnumber, pattern, season, color, sku, storeId, minPrice, maxPrice, minDiscount, maxDiscount, id
    } = query;
    let matchQuery = {};

    if (search) {
        matchQuery.$or = [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { color: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } },
            { dashnumber: { $eq: parseInt(search) } }
        ];
    }

    if (brand) {
        matchQuery.brand = { $in: Array.isArray(brand) ? brand.map(b => new RegExp(b, "i")) : [new RegExp(brand, "i")] };
    }

    if (dashnumber) {
        matchQuery.dashnumber = { $eq: parseInt(dashnumber) };
    }

    if (pattern) {
        matchQuery.pattern = { $regex: pattern, $options: "i" };
    }

    if (season) {
        matchQuery.season = { $in: Array.isArray(season) ? season : [season] };
    }

    if (color) {
        matchQuery.color = { $regex: color, $options: "i" };
    }

    if (sku) {
        matchQuery.sku = { $regex: sku, $options: "i" };
    }

    if (storeId) {
        matchQuery.storeId = new ObjectId(storeId);
    }

    if (id) {
        matchQuery._id = { $in: (Array.isArray(id) ? id : [id]).map(i => new ObjectId(i)) };
    }

    if (minPrice || maxPrice) {
        matchQuery.base_price = {};
        if (minPrice) matchQuery.base_price.$gte = parseFloat(minPrice);
        if (maxPrice) matchQuery.base_price.$lte = parseFloat(maxPrice);
    }

    if (minDiscount || maxDiscount) {
        matchQuery.discount_percentage = {};
        if (minDiscount) matchQuery.discount_percentage.$gte = parseFloat(minDiscount);
        if (maxDiscount) matchQuery.discount_percentage.$lte = parseFloat(maxDiscount);
    }

    // Main pipeline with pagination
    const pipeline = [
        { $match: matchQuery },
        {
            $addFields: {
                tempSku: "$sku",
                tempQrCode: "$qr_code"
            }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ];

    // Count pipeline to get the total count
    const countPipeline = [
        { $match: matchQuery },
        { $count: "totalCount" }
    ];

    return { pipeline, countPipeline };
};




exports.updateFabric = async (fabric, data) => {
    // Update fabric data
    for (const key in data) {
      if (key !== '_id') { 
        fabric[key] = data[key];
      }
    }
  
    // Save the updated fabric
    await fabric.save();
  
    return fabric;
  };
  