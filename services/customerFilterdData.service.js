// const passport = require("passport");
// const CustomerOnline = require("../models/Customerb2c.online");
// const mongoose = require("mongoose");
// const AppError = require("../utils/errorHandler");
// const jwt = require("jsonwebtoken");
// const authKeys = require("../middleware/authKeys");
// const { createLookupStage, createDynamicLookupStagesOffline, createDynamicLookupStagesOnline } = require("./common.service");



//    exports.searchQuickOrderServiceWithPagination = async (matchQuery, page, limit) => {
//     const keywords = ['customerproducts', 'offlinecustomerb2cs', 'customerinvoices', 'customerreadymadeproducts', 'customerreadymadeaccessories'];
//     const lookupStagesOffline = createDynamicLookupStagesOffline(keywords);
//     const pipeline = [
//       { $match: matchQuery },
//       ...lookupStagesOffline,
//       {
//         $addFields: {
//           quickOrderStatus: {
//             storeID: '$storeID',
//             orderNumber: '$orderNumber',
//             status: '$status',
//             markedStatus: '$markedStatus',
//             activeStatus: '$activeStatus',
//             aligned: '$aligned',
//             cutterStatus: '$cutterStatus',
//             mastertailorStatus: '$mastertailorStatus',
//           },
//         },
//       },
//       {
//         $project: {
//           quickOrderStatus: 1,
//           // Filtered fields for productData
//           'productData.product': {
//             name: 1,
//             productNumber: 1,
//             'categories.name': 1,
//             fabricImage: 1,
//             fabricName: 1,
//             fabricMaterial: 1,
//             fabricQuantity: 1,
//             quantityType: 1,
//             fabDashNumber: 1,
//             _id: 1,
//           },
//           // Omitting other fields in productData
//           billingData: {
//             // Filtered fields for billingData
//             'CustomersSection.customerName': 1,
//             'CustomersSection.gender': 1,
//             'CustomersSection.email': 1,
//             'CustomersSection.phoneNumber': 1,
//             'CustomersSection.dateOfBirth': 1,
//             'CustomersSection.country': 1,
//             'CoastSection.PickupFromStore': 1,
//             'CoastSection.DeliveryAddress': 1,
//             'CoastSection.DeliveryCoast': 1,
//             'CoastSection.Coupon': 1,
//             'CoastSection.SubTotal': 1,
//             'CoastSection.DeliveryCharges': 1,
//             'CoastSection.CouponAmount': 1,
//             'CoastSection.TotalAmount': 1,
//             'CoastSection.PaymentAdvance': 1,
//             'CoastSection.PendingAmount': 1,
//             'CoastSection.DeliveryDate': 1,
//             // Omitting other fields in billingData
//           },
//           createdAt: -1
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       { $skip: (page - 1) * limit },
//       { $limit: limit },
//     ];
  
//     const countPipeline = countPipelineService(matchQuery);
  
//     return { pipeline, countPipeline };
//    };
  


//    exports.searchOnlineOrdersServiceWithPagination = async (matchQuery, page, limit) => {
//     const keywords = ['onlinecustomers', 'customerinvoiceonlines', 'customerproductonlines', 'customerreadymadeproductonlines', 'customerreadymadeaccessoriesonlines', 'customermesurmentonlines'];
//     const lookupStagesOnline = createDynamicLookupStagesOnline(keywords);
//     const pipeline = [
//       { $match: matchQuery },
//       ...lookupStagesOnline,
//       {
//         $addFields: {
//           quickOrderStatus: {
//             storeID: '$storeID',
//             orderNumber: '$orderNumber',
//             status: '$status',
//             activeStatus: '$activeStatus',
//             aligned: '$aligned',
//             cutterStatus: '$cutterStatus',
//             mastertailorStatus: '$mastertailorStatus',
//           },
//         },
//       },
//       {
//         $project: {
//           quickOrderStatus: 1,
//           // Filtered fields for productData
//           'productData.product': {
//             name: 1,
//             productNumber: 1,
//             'categories.name': 1,
//             fabricImage: 1,
//             fabricName: 1,
//             fabricMaterial: 1,
//             fabricQuantity: 1,
//             quantityType: 1,
//             fabDashNumber: 1,
//             _id: 1,
//           },
//           // Omitting other fields in productData
//           billingData: {
//             // Filtered fields for billingData
//             'CustomersSection.customerName': 1,
//             'CustomersSection.gender': 1,
//             'CustomersSection.email': 1,
//             'CustomersSection.phoneNumber': 1,
//             'CustomersSection.dateOfBirth': 1,
//             'CustomersSection.country': 1,
//             'CoastSection.PickupFromStore': 1,
//             'CoastSection.DeliveryAddress': 1,
//             'CoastSection.DeliveryCoast': 1,
//             'CoastSection.Coupon': 1,
//             'CoastSection.SubTotal': 1,
//             'CoastSection.DeliveryCharges': 1,
//             'CoastSection.CouponAmount': 1,
//             'CoastSection.TotalAmount': 1,
//             'CoastSection.PaymentAdvance': 1,
//             'CoastSection.PendingAmount': 1,
//             'CoastSection.DeliveryDate': 1,
//             // Omitting other fields in billingData
//           },
//           createdAt: -1,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       { $skip: (page - 1) * limit },
//       { $limit: limit },
//     ];
  
//     const countPipeline = countPipelineService(matchQuery);
  
//     return { pipeline, countPipeline };
//    };
  