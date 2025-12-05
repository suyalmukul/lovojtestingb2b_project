const passport = require("passport");
const CustomerOnline = require("../models/Customerb2c.online");
const mongoose = require("mongoose");
const AppError = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const authKeys = require("../middleware/authKeys");
const { createLookupStage, createDynamicLookupStagesOffline, createDynamicLookupStagesOnline } = require("./common.service");



exports.authenticateCustomer = async (req, res, next) => {
  passport.authenticate(
    "customerB2C-local",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(new AppError("Invalid email or password.", 401));
        }

        // Extract required fields from the request body
        const { email } = req.body;

        // Handle customerB2C login
        const userFromDB = await CustomerOnline.findOne({ email });

        if (!userFromDB || userFromDB.email !== email) {
          return next(new AppError("Invalid email or password", 400));
        }
        const role = user.role ? user.role : null
        // Create a token with an expiration of 15 days
        const token = jwt.sign({ _id: user._id, role }, authKeys.jwtSecretKey, {
          expiresIn: "15d",
        });

        return res.status(200).json({
          success: true,
          message: "Successfully logged in!",
          token: token,
          user: userFromDB,
        });
      } catch (error) {
        console.log(error);
        return next(new AppError("Server error", 500));
      }
    }
  )(req, res, next);
};



// exports.searchService = async (query, storeId) => {
//   const { search } = query;
//   let matchQuery = { storeId: mongoose.Types.ObjectId(storeId) };
//   if (search)
//     matchQuery.$or = [
//       { phoneNumber: { $regex: search, $options: "i" } },
//       { email: { $regex: search, $options: "i" } },
//     ];
//   const pipeline = [{ $match: matchQuery }];
//   return pipeline;
// };

exports.updateOrAddEntries = (existingEntries, newEntries, keyField) => {
  for (const newEntry of newEntries) {
    const index = existingEntries.findIndex(entry => entry[keyField] === newEntry[keyField]);

    if (index !== -1) {
      // Update existing entry
      Object.assign(existingEntries[index], newEntry); // Update other fields if needed
    } else {
      // Add new entry
      existingEntries.push(newEntry);
    }
  }
};

const countPipelineService = (matchQuery) => {

  const countPipeline = [
    { $match: matchQuery },
    { $group: { _id: null, totalCount: { $sum: 1 } } },
    // { $sort: sortQuery },
    { $sort: { createdAt: -1 } },

  ]

  return countPipeline;
}



exports.searchService = async (query, storeId) => {
  const { search } = query;
  // Check if search is empty
  if (!search) {
    return null;
  }

  let matchQuery = { storeId: mongoose.Types.ObjectId(storeId) };
  matchQuery.$or = [
    { phoneNumber: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const pipeline = [{ $match: matchQuery }];
  return pipeline;
};



exports.searchServiceByOrderNumber = async (matchQuery) => {
  console.log(matchQuery, "...........matchQuery Offline........")
  // const { search } = query;
  // const matchQuery = { storeID: mongoose.Types.ObjectId(storeId), orderNumber: parseInt(search) };

  // const { search, customerId } = query;
  // const matchQuery = { storeID: mongoose.Types.ObjectId(storeId) };

  // if (search) {
  //   matchQuery.orderNumber = parseInt(search);
  // }

  // if (customerId) {
  //   matchQuery.customerID = mongoose.Types.ObjectId(customerId);
  // }

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "offlinecustomerb2cs",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerproducts",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $lookup: {
        from: "customermesurments",
        localField: "measurementID",
        foreignField: "_id",
        as: "measurementData",
      },
    },
    {
      $lookup: {
        from: "customerspacialinstructions",
        localField: "specialIntructionID",
        foreignField: "_id",
        as: "specialInstructionData",
      },
    },
    {
      $lookup: {
        from: "customercontrasts",
        localField: "constrastID",
        foreignField: "_id",
        as: "contrastData",
      },
    },
    {
      $lookup: {
        from: "customerreadymadeproducts",
        localField: "readyMadeProductID",
        foreignField: "_id",
        as: "readymadeProductData",
      },
    },
    {
      $lookup: {
        from: "customerreadymadeaccessories",
        localField: "readyMadeAccessoriesID",
        foreignField: "_id",
        as: "readymadeAccessoriesData",
      },
    },
    {
      $lookup: {
        from: "customerinvoices",
        localField: "billInvoiceID",
        foreignField: "_id",
        as: "billingData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          customerID: '$customerID',
          productID: '$productID',
          orderNumber: '$orderNumber',
          status: '$status',
          markedStatus: '$markedStatus',
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        measurementData: { products: 1 },
        contrastData: { products: 1 },
        readymadeProductData: { products: 1 },
        readymadeAccessoriesData: { products: 1 },
        specialInstructionData: { products: 1 },
        billingData: "$billingData",
        customerData: "$customerData",
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  return pipeline;
};
exports.searchOnlineOrdersByOrderNumber = async (matchQuery) => {
  console.log(matchQuery, "...........matchQuery Online........")
  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "onlinecustomers",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerproductonlines",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $lookup: {
        from: "customermesurmentonlines",
        localField: "measurementID",
        foreignField: "_id",
        as: "measurementData",
      },
    },
    {
      $lookup: {
        from: "customersplinstructiononlines",
        localField: "specialIntructionID",
        foreignField: "_id",
        as: "specialInstructionData",
      },
    },
    {
      $lookup: {
        from: "customercontrastonlines",
        localField: "constrastID",
        foreignField: "_id",
        as: "contrastData",
      },
    },
    {
      $lookup: {
        from: "customerreadymadeproductonlines",
        localField: "readyMadeProductID",
        foreignField: "_id",
        as: "readymadeProductData",
      },
    },
    {
      $lookup: {
        from: "customerreadymadeaccessoriesonlines",
        localField: "readyMadeAccessoriesID",
        foreignField: "_id",
        as: "readymadeAccessoriesData",
      },
    },
    {
      $lookup: {
        from: "customerinvoiceonlines",
        localField: "billInvoiceID",
        foreignField: "_id",
        as: "billingData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          customerID: '$customerID',
          productID: '$productID',
          orderNumber: '$orderNumber',
          status: '$status',
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        measurementData: { products: 1 },
        contrastData: { products: 1 },
        readymadeProductData: { products: 1 },
        readymadeAccessoriesData: { products: 1 },
        specialInstructionData: { products: 1 },
        billingData: "$billingData",
        customerData: "$customerData",
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  return pipeline;
};


exports.InactiveOrdersPipelineService = async (storeId, page, limit) => {
  const matchQuery = { activeStatus: false };

  matchQuery.storeID = mongoose.Types.ObjectId(storeId);
  // matchQuery.storeID = mongoose.Types.ObjectId("64b687aae092dd1142e2d9ce");

  const pipeline = [
    { $match: matchQuery },

    {
      $lookup: {
        from: "offlinecustomerb2cs",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerproducts",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    // {
    //   $lookup: {
    //     from: "customermesurments",
    //     localField: "measurementID",
    //     foreignField: "_id",
    //     as: "measurementData",
    //   },
    // },
    // {
    //   $lookup: {
    //     from: "customerspacialinstructions",
    //     localField: "specialIntructionID",
    //     foreignField: "_id",
    //     as: "specialInstructionData",
    //   },
    // },
    // {
    //   $lookup: {
    //     from: "customercontrasts",
    //     localField: "constrastID",
    //     foreignField: "_id",
    //     as: "contrastData",
    //   },
    // },
    {
      $lookup: {
        from: "customerreadymadeproducts",
        localField: "readyMadeProductID",
        foreignField: "_id",
        as: "readymadeProductData",
      },
    },
    {
      $lookup: {
        from: "customerreadymadeaccessories",
        localField: "readyMadeAccessoriesID",
        foreignField: "_id",
        as: "readymadeAccessoriesData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          activeStatus: "$activeStatus",
          markedStatus: '$markedStatus',
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        // measurementData: { products: 1 },
        // contrastData: { products: 1 },
        // specialInstructionData: { products: 1 },
        readymadeProductData: { products: 1 },
        readymadeAccessoriesData: { accessories: 1 },
        customerData: "$customerData",
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)


  return { pipeline, countPipeline };
};



exports.billingDetailsPipelineService = async (quickOrderStatus) => {
  const matchQuery = { customerID: mongoose.Types.ObjectId(quickOrderStatus.customerID) };

  matchQuery.orderNumber = quickOrderStatus.orderNumber;

  matchQuery.storeID = mongoose.Types.ObjectId(quickOrderStatus.storeID);
  const keywords = ['customerproducts', 'offlinecustomerb2cs', 'customerinvoices', 'customerreadymadeproducts', 'customerreadymadeaccessories'];
  const lookupStagesOffline = createDynamicLookupStagesOffline(keywords);
  const pipeline = [
    { $match: matchQuery },
    ...lookupStagesOffline,
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        readymadeProductData: { products: 1 },
        readymadeAccessoriesData: { accessories: 1 },
        customerData: "$customerData",
        billInvoiceData: "$billingData",
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  return pipeline;
};

/**************** For Admin My Order Services ************/

exports.searchQuickOrderServiceWithPagination = async (matchQuery, page, limit) => {
  const keywords = ['customerproducts', 'customermesurments', 'customercontrasts', 'customerspacialinstructions', 'offlinecustomerb2cs', 'customerinvoices', 'customerreadymadeproducts', 'customerreadymadeaccessories', 'customerproductalterations', 'customermesurmentalterations', 'customerspacialinstructionaltreations'];
  const lookupStagesOffline = createDynamicLookupStagesOffline(keywords);
  const pipeline = [
    { $match: matchQuery },
    ...lookupStagesOffline,
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          productID: '$productID',
          ProductAlterationID: "$ProductAlterationID",
          readyMadeProductID: '$readyMadeProductID',
          readyMadeAccessoriesID: '$readyMadeAccessoriesID',
          orderNumber: '$orderNumber',
          status: '$status',
          markedStatus: '$markedStatus',
          activeStatus: '$activeStatus',
          aligned: '$aligned',
          reAligned: '$reAligned',
          notAssignedProductIds: '$notAssignedProductIds',
          cutterStatus: '$cutterStatus',
          mastertailorStatus: '$mastertailorStatus',
          stitchingStatus: '$stitchingStatus',
          QCStatus: '$QCStatus',
          deliveryStatus: '$deliveryStatus'
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        measurementData: { products: 1 },
        contrastData: { products: 1 },
        specialInstructionData: { products: 1 },

        producAltreationtData: { product: 1 },
        measuremenAltreationtData: { products: 1 },
        specialInstructionAltreationData: { products: 1 },

        readymadeProductData: { products: 1 },
        readymadeAccessoriesData: { accessories: 1 },
        billingData: "$billingData",
        customerData: "$customerData",
        createdAt: -1
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)

  return { pipeline, countPipeline };
};


exports.searchOnlineOrdersServiceWithPagination = async (matchQuery, page, limit) => {
  const keywords = ['onlinecustomers', 'customerinvoiceonlines', 'customerproductonlines', 'customermesurmentonlines', 'customercontrastonlines', 'customersplinstructiononlines', 'customerreadymadeproductonlines', 'customerreadymadeaccessoriesonlines', 'customermesurmentonlines'];
  const lookupStagesOnline = createDynamicLookupStagesOnline(keywords);
  const pipeline = [
    { $match: matchQuery },
    ...lookupStagesOnline,
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          productID: '$productID',
          readyMadeProductID: '$readyMadeProductID',
          readyMadeAccessoriesID: '$readyMadeAccessoriesID',
          orderNumber: '$orderNumber',
          status: '$status',
          activeStatus: '$activeStatus',
          aligned: '$aligned',
          reAligned: '$reAligned',
          notAssignedProductIds: '$notAssignedProductIds',
          cutterStatus: '$cutterStatus',
          mastertailorStatus: '$mastertailorStatus',
          stitchingStatus: '$stitchingStatus',
          QCStatus: '$QCStatus',
          deliveryStatus: '$deliveryStatus'
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        measurementData: { products: 1 },
        contrastData: { products: 1 },
        specialInstructionData: { products: 1 },
        readymadeProductData: { products: 1 },
        readymadeAccessoriesData: { accessories: 1 },
        billingData: "$billingData",
        customerData: "$customerData",
        // workerData : "$workerData"
        createdAt: -1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)

  return { pipeline, countPipeline };
};



/*************** For Worker My Order Services For Cutter ************/


exports.searchQuickOrderServiceWithPaginationForCutter = async (query, storeId, page, limit, role) => {
  const { search, customerId, active } = query;
  const matchQuery = {
    storeID: mongoose.Types.ObjectId(storeId), markedStatus: "Completed"
  };
  if (role === "cutter") {
    matchQuery[`${role}Status`] = {
      $elemMatch: { "status": 'NotAssigned' },
    };

  } else if (role === "mastertailor") {
    matchQuery.aligned = { $elemMatch: { alignedTo: "cutter", alignedStatus: true } };
    matchQuery['mastertailorStatus'] = { $elemMatch: { status: 'NotAssigned' } };
  } else if (role === "QC") {
    matchQuery.aligned = { $elemMatch: { alignedTo: "stitching", alignedStatus: true } };
    matchQuery['QC'] = { $elemMatch: { status: 'NotAssigned' } };
  }
  matchQuery.activeStatus = active == "false" ? false : true;
  if (search) {
    matchQuery.orderNumber = parseInt(search);
  }

  if (customerId) {
    matchQuery.customerID = mongoose.Types.ObjectId(customerId);
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "offlinecustomerb2cs",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerproducts",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $lookup: {
        from: "customerinvoices",
        localField: "billInvoiceID",
        foreignField: "_id",
        as: "billingData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          markedStatus: '$markedStatus',
          activeStatus: '$activeStatus',
          // cutterStatus: {
          //   status: "$cutterStatus.status",
          //   // workerId: "$cutterStatus.workerId",
          //   // timmer: "$cutterStatus.timmer"
          // },
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: {
          $map: {
            input: "$productData",
            as: "product",
            in: {
              product: {
                $map: {
                  input: "$$product.product",
                  as: "item",
                  in: {
                    name: "$$item.name",
                    productNumber: "$$item.productNumber",
                    fabricImage: "$$item.fabricImage",
                    fabricName: "$$item.fabricName",
                    fabricMaterial: "$$item.fabricMaterial",
                    fabricQuantity: "$$item.fabricQuantity",
                    quantityType: "$$item.quantityType",
                    fabDashNumber: "$$item.fabDashNumber",
                    // Exclude the categories and styles information
                  },
                },
              },
            },
          },
        },
        customerData: {
          $map: {
            input: "$customerData",
            as: "customer",
            in: {
              "_id": "$$customer._id",
              // "storeId": "$$customer.storeId",
              "customerName": "$$customer.customerName",
            },
          },
        },

        billingData: {
          $map: {
            input: "$billingData",
            as: "bill",
            in: {
              _id: "$$bill._id",
              storeId: "$$bill.storeId",
              customerId: "$$bill.customerId",
              CoastSection: {
                $map: {
                  input: "$$bill.CoastSection",
                  as: "coast",
                  in: {
                    PickupFromStore: "$$coast.PickupFromStore",
                    DeliveryAddress: "$$coast.DeliveryAddress",
                    DeliveryCoast: "$$coast.DeliveryCoast",
                    DeliveryDate: "$$coast.DeliveryDate",
                    AlternationDate: "$$coast.AlternationDate",
                    _id: "$$coast._id",
                  },
                },
              },
              CustomersSection: {
                $map: {
                  input: "$$bill.CustomersSection",
                  as: "customerSection",
                  in: {
                    ShippingAddress: "$$customerSection.ShippingAddress",
                    BillingAddress: "$$customerSection.BillingAddress",
                    placeOfSupply: "$$customerSection.placeOfSupply",
                    UrgentOrder: "$$customerSection.UrgentOrder",
                    _id: "$$customerSection._id",
                  },
                },
              },
            },
          },
        },
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery);

  return { pipeline, countPipeline };
};


exports.searchOnlineOrdersServiceWithPaginationForCutter = async (query, storeId, page, limit, role) => {
  const { search, customerId, active } = query;
  const matchQuery = { storeID: mongoose.Types.ObjectId(storeId) };
  if (role === "cutter") {
    matchQuery[`${role}Status`] = {
      $elemMatch: { "status": 'NotAssigned' },
    };
  } else if (role === "mastertailor") {
    matchQuery.aligned = { $elemMatch: { alignedTo: "cutter", alignedStatus: true } };
    matchQuery['mastertailorStatus'] = { $elemMatch: { status: 'NotAssigned' } };
  } else if (role === "QC") {
    matchQuery.aligned = { $elemMatch: { alignedTo: "stitching", alignedStatus: true } };
    matchQuery['QC'] = { $elemMatch: { status: 'NotAssigned' } };
  }
  matchQuery.activeStatus = active == "false" ? false : true;

  if (search) {
    matchQuery.orderNumber = parseInt(search);
  }

  if (customerId) {
    matchQuery.customerID = mongoose.Types.ObjectId(customerId);
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "onlinecustomers",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerinvoiceonlines",
        localField: "billInvoiceID",
        foreignField: "_id",
        as: "billingData",
      },
    },
    {
      $lookup: {
        from: "customerproductonlines",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          activeStatus: '$activeStatus',
          // cutterStatus: {
          //   status: "$cutterStatus.status"
          // },
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        // productData: { product: 1 },
        productData: {
          $map: {
            input: "$productData",
            as: "product",
            in: {
              product: {
                $map: {
                  input: "$$product.product",
                  as: "item",
                  in: {
                    name: "$$item.name",
                    productNumber: "$$item.productNumber",
                    fabricImage: "$$item.fabricImage",
                    fabricName: "$$item.fabricName",
                    fabricMaterial: "$$item.fabricMaterial",
                    fabricQuantity: "$$item.fabricQuantity",
                    quantityType: "$$item.quantityType",
                    fabDashNumber: "$$item.fabDashNumber",
                  },
                },
              },
            },
          },
        },
        // billingData: "$billingData",
        billingData: {
          $map: {
            input: "$billingData",
            as: "bill",
            in: {
              _id: "$$bill._id",
              storeId: "$$bill.storeId",
              customerId: "$$bill.customerId",
              CoastSection: {
                $map: {
                  input: "$$bill.CoastSection",
                  as: "coast",
                  in: {
                    PickupFromStore: "$$coast.PickupFromStore",
                    DeliveryAddress: "$$coast.DeliveryAddress",
                    DeliveryCoast: "$$coast.DeliveryCoast",
                    DeliveryDate: "$$coast.DeliveryDate",
                    AlternationDate: "$$coast.AlternationDate",
                    _id: "$$coast._id",
                  },
                },
              },
              CustomersSection: {
                $map: {
                  input: "$$bill.CustomersSection",
                  as: "customerSection",
                  in: {
                    ShippingAddress: "$$customerSection.ShippingAddress",
                    BillingAddress: "$$customerSection.BillingAddress",
                    placeOfSupply: "$$customerSection.placeOfSupply",
                    UrgentOrder: "$$customerSection.UrgentOrder",
                    _id: "$$customerSection._id",
                  },
                },
              },
            },
          },
        },
        // customerData: "$customerData",
        customerData: {
          $map: {
            input: "$customerData",
            as: "customer",
            in: {
              "_id": "$$customer._id",
              "name": "$$customer.name",
            },
          },
        },
        createdAt: -1

      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)

  return { pipeline, countPipeline };
};


/*************** For Worker My Order Services For Cutter Indivisual ************/


exports.searchOrderStatusServiceWithPaginationForCutter = async (query, storeId, page, limit, workerId, role) => {
  const { search, customerId, active } = query;
  const matchQuery = {
    storeID: mongoose.Types.ObjectId(storeId),
    [`${role}Status.workerId`]: mongoose.Types.ObjectId(workerId),
    $or: []
  };
  matchQuery.activeStatus = active == "false" ? false : true;

  if (query && query[`${role}Status`]) {
    matchQuery.$or.push({ [`${role}Status.status`]: query[`${role}Status`] });
  } else {
    matchQuery.$or.push({ [`${role}Status.status`]: 'Completed' });
    matchQuery.$or.push({ [`${role}Status.status`]: 'InProgress' });
  }
  console.log("......matchquery......", matchQuery)

  if (search) {
    matchQuery.orderNumber = parseInt(search);
  }

  if (customerId) {
    matchQuery.customerID = mongoose.Types.ObjectId(customerId);
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "offlinecustomerb2cs",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerproducts",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $lookup: {
        from: "customerinvoices",
        localField: "billInvoiceID",
        foreignField: "_id",
        as: "billingData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          markedStatus: '$markedStatus',
          activeStatus: '$activeStatus',
          // cutterStatus: {
          //   status: "$cutterStatus.status",
          //   workerId: "$cutterStatus.workerId",
          //   timmer: "$cutterStatus.timmer"
          // },
          [`${role}Status`]: {
            status: `$${role}Status.status`,
            workerId: `$${role}Status.workerId`,
            timmer: `$${role}Status.timmer`
          },
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: {
          $map: {
            input: "$productData",
            as: "product",
            in: {
              product: {
                $map: {
                  input: "$$product.product",
                  as: "item",
                  in: {
                    name: "$$item.name",
                    productNumber: "$$item.productNumber",
                    fabricImage: "$$item.fabricImage",
                    fabricName: "$$item.fabricName",
                    fabricMaterial: "$$item.fabricMaterial",
                    fabricQuantity: "$$item.fabricQuantity",
                    quantityType: "$$item.quantityType",
                    fabDashNumber: "$$item.fabDashNumber",
                    // Exclude the categories and styles information
                  },
                },
              },
            },
          },
        },
        customerData: {
          $map: {
            input: "$customerData",
            as: "customer",
            in: {
              "_id": "$$customer._id",
              // "storeId": "$$customer.storeId",
              "customerName": "$$customer.customerName",
            },
          },
        },

        billingData: {
          $map: {
            input: "$billingData",
            as: "bill",
            in: {
              _id: "$$bill._id",
              storeId: "$$bill.storeId",
              customerId: "$$bill.customerId",
              CoastSection: {
                $map: {
                  input: "$$bill.CoastSection",
                  as: "coast",
                  in: {
                    PickupFromStore: "$$coast.PickupFromStore",
                    DeliveryAddress: "$$coast.DeliveryAddress",
                    DeliveryCoast: "$$coast.DeliveryCoast",
                    DeliveryDate: "$$coast.DeliveryDate",
                    AlternationDate: "$$coast.AlternationDate",
                    _id: "$$coast._id",
                  },
                },
              },
              CustomersSection: {
                $map: {
                  input: "$$bill.CustomersSection",
                  as: "customerSection",
                  in: {
                    ShippingAddress: "$$customerSection.ShippingAddress",
                    BillingAddress: "$$customerSection.BillingAddress",
                    placeOfSupply: "$$customerSection.placeOfSupply",
                    UrgentOrder: "$$customerSection.UrgentOrder",
                    _id: "$$customerSection._id",
                  },
                },
              },
            },
          },
        },
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery);

  return { pipeline, countPipeline };
};


exports.searchOnlineOrderStatusServiceForCutter = async (query, storeId, page, limit, workerId, role) => {
  const { search, customerId, active } = query;
  const matchQuery = {
    storeID: mongoose.Types.ObjectId(storeId),
    [`${role}Status.workerId`]: mongoose.Types.ObjectId(workerId),
    $or: []
  };
  matchQuery.activeStatus = active == "false" ? false : true;

  if (query && query[`${role}Status`]) {
    matchQuery.$or.push({ [`${role}Status.status`]: query[`${role}Status`] });
  } else {
    matchQuery.$or.push({ [`${role}Status.status`]: 'Completed' });
    matchQuery.$or.push({ [`${role}Status.status`]: 'InProgress' });
  }
  // const matchQuery = {
  //   storeID: mongoose.Types.ObjectId(storeId),
  //   'cutterStatus.workerId': mongoose.Types.ObjectId(workerId),
  //   $or: []
  // };

  // if (query && query.cutterStatus) {
  //   // If status is specified in queryParams, add it to the $or array
  //   matchQuery.$or.push({ 'cutterStatus.status': query.cutterStatus });
  // } else {
  //   // If no status is specified, include both "Completed" and "InProgress"
  //   matchQuery.$or.push({ 'cutterStatus.status': 'Completed' });
  //   matchQuery.$or.push({ 'cutterStatus.status': 'InProgress' });
  // }

  matchQuery.activeStatus = active == "false" ? false : true;

  if (search) {
    matchQuery.orderNumber = parseInt(search);
  }

  if (customerId) {
    matchQuery.customerID = mongoose.Types.ObjectId(customerId);
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "onlinecustomers",
        localField: "customerID",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $lookup: {
        from: "customerinvoiceonlines",
        localField: "billInvoiceID",
        foreignField: "_id",
        as: "billingData",
      },
    },
    {
      $lookup: {
        from: "customerproductonlines",
        localField: "productID",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          activeStatus: '$activeStatus',
          [`${role}Status`]: {
            status: `$${role}Status.status`,
            workerId: `$${role}Status.workerId`,
            timmer: `$${role}Status.timmer`
          },
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        // productData: { product: 1 },
        productData: {
          $map: {
            input: "$productData",
            as: "product",
            in: {
              product: {
                $map: {
                  input: "$$product.product",
                  as: "item",
                  in: {
                    name: "$$item.name",
                    productNumber: "$$item.productNumber",
                    fabricImage: "$$item.fabricImage",
                    fabricName: "$$item.fabricName",
                    fabricMaterial: "$$item.fabricMaterial",
                    fabricQuantity: "$$item.fabricQuantity",
                    quantityType: "$$item.quantityType",
                    fabDashNumber: "$$item.fabDashNumber",
                  },
                },
              },
            },
          },
        },
        // billingData: "$billingData",
        billingData: {
          $map: {
            input: "$billingData",
            as: "bill",
            in: {
              _id: "$$bill._id",
              storeId: "$$bill.storeId",
              customerId: "$$bill.customerId",
              CoastSection: {
                $map: {
                  input: "$$bill.CoastSection",
                  as: "coast",
                  in: {
                    PickupFromStore: "$$coast.PickupFromStore",
                    DeliveryAddress: "$$coast.DeliveryAddress",
                    DeliveryCoast: "$$coast.DeliveryCoast",
                    DeliveryDate: "$$coast.DeliveryDate",
                    AlternationDate: "$$coast.AlternationDate",
                    _id: "$$coast._id",
                  },
                },
              },
              CustomersSection: {
                $map: {
                  input: "$$bill.CustomersSection",
                  as: "customerSection",
                  in: {
                    ShippingAddress: "$$customerSection.ShippingAddress",
                    BillingAddress: "$$customerSection.BillingAddress",
                    placeOfSupply: "$$customerSection.placeOfSupply",
                    UrgentOrder: "$$customerSection.UrgentOrder",
                    _id: "$$customerSection._id",
                  },
                },
              },
            },
          },
        },
        // customerData: "$customerData",
        customerData: {
          $map: {
            input: "$customerData",
            as: "customer",
            in: {
              "_id": "$$customer._id",
              "name": "$$customer.name",
            },
          },
        },
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)

  return { pipeline, countPipeline };
};

/*********************Order Listing for Worker Offline********************/
exports.offlineOrderListingServiceWorker = async (matchQuery, page, limit) => {
  // const keywords = ['customerproducts', 'offlinecustomerb2cs', 'customerinvoices', 'customercontrasts', 'customerspacialinstructions', 'customermesurments'];
  const keywords = ['customerproducts', 'customerinvoices', 'offlinecustomerb2cs'];
  const lookupStagesOffline = createDynamicLookupStagesOffline(keywords);
  const pipeline = [
    { $match: matchQuery },
    ...lookupStagesOffline,
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          markedStatus: '$markedStatus',
          activeStatus: '$activeStatus',
          aligned: '$aligned',
          reAligned: '$reAligned',
          notAssignedProductIds: '$notAssignedProductIds',
          cutterStatus: '$cutterStatus',
          mastertailorStatus: '$mastertailorStatus',
          stitchingStatus: '$stitchingStatus',
          QCStatus: '$QCStatus',
          deliveryStatus: '$deliveryStatus'
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        // measurementData: { products: 1 },
        // contrastData: { products: 1 },
        // specialInstructionData: { products: 1 },
        billingData: "$billingData",
        customerData: "$customerData",
        createdAt: -1
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)

  return { pipeline, countPipeline };
};

/*********************Order Listing for Worker Online********************/
exports.onlineOrderListingServiceWorker = async (matchQuery, page, limit) => {
  // const keywords = ['onlinecustomers', 'customerinvoiceonlines', 'customerproductonlines', 'customercontrastonlines', 'customersplinstructiononlines', 'customermesurmentonlines'];
  const keywords = ['onlinecustomers', 'customerinvoiceonlines', 'customerproductonlines'];
  const lookupStagesOffline = createDynamicLookupStagesOnline(keywords);
  const pipeline = [
    { $match: matchQuery },
    ...lookupStagesOffline,
    {
      $addFields: {
        quickOrderStatus: {
          storeID: '$storeID',
          orderNumber: '$orderNumber',
          status: '$status',
          activeStatus: '$activeStatus',
          aligned: '$aligned',
          reAligned: '$reAligned',
          notAssignedProductIds: '$notAssignedProductIds',
          cutterStatus: '$cutterStatus',
          mastertailorStatus: '$mastertailorStatus',
          stitchingStatus: '$stitchingStatus',
          QCStatus: '$QCStatus',
          deliveryStatus: '$deliveryStatus'
        },
      },
    },
    {
      $project: {
        quickOrderStatus: 1,
        productData: { product: 1 },
        // measurementData: { products: 1 },
        // contrastData: { products: 1 },
        // specialInstructionData: { products: 1 },
        billingData: "$billingData",
        customerData: "$customerData",
        createdAt: -1
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const countPipeline = countPipelineService(matchQuery)

  return { pipeline, countPipeline };
};







