const { default: mongoose } = require("mongoose");
const WorkerFail = require("../models/WorkerFail");
const WorkerLogs = require("../models/worker_cutter");
const QuickOrderStatus = require("../models/quickorderStatus.model");
const Stores = require("../models/stores");
const { getProductDetailsService, altreationGetProductDetailsService } = require("./order.service");
const AdminReadymadeProductForUser = require("../models/QuickorderNew_ReadymadeProduct_adminUser");
const AdminReadymadeAccessoriesForUser = require('../models/QuickorderNew_ReadymadeAccessories_adminUser');
const Fabrics = require("../models/fabric");
const CustomerProduct = require("../models/customerProduct");

const pushNotAssignedForCron = async (order, product) => {
  console.log(product.productId, "........item....cron....");
  try {
    order.notAssignedProductIds.push({ productId: mongoose.Types.ObjectId(product.productId) });
    await order.save();
    const workerLog = await WorkerLogs.findOne({ orderId: order._id, productId: product.productId })
    if (workerLog) {
      const workerFail = await WorkerFail.create(workerLog.toObject());
      await workerLog.remove();
      console.log("WorkerLog moved to WorkerFail:", workerFail);
    } else {
      console.log("No workerLog found for the given order and product.");
    }
    console.log("Product added to notAssignedProductIds successfully.");
  } catch (error) {
    console.error("Error adding product to notAssignedProductIds:", error);
  }
};

const getNotAssignedMatchquery = (role, storeId) => {
  const matchQuery = role === 'cutter' ?
    {
      'notAssignedProductIds': { $exists: true, $ne: [] },
      storeID: mongoose.Types.ObjectId(storeId)
    } :

    role === 'mastertailor' ?
      {
        'aligned': {
          $elemMatch: { 'alignedTo': 'cutter', 'alignedStatus': true },
        }, storeID: mongoose.Types.ObjectId(storeId)
      } :
      role === 'stitching' ? { 'aligned': { $elemMatch: { 'alignedTo': 'mastertailor', 'alignedStatus': true }, }, storeID: mongoose.Types.ObjectId(storeId) } :

        role === 'QC' ? { 'aligned': { $elemMatch: { 'alignedTo': 'stitching', 'alignedStatus': true }, }, storeID: mongoose.Types.ObjectId(storeId) } :
          //add this line by me 
          role === 'admin' ? { 'aligned': { $elemMatch: { 'alignedTo': 'QC', 'alignedStatus': true }, }, storeID: mongoose.Types.ObjectId(storeId) } :
            {};
  return matchQuery
}
//
const notAssignedProductsforWorkers = async (orders, role) => {
  const productDataArray = [];
  try {
    for (const item of orders) {
      if (role === 'cutter') {
        for (const product of item.notAssignedProductIds) {
          if (product && product.productId) {
            const productData = await getProductDetailsService(item, product.productId, true);
            if (productData && productData.length > 0) {
              productDataArray.push(productData);
            }
          }
        }
      } else if (role === 'mastertailor' || role === 'stitching' || role === 'QC' || role === 'admin') {
        for (const product of item.aligned) {
             const alreadyAction =  item?.[`${role}Status`]?.some( productData => productData?.productId?._id?.toString() === product.productId?.toString());
          if (product && product.productId && !alreadyAction) {
            const productDetails = await CustomerProduct.findById(item.productID);
            // console.log(JSON.stringify(productDetails), "productDetails......................")
            const flag = productDetails?.product?.some(productData => productData?._id?.toString() === product.productId?.toString());
            // console.log(flag, "flag.................", '\n', product.productId, "product.productId.............................")
            console.log(flag)
            const productData = await getProductDetailsService(item, product.productId, true);
            productDataArray.push(productData);
          }
        }
      }
    }
    // console.log(productDataArray, "productDataArray............")
    return productDataArray;
  } catch (error) {
    console.error('Error:', error);
    // Handle error appropriately
    return [];
  }
};


//testing

const getNotAssigneddMatchquery = (role, storeId) => {
  const baseQuery = { 'notAssignedProductIds': { $exists: true, $ne: [] } };

  // Conditionally include storeId if it exists
  if (storeId) {
    baseQuery.storeID = mongoose.Types.ObjectId(storeId);
  }

  const matchQuery = role === 'cutter' ? baseQuery :
    role === 'mastertailor' ? { ...baseQuery, 'aligned': { $elemMatch: { 'alignedTo': 'cutter', 'alignedStatus': true } } } :
      role === 'stitching' ? { ...baseQuery, 'aligned': { $elemMatch: { 'alignedTo': 'mastertailor', 'alignedStatus': true } } } :
        role === 'QC' ? { ...baseQuery, 'aligned': { $elemMatch: { 'alignedTo': 'stitching', 'alignedStatus': true } } } :
          role === 'stylish' ? { 'aligned': { $elemMatch: { 'alignedTo': 'QC', 'alignedStatus': true } } } :
            {};

  return matchQuery;
};


//   const createOrderNumber = async (latestOrderNumber, storeId) => {
//     const store = await Stores.findById(storeId);
//     let orderNumber;

//     // If latestOrderNumber is null or undefined or doesn't contain an order number
//     if (!latestOrderNumber || !latestOrderNumber.orderNumber) {
//         // Start from 100
//         orderNumber = 100;
//     } else {
//       // If the latest order number is in the format "D101/108"
//       if (latestOrderNumber.orderNumber.includes('/')) {
//           // Extract the numeric part from the latest order number
//           const numericPart = parseInt(latestOrderNumber.orderNumber.split('/')[1]);
//           // Increment the numeric part by 1
//           orderNumber = numericPart + 1;
//       } else {
//           // If the latest order number is just a number like "108"
//           orderNumber = parseInt(latestOrderNumber.orderNumber) + 1;
//       }
//   }

//     // // Append store number with the updated order number
//     // const orderNumberWithStore = `${store.storeNumber}/${orderNumber}`;
//       // Append store number with the updated order number and "B2C"
//       const orderNumberWithStore = `${store.storeNumber}/OF${orderNumber}`;

//     // Now orderNumberWithStore contains the desired order number format
//     return orderNumberWithStore;
// };

const createOrderNumber = async (latestOrderNumber, storeId) => {
  const store = await Stores.findById(storeId);
  let orderNumber;

  if (!latestOrderNumber || !latestOrderNumber.orderNumber) {
    orderNumber = 100;
  } else {
    let numericPart;
    if (latestOrderNumber.orderNumber.includes('/OF')) {
      numericPart = parseInt(latestOrderNumber.orderNumber.split('/OF')[1]);
    } else if (latestOrderNumber.orderNumber.includes('/')) {
      numericPart = parseInt(latestOrderNumber.orderNumber.split('/')[1]);
    } else {
      numericPart = parseInt(latestOrderNumber.orderNumber);
    }
    orderNumber = numericPart + 1;
  }

  const orderNumberWithStore = `${store.storeNumber}/OF${orderNumber}`;
  return orderNumberWithStore;
};


/*******************For Superadmin ************/

const onlineCustomersForSuperadmin = async (onlineCustomers) => {
  return onlineCustomers.map(customer => {
    return {
      customerId: customer._id,
      email: customer.email,
      name: customer.name,
      mobileNumber: customer.mobileNumber,
      activestatus: customer.activestatus,
      socialId: customer.socialId,
      type: customer.type,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  });
};



const offlineCustomersForSuperadmin = async (offlineCustomers) => {
  return offlineCustomers.map(customer => {
    return {
      customerId: customer._id,
      storeId: customer.storeId,
      customerName: customer.customerName,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth,
      country: customer.country,
      phoneNumber: customer.phoneNumber,
      alternatePhoneNumber: customer.alternatePhoneNumber,
      email: customer.email,
      address: customer.address,
      customerFront: customer.customerFront,
      customerBack: customer.customerBack,
      customerSide: customer.customerSide,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  });
};


//altreationnnnnnnnn///////

const altreationGetNotAssigneddMatchquery = (role, storeId) => {
  // const baseQuery = { 'notAssignedProductIds': { $exists: true, $ne: [] } };
  const baseQuery = { 'notAssignedProductIds': { $exists: true } };


  // Conditionally include storeId if it exists
  if (storeId) {
    baseQuery.storeID = mongoose.Types.ObjectId(storeId);
  }
   console.log({role})
  // const matchQuery = role === 'mastertailor' ? baseQuery :
  const matchQuery = role === 'mastertailor' ?  { ...baseQuery,  'notAssignedProductIds': {  $ne: [] } } :
    // role === 'mastertailor' ? { ...baseQuery, 'aligned': { $elemMatch: { 'alignedTo': 'cutter', 'alignedStatus': true } } } :
    role === 'stitching' ? { ...baseQuery, 'aligned': { $elemMatch: { 'alignedTo': 'mastertailor', 'alignedStatus': true } }} :
      role === 'QC' ? { ...baseQuery, 'aligned': { $elemMatch: { 'alignedTo': 'stitching', 'alignedStatus': true } } } :
        role === 'stylish' ? { 'aligned': { $elemMatch: { 'alignedTo': 'QC', 'alignedStatus': true } } } :
          {};
  return matchQuery;
};



// ///altreation//////
// const altreationNotAssignedProductsforWorkers = async (orders, role) => {
//   const productDataArray = [];
//   try {
//     for (const item of orders) {
//       if(role === 'mastertailor') {
//         for (const product of item.notAssignedProductIds) {
//         if (product && product.productId) {
//           const productData = await altreationGetProductDetailsService(item, product.productId);
//             productDataArray.push(productData);
//           }
//         }
//       } else if(role === 'mastertailor' || role === 'stitching' || role === 'QC' || role === 'admin') {
//         for (const product of item.aligned) {
//           if (product && product.productId) {
//             const productData = await altreationGetProductDetailsService(item, product.productId);
//               productDataArray.push(productData);
//             }
//           }
//       }
//     }
//     return productDataArray;
//   } catch (error) {
//     console.error('Error:', error);
//     // Handle error appropriately
//     return [];
//   }
// };


/***** */

const altreationNotAssignedProductsforWorkers = async (orders, role) => {
  const productDataArray = [];
  try {
    for (const item of orders) {
      // console.log(JSON.stringify(item))
      if (role === 'mastertailor') {
        for (const product of item.notAssignedProductIds) {
          if (product && product.productId) {
            const altreationProductData = await altreationGetProductDetailsService(item, product.productId, product.measurementAlterationID);
            if (altreationProductData && altreationProductData.length > 0) {
              productDataArray.push(altreationProductData);
            }
          }
        }
      } else if (role === 'mastertailor' || role === 'stitching' || role === 'QC' || role === 'admin') {
        for (const product of item.aligned) {
           const alreadyAction =  item?.[`${role}Status`]?.some( productData => productData?.productId?._id?.toString() === product.productId?.toString());
          // console.log({product})
          if (product && product.productId && !alreadyAction) {
            const altreationProductData = await altreationGetProductDetailsService(item, product.productId, product.measurementAlterationID);
            if (altreationProductData && altreationProductData.length > 0) {
              productDataArray.push(altreationProductData);
            }
          }
        }
      }
    }
    return productDataArray;
  } catch (error) {
    console.error('Error:', error);
    // Handle error appropriately
    return [];
  }
};




/**********************readymade and product and accessory ***************/

// Function to generate a unique product number
const generateUniqueProductNumber = async () => {
  let number = 100;
  let isUnique = false;
  let productNumber = "";

  while (!isUnique) {
    productNumber = `P${number}`;
    const existingProduct = await AdminReadymadeProductForUser.findOne({ productNumber });
    
    if (!existingProduct) {
      isUnique = true;
    } else {
      number++; // Increment and try again
    }
  }

  return productNumber;
};


// Function to generate a unique accessorie number
const generateUniqueAccessorieNumber = async () => {
  let number = 100;
  let isUnique = false;
  let accessoriesNumber = "";

  while (!isUnique) {
    accessoriesNumber = `A${number}`;
    const existingAccessorie = await AdminReadymadeAccessoriesForUser.findOne({ accessoriesNumber });
    
    if (!existingAccessorie) {
      isUnique = true;
    } else {
      number++; // Increment and try again
    }
  }

  return accessoriesNumber;
};



/***************** fabric dash number  ********************/

// const createFabricDashNumber = async (storeId) => {
//   const store = await Stores.findById(storeId);
//   if (!store) throw new Error("Store not found");

//   // Fetch latest fabDashNumber for the store, sorted correctly
//   const latestFabric = await Fabrics.findOne({ storeId })
//     .sort({ createdAt: -1 }) // Get the most recently created document
//     .lean();

//   let nextNumber;
//   if (!latestFabric || !latestFabric.fabDashNumber) {
//     nextNumber = 100; // Start from 100 if no previous number exists
//   } else {
//     // Extract numeric part from fabDashNumber
//     const match = latestFabric.fabDashNumber.match(/F-DASH-\w+-(\d+)/);
//     const numericPart = match ? parseInt(match[1]) : 99; // Default to 99 if no match
//     nextNumber = numericPart + 1; // Increment sequentially
//   }

//   return `F-DASH-${store.storeNumber}-${nextNumber}`;
// };

/****** */

// async function createFabricDashNumber(storeId, fabricCount) {
//   console.log(`⏳ Fetching last fabDashNumber for store: ${storeId}`);

//   // Fetch the latest fabDashNumber for the given store
//   const lastFabric = await Fabrics.findOne({ storeId }).sort({ createdAt: -1 });

//   let lastNumber = 100; // Default starting number

//   if (lastFabric && lastFabric.fabDashNumber) {
//     const match = lastFabric.fabDashNumber.match(/(\d+)$/);
//     if (match) {
//       lastNumber = parseInt(match[1]);
//     }
//   }

//   console.log(`🔢 Last stored fabDashNumber: ${lastNumber}`);

//   const fabDashNumbers = [];
//   for (let i = 1; i <= fabricCount; i++) {
//     const newNumber = lastNumber + i;
//     const fabDashNumber = `F-DASH-C100-${newNumber}`;
//     fabDashNumbers.push(fabDashNumber);
//     console.log(`✅ Generated fabDashNumber for fabric ${i}: ${fabDashNumber}`);
//   }

//   return fabDashNumbers;
// }


// Helper function to generate the next fabric dash number sequentially
const createFabricDashNumber = async (latestdashNumber) => {
  let dashNumber;
  if (!latestdashNumber || !latestdashNumber.orderNumber) {
    dashNumber = 100;
  } else {
    if (latestdashNumber.dashNumber && latestdashNumber.dashNumber.includes('F-DASH')) {
      // Extract numeric part and increment
      const numericPart = parseInt(latestdashNumber.dashNumber.split('F-DASH')[1], 10);
      dashNumber = numericPart + 1;
    } else {
      dashNumber = parseInt(latestdashNumber.orderNumber, 10) + 1;
    }
  }
  return `F-DASH${dashNumber}`;
};




module.exports = {
  pushNotAssignedForCron,
  notAssignedProductsforWorkers,
  getNotAssignedMatchquery,
  createOrderNumber,


  onlineCustomersForSuperadmin,
  offlineCustomersForSuperadmin,

  //testing
  getNotAssigneddMatchquery,

  //
  altreationGetNotAssigneddMatchquery,
  altreationNotAssignedProductsforWorkers,


  generateUniqueProductNumber,
  generateUniqueAccessorieNumber,

  createFabricDashNumber
}





