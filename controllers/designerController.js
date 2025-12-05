const Order = require("../models/order");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const mongoose = require('mongoose');
const QuickOrderStatus = require("../models/quickorderStatus.model");
const QuickOrderStatusOnline = require("../models/quickorderStatusB2C.model");
const CustomerService = require('../services/customer.service');
const { transformPopulatedFields } = require("../utils/Fields");
const Style = require("../models/Style");
const Contrast = require("../models/Contrast");
const Measurement = require("../models/Measurement");
const WorkerStatus = require("../models/worker_status");
const SpecialInstruction = require("../models/special_instruction");
const moment = require("moment");
const CustomerProduct = require("../models/customerProduct");
const customerProductAlteration = require("../models/customerProductAltration");

async function filterB2BOrders(orders, filter, type) {
  const result = [];
  for (const order of orders) {
    let productLength = 0;
    let productAlterationLength = 0;
    if (type === "b2b") {
      if (!order.quickOrderStatus?.ProductAlterationID && !!order.quickOrderStatus?.ProductID) continue;
      const productData = await CustomerProduct.findById(order.quickOrderStatus?.productID);
      const productAlterationDataData = await customerProductAlteration.findById(order.quickOrderStatus?.ProductAlterationID);
      if (!productAlterationDataData && !productData) continue;
    productLength = productData?.product?.length || 0;
    productAlterationLength = productAlterationDataData?.product?.length || 0;
    } 
    console.log(productLength, "productLength........................")
    
    const finalLength = productLength + productAlterationLength;

    console.log(finalLength, "finalLength..............")

    const qcCompletedCount = Array.isArray(order.quickOrderStatus.QCStatus)
      ? order.quickOrderStatus.QCStatus.filter((e) => e.status === 'Completed').length
      : 0;

    const deliveryCompletedCount = Array.isArray(order.quickOrderStatus.deliveryStatus)
      ? order.quickOrderStatus.deliveryStatus.filter((e) => e.status === 'Completed').length
      : 0;
    switch (filter) {
      case "inProgress":
        if (
          qcCompletedCount < finalLength ||
          deliveryCompletedCount < finalLength
        ) {
          result.push(order);
        }
        break;

      case "readyToDeliver":
        if (
          qcCompletedCount === finalLength &&
          deliveryCompletedCount < finalLength
        ) {
          result.push(order);
        }
        break;

      case "deliver":
        if (deliveryCompletedCount === finalLength) {
          result.push(order);
        }
        break;
      case "inComplete":
        console.log(order.quickOrderStatus.markedStatus, 'order.quickOrderStatus.markedStatus...........')
        if (order.quickOrderStatus.markedStatus === "Incomplete") {
          result.push(order);
        }
        break;
      default: 
        console.log("Incorrect filter........................")
    }
  }

  return result;
}

exports.getDesignerOrder = catchAsyncError(async (req, res, next) => {
    const { storeId } = req.user;
    const query = req.query;
    const { active, status, qcstatus, fromDate, toDate, filter} = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10; // Ensure the limit is 10
  const skip = (page - 1) * limit;

    const type = query.type
    const responseObject = { success: true, message: "Retrived Successfully" }

    let matchQuery = {
        orderNumber: { $exists: true }
    };

    if (query.orderId) {
        matchQuery._id = mongoose.Types.ObjectId(query.orderId);
    } else {
        matchQuery.storeID = mongoose.Types.ObjectId(storeId);
        matchQuery.activeStatus = active === "false" ? false : true;
        matchQuery.status = status === undefined ? { $in: [true, false] } : (status === "false" ? false : true);
      if (qcstatus) matchQuery["QCStatus.status"] = qcstatus;
//      if (filter) {
//     switch (filter) {
//         case "inProgress":
//             matchQuery["$or"] = [
//                 { "QCStatus.status": { $exists: false } },
//                 { "QCStatus.status": false }
//             ];
//             break;
//         case "InComplete":
//             matchQuery.markedStatus = "Incomplete";
//             break;
//         case "ReadyToDeliver":
//             matchQuery["QCStatus.status"] = true;
//             break;
//         case "deliver":
//             matchQuery["deliveryStatus"] = true;
//             break;
//     }
// }

        if (fromDate && toDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0); 

       const end = new Date(toDate);
       end.setHours(23, 59, 59, 999);

       matchQuery.createdAt = {
          $gte: start,
          $lte: end,
           };
        }

      if (fromDate && !toDate) {
         console.log({fromDate})
       const start = new Date(fromDate);
            // start.setHours(0, 0, 0, 0); 
            const now = new Date();
            console.log({start, now})
            now.setHours(23, 59, 59, 999);
             matchQuery.createdAt = {
             $gte: start,
             $lte: now,
           };
        }

    }
    if (type == 'b2b' || !type) {
        const OfflinePipeline = await CustomerService.searchQuickOrderServiceWithPagination(matchQuery, page, Math.ceil(limit / 2));
        if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"));
      const b2bOrders = await QuickOrderStatus.aggregate(OfflinePipeline.pipeline);
      const filteredB2BOrders = await filterB2BOrders(b2bOrders, filter, "b2b");
      console.log({ filteredB2BOrders }, "filteredB2BOrders..................................")
     const data = filter ? filteredB2BOrders : b2bOrders
        responseObject.b2b_orders = data
    }
    if (type == 'b2c' || !type) {
        let b2cOrders = await Order.aggregate([
            // 1. Filter for product-type orders
            { 
              $match: { type: "product" } 
            },
            // 2. Unwind the products array so each product is separate.
            { 
              $unwind: { path: "$products", preserveNullAndEmptyArrays: true }
            },
            // 3. Lookup product data for the current product.
            {
              $lookup: {
                from: "products",
                localField: "products.product_id",
                foreignField: "_id",
                as: "product_data"
              }
            },
            // 4. Unwind the product_data array (should contain exactly one document).
            {
              $unwind: { path: "$product_data", preserveNullAndEmptyArrays: true }
            },
            // 5. Add the quantity from the order’s products array into product_data.
            {
              $addFields: {
                "product_data.quantity": "$products.quantity"
              }
            },
            // 6. Lookup customer addresses.
            {
              $lookup: {
                from: "customer_addresses",
                localField: "address_id",
                foreignField: "_id",
                as: "address_data"
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "stylist_id",
                foreignField: "_id",
                as: "stylist_data"
              }
            },
            // 7. Lookup online customer data.
            {
              $lookup: {
                from: "onlinecustomers",
                localField: "customer_id",
                foreignField: "_id",
                as: "customer_data"
              }
            },
            // 8. Lookup store data from the product.
            {
              $lookup: {
                from: "stores",
                localField: "product_data.store_id",
                foreignField: "_id",
                as: "store_data"
              }
            },
            // 9. Lookup fabric data from the product.
            {
              $lookup: {
                from: "fabricsforsuperadmins",
                localField: "product_data.fabric_id",
                foreignField: "_id",
                as: "fabric_data"
              }
            },
            // 10. Lookup category data from the product.
            {
              $lookup: {
                from: "adminproductforusers",
                localField: "product_data.category_id",
                foreignField: "_id",
                as: "category_data"
              }
            },
            // 11. Unwind the single-document arrays where appropriate.
            {
              $unwind: { path: "$address_data", preserveNullAndEmptyArrays: true }
            },
            {
              $unwind: { path: "$stylist_data", preserveNullAndEmptyArrays: true }
            },
            {
              $unwind: { path: "$customer_data", preserveNullAndEmptyArrays: true }
            },
            {
              $unwind: { path: "$store_data", preserveNullAndEmptyArrays: true }
            },
            {
              $unwind: { path: "$fabric_data", preserveNullAndEmptyArrays: true }
            },
            {
              $unwind: { path: "$category_data", preserveNullAndEmptyArrays: true }
            },
            // 12. (Optional) Filter orders by store if needed. This makes sure that the looked-up product's store matches.
            {
              $match: { "product_data.store_id": mongoose.Types.ObjectId(storeId) }
            },
            // 13. Group back orders by _id to reassemble the products array.
            {
              $group: {
                _id: "$_id",
                order_number: { $first: "$order_number" },
                total_amount: { $first: "$total_amount" },
                payment_status: { $first: "$payment_status" },
                order_status: { $first: "$order_status" },
                createdAt: { $first: "$createdAt" },
                customer_data: { $first: "$customer_data" },
                address_data: { $first: "$address_data" },
                stylist_data: { $first: "$stylist_data" },
                // Reassemble the products array. We merge product_data with additional lookup info.
                products: { 
                  $push: { 
                    $mergeObjects: [
                      "$product_data", 
                      { store_data: "$store_data" },
                      { fabric_id: "$fabric_data" },
                      { category_id: "$category_data" }
                    ]
                  }
                }
              }
            },
            // 14. Sort the orders.
            { 
              $sort: { createdAt: -1 } 
            },
            // 15. Apply pagination.
            { 
              $skip: skip 
            },
            { 
              $limit: limit 
            },
            // 16. Project only the needed fields.
            {
              $project: {
                _id: 1,
                order_number: 1,
                total_amount: 1,
                payment_status: 1,
                order_status: 1,
                createdAt: 1,
                customer_data: 1,
                address_data: 1,
                products: 1,
                stylist_data:1
              }
            }
          ]);
          
          

        b2cOrders = await Promise.all(b2cOrders.map(async order => {  // Add await here
            order.products = await Promise.all(order.products.map(async product_data => {
                const product_id = product_data._id
                let [styles, contrasts, measurements,worker_status,special_instructions] = await Promise.all([
                    Style.find({ product_id }).lean(),
                    Contrast.find({ product_id }).populate('fabric_id').lean(),
                    Measurement.find({ product_id }).lean(),
                    WorkerStatus.find({product_id}).sort({createdAt:-1}).lean(),
                    SpecialInstruction.find({product_id}).sort({createdAt:-1}).lean()

                ]);
                return { product_data, styles, contrasts, measurements,worker_status,special_instructions };
                // return product
            }));

            return order;
        }));

        b2cOrders = transformPopulatedFields(b2cOrders);
      const filteredB2COrders = await filterB2BOrders(b2cOrders, filter, "b2c");
      const data = filter === ("inProgress" || "readyToDeliver" || "deliver" || "inComplete") ? filteredB2COrders : b2cOrders
       responseObject.b2c_orders = data

    }



    return res.status(200).json(responseObject);
});

