const { catchAsyncError } = require("../middleware/catchAsyncError");
const Store = require("../models/stores");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const QuickOrderStatus = require("../models/quickorderStatus.model");
const QuickOrderStatusOnline = require("../models/quickorderStatusB2C.model");
const CustomerService = require("../services/customer.service");
const Workers = require("../models/Worker.model");
const { commonPipelineService, showingResults, commonLoopkupIndependentPipelineService } = require("../services/common.service");
const CommonServices = require("../services/common.service");
const AppError = require("../utils/errorHandler");
const { sendingEmail } = require("../utils/sendingEmail");
const { SuperadmincommonPipelineService } = require("../services/superadminservices");
const { getIO } = require("../utils/setupSocket");
const Coupon = require("../models/coupanPage");
const { OfflineCustomerB2C } = require("../models/Customerb2c.offline");
const { OnlineCustomers } = require("../models/Customerb2c.online");
const OnlineCustomersMain = require("../models/OnlineCustomers.model");
const dbServices = require("../services/db.services");
const OthersService = require("../services/others.service");
const Asset = require("../models/superadmin_Assets");
const AssetModel = require("../models/Assets.model");
const axios = require('axios');
const ProductPricing = require("../models/ProductPricing.model");
const ProductShipping = require("../models/ProductShipping.model");
const CustomDesign = require("../models/customDesign");
const DesignInquiry = require("../models/DesignInquiry.model");


exports.getStoreState = catchAsyncError(async (req, res, next) => {
  // Find stores with flag false
  const stores = await Store.find({ flag: false }).exec();
  if (stores.length == 0) {
    return res.status(200).json({ message: "No stores found" })
  }

  res.status(200).json({
    success: true,
    count: stores.length,
    stores
  });
})


exports.verifyStore = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  // Find the store by ID
  const store = await Store.findById(id).exec();
  if (!store) {
    return next(new AppError("Store not found", 404));
  }

  // Update the flag to true
  store.flag = true;
  await store.save();
  var replacements = store;
  var templates = "store-created-email";

  await sendingEmail(store?.email,
    "Account and Store Verified. Get the store number below",
    `${store?.storeNumber} use this Store number to Login to your store.`)

  res.status(200).json({ success: true, message: "Store flag updated successfully", store });
})


/************************* Get Admins and Workers Both *******************/
exports.superadminGetAllEntities = catchAsyncError(async (req, res, next) => {
  const { type } = req.params;
  const page = req.query.page || 1;

  if (!["user", "worker", "store"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid request. Please provide a valid type (user/store/worker)." });
  }

  let entities;
  if (type === "user") {
    const { pipeline, countPipeline } = commonPipelineService({}, req.query);
    entities = await User.aggregate(pipeline);
    const countResult = await User.aggregate(countPipeline);
    totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  }
  if (type === "store") {
    const { pipeline, countPipeline } = SuperadmincommonPipelineService({}, req.query);
    entities = await Store.aggregate(pipeline);
    const countResult = await Store.aggregate(countPipeline);
    totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  } else {
    const { pipeline, countPipeline } = commonPipelineService({}, req.query);
    entities = await Workers.aggregate(pipeline);
    const countResult = await Workers.aggregate(countPipeline);
    totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  }

  if (!entities || entities.length === 0) {
    return next(new AppError(`No ${type}s found`, 404));
  }

  const showingResult = showingResults(req.query, totalCount);

  return res.status(200).json({
    success: true,
    message: `${type.charAt(0).toUpperCase() + type.slice(1)}s found`,
    totalCount,
    page,
    showingResult,
    data: entities
  });
});


/********** Deactive Active Accounts (Admins and Workers) Both ************/
exports.toggleActiveStatus = catchAsyncError(async (req, res, next) => {
  const { type, userId, activestatus } = req.body;

  if (!type || (type !== "user" && type !== "worker") || !userId || activestatus === undefined) {
    return res.status(400).json({ success: false, message: "Invalid request. Please provide valid type (user/worker), user/worker ID, and activestatus." });
  }

  try {
    let updatedUser;
    if (type === "user") {
      updatedUser = await User.findByIdAndUpdate(userId, { $set: { activestatus } }, { new: true });
    } else {
      updatedUser = await Workers.findByIdAndUpdate(userId, { $set: { activestatus } }, { new: true });
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User/Worker not found." });
    }

    return res.status(200).json({ success: true, message: "Active status toggled successfully.", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


/********************** All Order Listings For The Superadmin *********************/
exports.getOrderListingSuperadmin = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.params;
  // const { _id } = req.user;
  const query = req.query;
  const { status } = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;

  let matchQuery = {};
  if (query.orderId) {
    matchQuery._id = ObjectId(query.orderId);
  } else {
    matchQuery = { storeID: mongoose.Types.ObjectId(storeId) };
    matchQuery.status = status == "false" ? false : true;
  }

  const OfflinePipeline = await CustomerService.searchQuickOrderServiceWithPagination(matchQuery, page, limit)
  if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))


  const OnlinePipeline = await CustomerService.searchOnlineOrdersServiceWithPagination(matchQuery, page, limit)
  if (!OnlinePipeline) return next(new AppError("Couldn't find Online pipeline", "404"))

  const offlineCustomers = await QuickOrderStatus.aggregate(OfflinePipeline.pipeline)
  const onlineCustomers = await QuickOrderStatusOnline.aggregate(OnlinePipeline.pipeline)

  // console.log("offlinecustomer",offlineCustomers)
  // console.log("onlinecustomer",onlineCustomers)

  const countResultOffline = await QuickOrderStatus.aggregate(OfflinePipeline.countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(OnlinePipeline.countPipeline);


  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  // console.log("totalOfflineQuickOrders",totalOfflineQuickOrders)
  // console.log("totalOnlineQuickOrders",totalOnlineQuickOrders)


  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  // Assuming you want the maximum total pages between online and offline customers
  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online and Offline Orders found successfully.",
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineCustomers,
    onlineCustomers
  })
});


/*************************** Order Listing For Superadmin (Payment list) *************/
exports.getQuickOrdersOnline = catchAsyncError(async (req, res, next) => {
  // const { id } = req.user;
  const query = req.query;
  const { status, storeId } = req.query
  const page = req.query.page || 1;
  let dynamicAddFields;

  const projectionFields = {
    billingData: 1,
    WorkerInfo: 1,
    createdAt: -1,
  };

  dynamicAddFields = {
    WorkerInfo: {
      storeId: '$storeID',
      billInvoiceID: '$billInvoiceID',
      orderNumber: '$orderNumber',
      createdAt: '$createdAt',
      updatedAt: '$updatedAt'
    },
  };
  const matchQuery = {
    ...(status && { orderStatus: status === 'false' ? false : true }),
    ...(storeId && { storeID: mongoose.Types.ObjectId(storeId) }),
  };
  const lookupStage = [
    CommonServices.createLookupStage('customerinvoiceonlines', 'billInvoiceID', '_id', 'billingData')
  ]

  const { pipeline, countPipeline } = CommonServices.commonLoopkupIndependentPipelineService(lookupStage, matchQuery, query, projectionFields, dynamicAddFields);

  let myOrders = await QuickOrderStatusOnline.aggregate(pipeline);

  const countResult = await QuickOrderStatusOnline.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResult = CommonServices.showingResults(query, totalCount)
  return res.json({
    success: true,
    message: myOrders.length > 0 ? "Orders found successfully" : "No orders found",
    totalCount,
    page,
    showingResult,
    count: myOrders.length,
    myOrders
  })
})

/*******************Create coupons***********************/
exports.createCounpons = catchAsyncError(async (req, res, next) => {
  const {
    storeId, CouponName, PrecentageAmount, PriceAmount, ValidiyFrom, ValidiyTo, totalCoupon, applicablePrice,
    CategoryType, ProductType, cuponCode } = req.body;

  let coupon;
  let data = {
    storeId, CouponName, PrecentageAmount, PriceAmount, ValidiyFrom, ValidiyTo, totalCoupon, applicablePrice, remainingCoupon: totalCoupon, CategoryType, ProductType, cuponCode
  };

  // Check if a coupon with the same CouponName already exists
  coupon = await Coupon.findOne({ CouponName });

  // If a coupon is found and CouponName is "FIRSTTIME", return error
  if (coupon && CouponName === "FIRSTTIME") {
    return next(new AppError("Coupon already exists", 400));
  }

  // If CouponName is not "FIRSTTIME"
  if (CouponName !== "FIRSTTIME" || !coupon) {
    coupon = await dbServices.createDocument(Coupon, data);
  }

  res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
});


/******************** Get All Coupons List For Admin and Superadmin *************/
exports.getCouponForBoth = catchAsyncError(async (req, res, next) => {
  const { storeId, CouponName } = req.query;

  try {
    let coupons;

    if (storeId) {
      const storeObjectId = mongoose.Types.ObjectId(storeId);

      // Find the coupon based on storeId
      const coupon = await Coupon.find({ storeId: storeObjectId });

      // If coupon not found, return an error
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupons = coupon;
    }

    if (CouponName) {
      // Find the coupon based on CategoryType
      const coupon = await Coupon.find({ CouponName });

      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupons = coupon;
    }

    if (!storeId && !CouponName) {
      // If no query params provided, return all coupons
      coupons = await Coupon.find();
    }

    // Return the coupon data
    res.status(200).json({ success: true, message: 'Coupons found successfully', coupons });
  } catch (error) {
    console.error('Error while fetching coupons:', error);
    return next(new AppError('An error occurred while fetching coupon data', 500));
  }
});


/**********Get all coupons for OFFLINE users*************/
exports.getCounponsOffline = catchAsyncError(async (req, res, next) => {
  const { _id } = req.params;
  console.log("req.user", req.user)
  const { amount, storeId } = req.body;

  const customer = await OfflineCustomerB2C.findById(_id)
  if (!customer) return next(new AppError("Customer not found", 400))
  const currentDate = new Date();
  const previourOrder = await QuickOrderStatus.findOne({ customerID: _id })
  if (!previourOrder) {
    //Get valid coupons
    const coupons = await Coupon.find({
      $or: [
        {
          $and: [
            { storeId: mongoose.Types.ObjectId(storeId) },
            { remainingCoupon: { $gt: 0 } },
            { ValidiyFrom: { $lte: currentDate } },
            { ValidiyTo: { $gte: currentDate } }
          ]
        },
        { CategoryType: "FIRSTTIME" }
      ]
    });
    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      coupons
    })
  } else {
    const coupons = await Coupon.find({
      // CategoryType: { $ne: "FIRSTTIME" },
      storeId: mongoose.Types.ObjectId(storeId),
      remainingCoupon: { $gt: 0 },
      ValidiyFrom: { $lte: currentDate },
      ValidiyTo: { $gte: currentDate }
    })

    res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      coupons
    })
  }
})

/**********Get all coupons for OFFLINE users*************/
exports.getCounponsOnline = catchAsyncError(async (req, res, next) => {
  const { _id } = req.user;
  const { amount, storeId } = req.body;

  const customer = await OnlineCustomerB2C.findById(_id)
  if (!customer) return next(new AppError("Customer not found", 400))
  const currentDate = new Date();

  const previourOrder = await QuickOrderStatusOnline.findOne({ customerID: _id })

  if (!previourOrder) {
    //Get valid coupons
    const coupons = await Coupon.find({
      $or: [
        {
          $and: [
            { storeId: mongoose.Types.ObjectId(storeId) },
            { remainingCoupon: { $gt: 0 } },
            { ValidiyFrom: { $lte: currentDate } },
            { ValidiyTo: { $gte: currentDate } }
          ]
        },
        { CategoryType: "FIRSTTIME" }
      ]
    });
    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      coupons
    })
  } else {
    const coupons = await Coupon.find({
      // CategoryType: { $ne: "FIRSTTIME" },
      storeId: mongoose.Types.ObjectId(storeId),
      remainingCoupon: { $gt: 0 },
      ValidiyFrom: { $lte: currentDate },
      ValidiyTo: { $gte: currentDate }
    })

    res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      coupons
    })
  }
})



/************************** Permession For Stores to show or not ******************/
exports.toggleSuperAdminPermission = async (req, res) => {
  const io = await getIO();
  const { id } = req.params; // Retrieve storeId from request parameters
  try {
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    store.superAdminPermission = !store.superAdminPermission;
    await store.save();
    // Update superAdminPermission in the User collection
    await User.updateMany({ storeId: id }, { superAdminPermission: store.superAdminPermission });
    // console.log("Store updated:", store);
    const updatedUsers = await User.find({ storeId: id });
    // console.log("Users updated:", updatedUsers);

    // Socket emit
    const io = await getIO();
    if (io) {
      await io.emit('storeUpdatedforsuperadmin', store);
    }

    res.json({ message: "Super admin permission toggled successfully", store });
  } catch (error) {
    console.error("Error toggling super admin permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/************************** Permession For Stylish show or not ******************/
exports.toggleSuperAdminPermissionForStylish = async (req, res) => {
  const { id } = req.params;
  const { superAdminPermission, storeId, storeNumber } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (superAdminPermission !== undefined) {
      user.superAdminPermission = superAdminPermission;
    }

    if (storeId !== undefined) {
      user.storeId = storeId;
    }

    if (storeNumber !== undefined) {
      user.storeNumber = storeNumber;
    }

    await user.save();

    // Socket emit
    const io = await getIO();
    if (io) {
      await io.emit('stylishShowReqAccepted', user);
    }

    res.json({ message: "Super admin permission updated successfully", user });
  } catch (error) {
    console.error("Error updating super admin permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





exports.changeStorePasswordBySuperAdmin = catchAsyncError(async (req, res, next) => {
  const { storeId, email, password } = req.body;

  const user = await User.findOne({ storeId: mongoose.Types.ObjectId(storeId), email: email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.password = password;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully" });
});




/********************** Online and Offline (B2C/B2B) Customers Listing ***************/

exports.OnlineOfflineCustomersListing = catchAsyncError(async (req, res, next) => {
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;

  // Assuming matchQuery is defined properly
  const matchQuery = {}; // Replace with actual logic to determine the match query
  const { pipeline, countPipeline } = CommonServices.commonPipelineService(matchQuery, query);

  // Fetching offline and online customers
  let offlineCustomers = await OfflineCustomerB2C.aggregate(pipeline);
  let onlineCustomers = await OnlineCustomersMain.aggregate(pipeline);

  // Processing offline and online customers
  const offlineNotAssignedCustomersData = await OthersService.offlineCustomersForSuperadmin(offlineCustomers);
  const onlineNotAssignedCustomersData = await OthersService.onlineCustomersForSuperadmin(onlineCustomers);

  // Counting total customers
  const countResultOffline = await OfflineCustomerB2C.aggregate(countPipeline);
  const countResultOnline = await OnlineCustomersMain.aggregate(countPipeline);

  let totalOfflineCustomers = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineCustomers = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  // Calculating the total pages for pagination
  const totalPagesOffline = Math.ceil(totalOfflineCustomers / limit);
  const totalPagesOnline = Math.ceil(totalOnlineCustomers / limit);
  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online and Offline Customers found successfully.",
    totalOfflineCustomers,
    totalOnlineCustomers,
    totalPages,
    PageNumber: page,
    offlineNotAssignedCustomersData,
    onlineNotAssignedCustomersData
  });
});



/******************* Delete User/Worker/Stylish (Now delete only stylish) ************/
exports.deleteLoginMembers = catchAsyncError(async (req, res, next) => {
  const { id: _id } = req.query;
  const stylish = await User.findOne({ _id });
  // console.log("stylish", stylish);

  if (!stylish) {
    return res.status(404).send({ message: "Stylish data not found." });
  }

  await User.deleteOne({ _id }); // Delete the stylish data from the database

  return res.status(200).send({ success: true, message: "Stylish deleted successfully." });
});





/******************************* Assets Data Upload **************************/
exports.createAsset = async (req, res) => {
  try {
    const { category, page, file, name, format } = req.body;

    // Create a new asset
    const newAsset = new Asset({
      category,
      page,
      file,
      name,
      format,
    });

    // Save the asset to the database
    const savedAsset = await newAsset.save();

    return res.status(201).json({
      success: true,
      message: 'Asset created successfully!',
      data: savedAsset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
exports.createAssetNew = async (req, res) => {
  try {
    const { category, page, file, name, format } = req.body;

    // Create and save the asset in PostgreSQL
    const newAsset = await AssetModel.create({
      category,
      page,
      file,
      name,
      format
    });

    return res.status(201).json({
      success: true,
      message: 'Asset created successfully!',
      data: newAsset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};






exports.getAssets = async (req, res) => {
  try {
    const { category, page, name, format } = req.query;

    let query = {};

    // Add filters based on query parameters
    if (category) query["category"] = category;
    if (page) query["page"] = page;
    if (name) query["name"] = { $regex: name, $options: "i" }; // Case-insensitive search
    if (format) query["format"] = format;

    // Fetch assets from the database
    const assets = await Asset.find(query);

    // Convert "format" to Base64 for files with type "image"
    const processedAssets = await Promise.all(
      assets.map(async (asset) => {
        if (asset.format === "image") {//format//file
          try {
            const response = await axios.get(asset.file, { responseType: "arraybuffer" });
            const base64 = Buffer.from(response.data, "binary").toString("base64");
            asset.file = `data:image/png;base64,${base64}`; // Update format to Base64 string
          } catch (err) {
            console.error(`Failed to convert URL to Base64 for asset ID ${asset._id}:`, err.message);
          }
        }
        return asset;
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Assets retrieved successfully!',
      data: processedAssets,
    });
  } catch (error) {
    console.error('Error retrieving assets:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
exports.getAssetsNew = async (req, res) => {
  try {
    const { category, page, name, format } = req.query;

    let whereClause = {};

    // Add filters based on query parameters
    if (category) whereClause.category = category;
    if (page) whereClause.page = page;
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` }; // Case-insensitive search
    if (format) whereClause.format = format;

    // Fetch assets from PostgreSQL
    const assets = await AssetModel.findAll({ where: whereClause });

    // Convert "format" to Base64 for files with type "image"

    return res.status(200).json({
      success: true,
      message: 'Assets retrieved successfully!',
      data: assets,
    });
  } catch (error) {
    console.error('Error retrieving assets:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.createOrUpdateShipping = async (req, res) => {
  try {
    const { pricing_list, shipping_list, gender } = req.body;
    const { product_category } = req.params;

    if (!product_category) {
      return res.status(400).json({ error: "Product category is required" });
    }

    const pricingBulkOps = pricing_list.map(({ name, note, image_url, price_range }) => ({
      updateOne: {
        filter: { product_category, name, gender },
        update: { $set: { product_category, name, price_range, note, image_url, gender } },
        upsert: true
      }
    }));

    const shippingBulkOps = shipping_list.map(({ name, shipping_time, note, image_url }) => ({
      updateOne: {
        filter: { product_category, name, gender },
        update: { $set: { product_category, name, shipping_time, note, image_url, gender } },
        upsert: true
      }
    }));

    // Execute bulk write operations in parallel
    const [pricingResult, shippingResult] = await Promise.all([
      ProductPricing.bulkWrite(pricingBulkOps),
      ProductShipping.bulkWrite(shippingBulkOps)
    ]);

    res.json({
      message: "Product data updated successfully",
      pricing: pricingResult,
      shipping: shippingResult,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getShippingAndPricingDetails = async (req, res) => {
  try {
    const { product_category } = req.params;
    const { gender } = req.query

    if (!product_category) {
      return res.status(400).json({ error: "Product category is required" });
    }

    // Fetch product pricing and shipping details for the given category
    const pricingDetails = await ProductPricing.find({ product_category, gender });
    const shippingDetails = await ProductShipping.find({ product_category, gender });

    res.json({
      message: "Product data retrieved successfully",
      pricing: pricingDetails,
      shipping: shippingDetails,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCustomDesigns = async (req, res) => {
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const matchQuery = {};

  let [designInquery, countResultInqueryDesign] = await Promise.all([
    DesignInquiry.find({ isDeleted: false })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate([{ path: "design_id" }]),
    DesignInquiry.countDocuments()
  ])
  console.log(designInquery[0]?.design_id, "design_id..............")

  const totalPagesDesignInquery = Math.ceil(countResultInqueryDesign / limit);

  return res.status(200).json({
    success: true,
    message: "Custom designInquery found successfully.",
    designInquery,
    totalPagesDesignInquery,
    PageNumber: page,
  });
}
