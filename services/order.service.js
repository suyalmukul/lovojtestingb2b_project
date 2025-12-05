// orderService.js

const CustomerMesurment = require("../models/customerMesurment");
const CustomerProduct = require("../models/customerProduct");
const CustomerProductOnline = require("../models/customerProductB2C.model");
const QuickOrderStatus = require("../models/quickorderStatus.model");
const QuickOrderStatusOnline = require("../models/quickorderStatusB2C.model");
const WorkerLogs = require("../models/worker_cutter");
const AppError = require("../utils/errorHandler");
const { commonLoopkupPipelineService } = require("./common.service");
const { ObjectId } = require('mongodb');



const getProduct = async (targetOrder, productId, next) => {
  const products = await CustomerProduct.findById(targetOrder.productID) || await CustomerProductOnline.findById(targetOrder.productID);
  if (!products) return next(new AppError('Product not found.', '404'));

  const productObject = products.product.find(product => product._id.toString() === productId.toString());
  // console.log(productObject,".............", productId);

  // if (!productObject) return next(new AppError('Product not found with the specified productNumber', '404'));
  return productObject;
};

const getOrderTypeService = async (orderId) => {
  const offlineOrder = await QuickOrderStatus.findById(orderId);
  const onlineOrder = await QuickOrderStatusOnline.findById(orderId);

  if (offlineOrder) {
    return { targetOrder: offlineOrder, type: "Offline" };
  } else if (onlineOrder) {
    return { targetOrder: onlineOrder, type: "Online" };
  } else {
    return null; // Or you can throw an error here if necessary
  }
};

/*************************** My Order Process For Worker ***********************************/
/*******************************************************************************************/
/*******************************************************************************************/
const createWorkerLog = async (data) => {
  console.log(JSON.stringify(data), "data.......................")
  const workerLog = await WorkerLogs.findOne({
    customerId: data.targetOrder.customerID,
    workerId: data._id,
    productId: data.productId,
  });
console.log(JSON.stringify(workerLog), "workerLog..........................")
  if (workerLog) {
    if (workerLog.orderStatus == false && data.problemStatements) {
      if (data.role != 'cutter') {
        workerLog.workVideo = data.workVideo;
        workerLog.workPhoto = data.workPhoto;
      }
      workerLog.orderStatus = false;
      workerLog.problemStatements = data.problemStatements,
        workerLog.problem = true
      workerLog.save();
    } else {
      if (data.role != 'cutter') {
        workerLog.workVideo = data.workVideo;
        workerLog.workPhoto = data.workPhoto;
      }
      workerLog.orderStatus = true;
      workerLog.save();
    }
  } else {
    const savedWorker = await WorkerLogs.create({
      storeId: data.targetOrder.storeID,
      workerId: data._id,
      orderId: data.targetOrder._id,
      role: data.role,
      type: data.type,
      // orderStatus: problemStatements ? false : true,
      customerId: data.targetOrder.customerID,
      productId: data.productId,
      problem: data.problemStatements ? true : false,
      problemStatements: data.problemStatements ? data.problemStatements : [],
    });
  }
};

const updateStatus = async ({ targetOrder, role, _id, productId, status, problemStatements, name, type, workPhoto, workVideo }) => {
  const roleStatus = targetOrder[`${role}Status`];

  // Add the validation check here
  if (!Array.isArray(roleStatus)) {
    throw new Error(`Invalid order structure: ${role}Status is not defined`);
  }

  if (status === 'InProgress') {
    const statusIndex = targetOrder[`${role}Status`].findIndex((status) => status.productId.toString() === productId);
    if (statusIndex !== -1) {
      if (problemStatements) {
        targetOrder[`${role}Status`][statusIndex].problem = true;
        await createWorkerLog({ targetOrder, role, _id, productId, problemStatements, type, status, workPhoto, workVideo });
      } else {
        throw new Error('Product already in progress.');
      }
    } else {
      const obj = {
        workerId: _id,
        timmer: new Date().toISOString(),
        problemStatements,
        productId,
        workerName: name,
        status
      };

      const alignedObj = {
        alignedTo: role,
        alignedStatus: false,
        productId,
        workerName: name,
      };

      targetOrder[`${role}Status`].push(obj);
      const alignedIndex = targetOrder.aligned.findIndex((item) => item.productId.toString() === productId);
      if (alignedIndex !== -1) {
        console.log("hlwwwww")
        targetOrder.aligned[alignedIndex] = { ...alignedObj };
      } else {
        targetOrder[`aligned`].push(alignedObj);
      }
      // Remove productId from notAssignedProductIds
      targetOrder.notAssignedProductIds = targetOrder.notAssignedProductIds.filter(
        (item) => item.productId.toString() !== productId
      );
      await createWorkerLog({ targetOrder, role, _id, productId, problemStatements, type, status });
      // const targetProducIdIndex = targetOrder.notAssignedProductIds.findIndex((item) => item.productId.toString() === productId);
      // if (targetProducIdIndex !== -1) {
      //   targetOrder.aligned[targetProducIdIndex].alignedStatus = true;
      // }
    }
  } else {
    const targetOrderIndex = targetOrder[`${role}Status`].findIndex((item) => item.productId.toString() === productId);
    const alignedIndex = targetOrder.aligned.findIndex((item) => item.productId.toString() === productId);
    if (alignedIndex !== -1) {
      console.log("hlwwwww")
      targetOrder.aligned[alignedIndex].alignedStatus = true;
    }
    if (targetOrderIndex !== -1) {
      console.log("hiiiiiiiii")
      targetOrder[`${role}Status`][targetOrderIndex].status = 'Completed';
      //// Add timer1 when the status is marked as Completed
      targetOrder[`${role}Status`][targetOrderIndex].timmer1 = new Date().toISOString();
    }
  }
};

const checkAndUpdateStatus = async ({ targetOrder, role, _id, productId, status, problemStatements, name, type, workPhoto, workVideo }) => {
  if (status === 'Completed') await createWorkerLog({ targetOrder, role, _id, productId, problemStatements, type, status, workPhoto, workVideo });
  else if (status !== 'InProgress') throw new Error('Invalid Status');

  await updateStatus({ targetOrder, role, _id, productId, status, problemStatements, name, type, workPhoto, workVideo });
};


/*************************** My Order Process For Admin ***********************************/
/*******************************************************************************************/
/*******************************************************************************************/
/******* With Inprogress **********/
// const createAdminLog = async (data) => {

//   const workerLog = await WorkerLogs.findOne({
//     customerId: data.targetOrder.customerID,
//     workerId: data._id,
//     productId: data.productId,
//   });

//   if (workerLog) {
//     if (workerLog.orderStatus == false && data.problemStatements) {
//       if(data.role != 'cutter') {
//         workerLog.workVideo = data.workVideo;
//         workerLog.workPhoto = data.workPhoto;
//       }
//       workerLog.orderStatus = false;
//       workerLog.problemStatements = data.problemStatements,
//         workerLog.problem = true
//       workerLog.save();
//     } else {
//       if(data.role != 'cutter') {
//         workerLog.workVideo = data.workVideo;
//         workerLog.workPhoto = data.workPhoto;
//       }
//       workerLog.orderStatus = true;
//       workerLog.save();
//     }
//   } else {
//     const savedWorker = await WorkerLogs.create({
//       storeId: data.targetOrder.storeID,
//       workerId: data._id,
//       orderId: data.targetOrder._id,
//       role: data.role,
//       type: data.type,
//       // orderStatus: problemStatements ? false : true,
//       customerId: data.targetOrder.customerID,
//       productId: data.productId,
//       problem: data.problemStatements ? true : false,
//       problemStatements: data.problemStatements ? data.problemStatements : [],
//     });
//   }
// };


// const updateStatusAdmin = async ({ targetOrder, role, _id, productId, status, problemStatements, name, type, workPhoto, workVideo, editedRole }) => {
//   const roleStatus = targetOrder[`${role}Status`];

//   // Add the validation check here
//   if (!Array.isArray(roleStatus)) {
//     throw new Error(`Invalid order structure: ${role}Status is not defined`);
//   }

//   if (status === 'InProgress') {
//     const statusIndex = targetOrder[`${role}Status`].findIndex((status) => status.productId.toString() === productId);
//     if (statusIndex !== -1) {
//       if (problemStatements) {
//         targetOrder[`${role}Status`][statusIndex].problem = true;
//         targetOrder[`${role}Status`][statusIndex].editedRole = editedRole;  // Save editedRole here
//         await createAdminLog({ targetOrder, role, _id, productId, problemStatements, type, status, workPhoto, workVideo });
//       } else {
//         throw new Error('Product already in progress.');
//       }
//     } else {
//       const obj = {
//         workerId: _id,
//         timmer: new Date().toISOString(),
//         problemStatements,
//         productId,
//         workerName: name,
//         status,
//         editedRole // Save editedRole here
//       };

//       const alignedObj = {
//         alignedTo: role,
//         alignedStatus: false,
//         productId,
//         workerName: name,
//         editedRole // Save editedRole here
//       };

//       targetOrder[`${role}Status`].push(obj);
//       const alignedIndex = targetOrder.aligned.findIndex((item) => item.productId.toString() === productId);
//       if (alignedIndex !== -1) {
//         targetOrder.aligned[alignedIndex] = { ...alignedObj };
//       } else {
//         targetOrder[`aligned`].push(alignedObj);
//       }

//       targetOrder.notAssignedProductIds = targetOrder.notAssignedProductIds.filter(
//         (item) => item.productId.toString() !== productId
//       );

//       await createAdminLog({ targetOrder, role, _id, productId, problemStatements, type, status });
//     }
//   } else {
//     const targetOrderIndex = targetOrder[`${role}Status`].findIndex((item) => item.productId.toString() === productId);
//     const alignedIndex = targetOrder.aligned.findIndex((item) => item.productId.toString() === productId);
//     if (alignedIndex !== -1) {
//       targetOrder.aligned[alignedIndex].alignedStatus = true;
//     }
//     if (targetOrderIndex !== -1) {
//       targetOrder[`${role}Status`][targetOrderIndex].status = 'Completed';
//       targetOrder[`${role}Status`][targetOrderIndex].timmer1 = new Date().toISOString();
//       targetOrder[`${role}Status`][targetOrderIndex].editedRole = editedRole;  // Save editedRole here
//     }
//   }
// };


// const checkAndUpdateStatusAdmin = async ({ targetOrder, role,editedRole, _id, productId, status, problemStatements, name, type, workPhoto, workVideo }) => {
//   if (status === 'Completed') await createAdminLog({targetOrder, role,editedRole, _id, productId, problemStatements, type, status, workPhoto, workVideo});
//   else if (status !== 'InProgress') throw new Error('Invalid Status');

//   await updateStatusAdmin({targetOrder, role,editedRole, _id, productId, status, problemStatements, name, type, workPhoto, workVideo});
// };


/******* Only Completed **********/
const createAdminLog = async (data) => {
  const workerLog = await WorkerLogs.findOne({
    customerId: data.targetOrder.customerID,
    workerId: data._id,
    productId: data.productId,
  });

  if (workerLog) {
    if (workerLog.orderStatus == false && data.problemStatements) {
      if (data.role != 'cutter') {
        workerLog.workVideo = data.workVideo;
        workerLog.workPhoto = data.workPhoto;
      }
      workerLog.orderStatus = false;
      workerLog.problemStatements = data.problemStatements;
      workerLog.problem = true;
      await workerLog.save();
    } else {
      if (data.role != 'cutter') {
        workerLog.workVideo = data.workVideo;
        workerLog.workPhoto = data.workPhoto;
      }
      workerLog.orderStatus = true;
      await workerLog.save();
    }
  } else {
    await WorkerLogs.create({
      storeId: data.targetOrder.storeID,
      workerId: data._id,
      orderId: data.targetOrder._id,
      role: data.role,
      type: data.type,
      customerId: data.targetOrder.customerID,
      productId: data.productId,
      problem: data.problemStatements ? true : false,
      problemStatements: data.problemStatements ? data.problemStatements : [],
    });
  }
};

const updateStatusAdmin = async ({ targetOrder, role, _id, productId, status, problemStatements, name, type, workPhoto, workVideo, editedRole }) => {
  const roleStatus = targetOrder[`${role}Status`];

  if (!Array.isArray(roleStatus)) {
    throw new Error(`Invalid order structure: ${role}Status is not defined`);
  }

  const targetOrderIndex = targetOrder[`${role}Status`].findIndex((item) => item.productId.toString() === productId);
  const alignedIndex = targetOrder.aligned.findIndex((item) => item.productId.toString() === productId);

  // Update logic for handling "Completed" status
  if (status === 'Completed') {
    if (alignedIndex !== -1) {
      targetOrder.aligned[alignedIndex].alignedStatus = true;
    }
    if (targetOrderIndex !== -1) {
      targetOrder[`${role}Status`][targetOrderIndex].status = 'Completed';
      targetOrder[`${role}Status`][targetOrderIndex].timmer1 = new Date().toISOString();
      targetOrder[`${role}Status`][targetOrderIndex].editedRole = editedRole;  // Save editedRole here
    } else {
      const obj = {
        workerId: _id,
        timmer: new Date().toISOString(),
        problemStatements,
        productId,
        workerName: name,
        status,
        editedRole // Save editedRole here
      };

      const alignedObj = {
        alignedTo: role,
        alignedStatus: true,
        productId,
        workerName: name,
        editedRole // Save editedRole here
      };

      targetOrder[`${role}Status`].push(obj);
      if (alignedIndex !== -1) {
        targetOrder.aligned[alignedIndex] = { ...alignedObj };
      } else {
        targetOrder.aligned.push(alignedObj);
      }

      targetOrder.notAssignedProductIds = targetOrder.notAssignedProductIds.filter(
        (item) => item.productId.toString() !== productId
      );
    }
  } else if (problemStatements) {
    // Handle case with problem statements
    const statusIndex = targetOrder[`${role}Status`].findIndex((status) => status.productId.toString() === productId);
    if (statusIndex !== -1) {
      targetOrder[`${role}Status`][statusIndex].problem = true;
      targetOrder[`${role}Status`][statusIndex].editedRole = editedRole;  // Save editedRole here
      await createAdminLog({ targetOrder, role, _id, productId, problemStatements, type, status, workPhoto, workVideo });
    }
  }
};

const checkAndUpdateStatusAdmin = async ({ targetOrder, role, editedRole, _id, productId, status, problemStatements, name, type, workPhoto, workVideo }) => {
  if (status === 'Completed') {
    await createAdminLog({ targetOrder, role, editedRole, _id, productId, problemStatements, type, status, workPhoto, workVideo });
  } else {
    throw new Error('Invalid Status');
  }

  await updateStatusAdmin({ targetOrder, role, editedRole, _id, productId, status, problemStatements, name, type, workPhoto, workVideo });
};

/*******************************************************************************************/
/*******************************************************************************************/
/*******************************************************************************************/


// const getProductDetailsService = async (targetOrder, productId) => {
//   const projectionFields = { measurementData: '$measurementData', productData: '$productData', contrastData: '$contrastData', specialInstructionData: '$specialInstructionData', billingData: '$billingData', orderInfo: '$quickOrderStatus', customerData: '$customerData' }
//   if (targetOrder && targetOrder.markedStatus) {
//     let dynamicAddFields = {
//       quickOrderStatus: {
//         _id: '$_id',
//         storeID: '$storeID',
//         orderNumber: '$orderNumber',
//         status: '$status',
//         markedStatus: '$markedStatus',
//         customerID: '$customerID',
//         aligned: '$aligned',
//         notAssignedProductIds: '$notAssignedProductIds',
//         cutterStatus: '$cutterStatus',
//         mastertailorStatus: '$mastertailorStatus',
//         stitchingStatus: '$stitchingStatus',
//         QCStatus: '$QCStatus',
//         // deliveryStatus:'$deliveryStatus'
//         stylishStatus: '$stylishStatus'
//       },
//     };

//     const lookupKeywords = ['customermesurments', 'customerproducts', 'customercontrasts', 'customerspacialinstructions', 'customerinvoices', 'offlinecustomerb2cs'];

//     const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder._id }, {}, projectionFields, dynamicAddFields)

//     console.log(pipeline, "pipeline............")

//     const products = await QuickOrderStatus.aggregate(pipeline);
//     console.log(products);
//     const dataArray = extractData(products, productId);


//     return dataArray;

//   } else {
//     let dynamicAddFields = {
//       quickOrderStatus: {
//         _id: '$_id',
//         storeID: '$storeID',
//         orderNumber: '$orderNumber',
//         status: '$status',
//         customerID: '$customerID',
//         aligned: '$aligned',
//         notAssignedProductIds: '$notAssignedProductIds',
//         cutterStatus: '$cutterStatus',
//         mastertailorStatus: '$mastertailorStatus',
//         stitchingStatus: '$stitchingStatus',
//         QCStatus: '$QCStatus',
//         // deliveryStatus:'$deliveryStatus'
//         stylishStatus: '$stylishStatus'
//       },
//     };
//     const lookupKeywords = ['customerproductonlines', 'customermesurmentonlines', 'customercontrastonlines', 'customersplinstructiononlines', 'customerinvoiceonlines', 'onlinecustomers'];
//     // console.log(targetOrder, ".....targetOrder")
//     const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder._id }, {}, projectionFields, dynamicAddFields)
//     // console.log(pipeline)
//     const products = await QuickOrderStatusOnline.aggregate(pipeline)
//     // console.log(products)
//     const dataArray = extractData(products, productId);

//     return dataArray;
//   }
// };

// const extractData = (products, productId) => {
//   console.log("Extracting data for productId:", productId);
//   console.log("Products received:", JSON.stringify(products, null, 2));

//   const productData = products[0]?.productData[0]?.product.find(product => product?._id.toString() === productId.toString());
//   const measurementData = products[0]?.measurementData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const specialInstructionData = products[0]?.specialInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const contrastsData = products[0]?.contrastData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const billingData = products[0]?.billingData[0];
//   const customerData = products[0]?.customerData;
//   let orderInfo = products[0]?.orderInfo

//   console.log("Extracted productData:", JSON.stringify(productData, null, 2));
//   console.log("Extracted measurementData:", JSON.stringify(measurementData, null, 2));

//   if (!productData) {
//     console.log("No productData found, returning an empty array.");
//     return [];
//   }

//   const dataArray = [
//     productData !== undefined ? { productData } : { productData: {} },
//     measurementData !== undefined ? { measurementData } : { measurementData: {} },
//     contrastsData !== undefined ? { contrastsData } : { contrastsData: {} },
//     specialInstructionData !== undefined ? { specialInstructionData } : { specialInstructionData: {} },
//     billingData !== undefined ? { billingData } : { billingData: {} },
//     customerData !== undefined ? { customerData } : { customerData: {} },
//     orderInfo !== undefined ? { orderInfo } : { orderInfo: {} },
//   ];

//   return dataArray;
// }; 


const getProductDetailsService = async (targetOrder, productId, flag) => {
  const projectionFields = { measurementData: '$measurementData',  measurementAlterationData: '$measurementAlterationData', productData: '$productData', contrastData: '$contrastData', specialInstructionData: '$specialInstructionData', specialAlterationInstructionData: '$specialAlterationInstructionData', billingData: '$billingData', orderInfo: '$quickOrderStatus', customerData: '$customerData',altreationProductData:'$altreationProductData'}
  if (targetOrder && targetOrder.markedStatus) {
    let dynamicAddFields = {
      quickOrderStatus: {
        _id: '$_id',
        storeID: '$storeID',
        orderNumber: '$orderNumber',
        status: '$status',
        markedStatus: '$markedStatus',
        customerID: '$customerID',
        aligned: '$aligned',
        notAssignedProductIds: '$notAssignedProductIds',
        cutterStatus: '$cutterStatus',
        mastertailorStatus: '$mastertailorStatus',
        stitchingStatus: '$stitchingStatus',
        QCStatus: '$QCStatus',
        // deliveryStatus:'$deliveryStatus'
        stylishStatus: '$stylishStatus'
      },
    };

    const lookupKeywords = ['customermesurments', 'customermesurmentalterations', 'customerproducts', 'customercontrasts', 'customerspacialinstructions', 'customerspacialinstructionaltreations', 'customerinvoices', 'offlinecustomerb2cs', 'customerproductalterations']

    const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder?._id }, {}, projectionFields, dynamicAddFields)
    // console.log(JSON.stringify(pipeline))

    // console.log(pipeline, "pipeline............")
    const products = await QuickOrderStatus.aggregate(pipeline);
    // console.log(JSON.stringify(products[0].productData), "products[0].productData)...........................................................................")
    // console.log(JSON.stringify(products[0].altreationProductData), "products[0].altreationProductData................................")
    // console.log(JSON.stringify(products[0]), "products[0]................................")

    
    // console.log(products[0]?.productData?.length, products[0]?.altreationProductData?.length, "length................................................................................")

    // console.log(JSON.stringify(products), "...........................................................")
    // console.log(flag, "flag..............................")
   let dataArray = flag
  ? extractData(products, productId)
  : altreationExtractData(products, productId);

    // console.log(JSON.stringify(dataArray), "dataArray.............................")
    return dataArray;

  } else {
    let dynamicAddFields = {
      quickOrderStatus: {
        _id: '$_id',
        storeID: '$storeID',
        orderNumber: '$orderNumber',
        status: '$status',
        customerID: '$customerID',
        aligned: '$aligned',
        notAssignedProductIds: '$notAssignedProductIds',
        cutterStatus: '$cutterStatus',
        mastertailorStatus: '$mastertailorStatus',
        stitchingStatus: '$stitchingStatus',
        QCStatus: '$QCStatus',
        // deliveryStatus:'$deliveryStatus'
        stylishStatus: '$stylishStatus'
      },
    };
    const lookupKeywords = ['customerproductonlines', 'customermesurmentonlines', 'customercontrastonlines', 'customersplinstructiononlines', 'customerinvoiceonlines', 'onlinecustomers'];
    // console.log(targetOrder, ".....targetOrder")
    const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder?._id }, {}, projectionFields, dynamicAddFields)
    // console.log(pipeline)
    // const products = await QuickOrderStatusOnline.aggregate(pipeline)
    const products = await QuickOrderStatus.aggregate(pipeline)
    // console.log(products)
    const dataArray = extractData(products, productId);

    return dataArray;
  }
};

const extractData = (products, productId) => {
  // console.log("Extracting data for productId:", productId);
  // console.log("Products received:", JSON.stringify(products, null, 2));

  const productData = products[0]?.productData[0]?.product.find(product => product?._id.toString() === productId.toString());
  // console.log(JSON.stringify(productData))
  // const alterationProductData = products[0]?.altreationProductData[0]?.product.find(product => product?._id.toString() === productId.toString());
  // const measurementAlterationData = products[0]?.measurementAlterationData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  // console.log(JSON.stringify(alterationProductData), "alterationProductData..................")
  const measurementData = products[0]?.measurementData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  const specialInstructionData = products[0]?.specialInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  // const specialAlterationInstructionData = products[0]?.specialAlterationInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());

  const contrastsData = products[0]?.contrastData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  const billingData = products[0]?.billingData[0];
  const customerData = products[0]?.customerData;
  let orderInfo = products[0]?.orderInfo

  // console.log("Extracted productData:", JSON.stringify(productData, null, 2));
  // console.log("Extracted measurementData:", JSON.stringify(measurementData, null, 2));

  if (!productData) {
    console.log("No productData found, returning an empty array.");
    return [];
  }

  const dataArray = [
    productData !== undefined ? { productData } : { productData: {} },
    // alterationProductData !== undefined ? { alterationProductData } : { alterationProductData: {} },
    measurementData !== undefined ? { measurementData } : { measurementData: {} },
    // measurementAlterationData !== undefined ? { measurementAlterationData } : { measurementAlterationData: {} },
    contrastsData !== undefined ? { contrastsData } : { contrastsData: {} },
    specialInstructionData !== undefined ? { specialInstructionData } : { specialInstructionData: {} },
    // specialAlterationInstructionData !== undefined ? { specialAlterationInstructionData } : { specialAlterationInstructionData: {} },
    billingData !== undefined ? { billingData } : { billingData: {} },
    customerData !== undefined ? { customerData } : { customerData: {} },
    orderInfo !== undefined ? { orderInfo } : { orderInfo: {} },
  ];

  // console.log(dataArray, 'dataArray.............')

  return dataArray;
};


const calculateQcCheckAllPercentages = (qcLog) => {
  const calculatePercentage = (array) => {
    if (!array || array.length === 0) return 'N/A';
    const total = array.length;
    const passed = array.filter(item => item.qcCheck === true).length;
    return ((passed / total) * 100).toFixed(2) + '%';
  };

  const stylesPercentage = calculatePercentage(qcLog.styles);
  const measurementsPercentage = calculatePercentage(qcLog.mesurments);
  const contrastStylesPercentage = calculatePercentage(qcLog.contrastStyles);

  const totalChecks = qcLog.styles.length + qcLog.mesurments.length + qcLog.contrastStyles.length;
  const totalPassedChecks = qcLog.styles.filter(item => item.qcCheck === true).length +
    qcLog.mesurments.filter(item => item.qcCheck === true).length +
    qcLog.contrastStyles.filter(item => item.qcCheck === true).length;
  const overallPercentage = ((totalPassedChecks / totalChecks) * 100).toFixed(2) + '%';

  return {
    stylesPercentage,
    measurementsPercentage,
    contrastStylesPercentage,
    overallPercentage
  };
};

const findRealignedProductsService = async (role, query, Model) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  try {
    const results = await Model.aggregate([
      { $unwind: "$reAligned" },  // Deconstruct the reAligned array
      {
        $match: {
          "reAligned.reAlignedStatus": true,
          "reAligned.reAlignedTo": role
        }
      },  // Filter for reAlignedStatus being true and reAlignedTo being mastertailor
      {
        $group: {  // Group back by _id and include other fields
          _id: "$_id",
          document: { $first: "$$ROOT" },  // Save the entire document
          reAligned: { $push: "$reAligned" }  // Accumulate filtered reAligned entries
        }
      },
      {
        $addFields: {  // Replace the reAligned field with the filtered array
          "document.reAligned": "$reAligned"
        }
      },
      {
        $replaceRoot: { newRoot: "$document" }  // Replace the root with the document
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
    return results;
  } catch (error) {
    console.error('Error in aggregation:', error);
  }
};



// ///altreationnnnnnn////////
// const altreationGetProductDetailsService = async (targetOrder, productId) => {
//   const projectionFields = { measurementData: '$measurementData', productData: '$productData', contrastData: '$contrastData', specialInstructionData: '$specialInstructionData', billingData: '$billingData', orderInfo: '$quickOrderStatus', customerData: '$customerData',altreationProductData: '$altreationProductData',altreationMeasurementData :'$altreationMeasurementData',altreationSpecialInstructionData: '$altreationSpecialInstructionData'}
//   if (targetOrder && targetOrder.markedStatus) {
//     let dynamicAddFields = {
//       quickOrderStatus: {
//         _id: '$_id',
//         storeID: '$storeID',
//         orderNumber: '$orderNumber',
//         status: '$status',
//         markedStatus: '$markedStatus',
//         customerID: '$customerID',
//         aligned: '$aligned',
//         notAssignedProductIds: '$notAssignedProductIds',
//         cutterStatus: '$cutterStatus',
//         mastertailorStatus: '$mastertailorStatus',
//         stitchingStatus: '$stitchingStatus',
//         QCStatus:'$QCStatus',
//         // deliveryStatus:'$deliveryStatus'
//         stylishStatus:'$stylishStatus'
//       },
//     };

//     const lookupKeywords = ['customermesurments', 'customerproducts', 'customercontrasts', 'customerspacialinstructions', 'customerinvoices', 'offlinecustomerb2cs','customerproductalterations','customermesurmentalterations','customerspacialinstructionaltreations'];

//     const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder._id }, {}, projectionFields, dynamicAddFields)

//     const products = await QuickOrderStatus.aggregate(pipeline);
//     console.log(products);
//     const dataArray = altreationExtractData(products, productId);


//     return dataArray;

//   } else {
//     let dynamicAddFields = {
//       quickOrderStatus: {
//         _id: '$_id',
//         storeID: '$storeID',
//         orderNumber: '$orderNumber',
//         status: '$status',
//         customerID: '$customerID',
//         aligned: '$aligned',
//         notAssignedProductIds: '$notAssignedProductIds',
//         cutterStatus: '$cutterStatus',
//         mastertailorStatus: '$mastertailorStatus',
//         stitchingStatus: '$stitchingStatus',
//         QCStatus:'$QCStatus',
//         // deliveryStatus:'$deliveryStatus'
//         stylishStatus:'$stylishStatus'
//       },
//     };
//     const lookupKeywords = ['customerproductonlines', 'customermesurmentonlines', 'customercontrastonlines', 'customersplinstructiononlines', 'customerinvoiceonlines', 'onlinecustomers','customerproductalterations','customermesurmentalterations','customerspacialinstructionaltreations'];
//     // console.log(targetOrder, ".....targetOrder")
//     const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder._id }, {}, projectionFields, dynamicAddFields)
//     // console.log(pipeline)
//     const products = await QuickOrderStatusOnline.aggregate(pipeline)
//     // console.log(products)
//     const dataArray = altreationExtractData(products, productId);

//     return dataArray;
//   }
// };

// const altreationExtractData = (products, productId) => {
//   console.log("Extracting data for productId:", productId);
//   console.log("Products received:", JSON.stringify(products, null, 2));

//   const productData = products[0]?.productData[0]?.product.find(product => product?._id.toString() === productId.toString());
//   const measurementData = products[0]?.measurementData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const specialInstructionData = products[0]?.specialInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const contrastsData = products[0]?.contrastData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const billingData = products[0]?.billingData[0];
//   const customerData = products[0]?.customerData;
//   let orderInfo = products[0]?.orderInfo
//   const altreationProductData = products[0]?.altreationProductData[0]?.product.find(product => product?._id.toString() === productId.toString());
//   const altreationMeasurementData = products[0]?.altreationMeasurementData[0]?.products.find(product => product?.productId.toString() === productId.toString());
//   const altreationSpecialInstructionData = products[0]?.altreationSpecialInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());

//   console.log("Extracted productData:", JSON.stringify(productData, null, 2));
//   console.log("Extracted measurementData:", JSON.stringify(measurementData, null, 2));

//   const dataArray = [
//     productData !== undefined ? { productData } : { productData: {} },
//     measurementData !== undefined ? { measurementData } : { measurementData: {} },
//     contrastsData !== undefined ? { contrastsData } : { contrastsData: {} },
//     specialInstructionData !== undefined ? { specialInstructionData } : { specialInstructionData : {} },
//     altreationProductData !== undefined ? { altreationProductData } : { altreationProductData: {} },
//     altreationMeasurementData !== undefined ? { altreationMeasurementData } : { altreationMeasurementData: {} },
//     altreationSpecialInstructionData !== undefined ? { altreationSpecialInstructionData } : { altreationSpecialInstructionData : {} },

//     billingData !== undefined ? { billingData } : { billingData : {} },
//     customerData !== undefined ? { customerData } : { customerData : {} },
//     orderInfo !== undefined ? { orderInfo } : { orderInfo : {} },
//   ];

//   return dataArray;
// };

const altreationGetProductDetailsService = async (targetOrder, productId, measurementAlterationID) => {
  const projectionFields = {
    measurementData: '$measurementData',
    productData: '$productData',
    contrastData: '$contrastData',
    specialInstructionData: '$specialInstructionData',
    billingData: '$billingData',
    orderInfo: '$quickOrderStatus',
    customerData: '$customerData',
    altreationProductData: '$altreationProductData',
    measurementAlterationData: '$measurementAlterationData',
    specialAlterationInstructionData: '$specialAlterationInstructionData',
  };

  if (targetOrder && targetOrder.markedStatus) {
    // console.log("Processing QuickOrderStatus with markedStatus");

    let dynamicAddFields = {
      quickOrderStatus: {
        _id: '$_id',
        storeID: '$storeID',
        orderNumber: '$orderNumber',
        status: '$status',
        markedStatus: '$markedStatus',
        customerID: '$customerID',
        aligned: '$aligned',
        notAssignedProductIds: '$notAssignedProductIds',
        cutterStatus: '$cutterStatus',
        mastertailorStatus: '$mastertailorStatus',
        stitchingStatus: '$stitchingStatus',
        QCStatus: '$QCStatus',
        stylishStatus: '$stylishStatus',
        ProductAlterationID: '$ProductAlterationID',
      },
    };

    const lookupKeywords = ['customermesurments', 'customerproducts', 'customercontrasts', 'customerspacialinstructions', 'customerinvoices', 'offlinecustomerb2cs', 'customerproductalterations', 'customermesurmentalterations', 'customerspacialinstructionaltreations'];
    const { pipeline } = commonLoopkupPipelineService(lookupKeywords, { _id: targetOrder._id }, {}, projectionFields, dynamicAddFields);
    console.log(JSON.stringify(pipeline))
    const products = await QuickOrderStatus.aggregate(pipeline);
    console.log(JSON.stringify(products))
    if (!products || products.length === 0) {
      console.log("No products found for the given target order.");
      return { success: false, message: "No products found for the given order." };
    }

    return altreationExtractData(products, productId);

  }
};

const altreationExtractData = (products, productId) => {


  // const productData = products[0]?.productData[0]?.product.find(product => product?._id.toString() === productId.toString());
  // const measurementData = products[0]?.measurementData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  // const specialInstructionData = products[0]?.specialInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());

  const altreationProductData = products[0]?.altreationProductData[0]?.product.find(product => product?._id.toString() === productId.toString());
  // console.log("Matching product in altreationProductData:", products[0]?.altreationProductData[0]?.product);
  const altreationMeasurementData = products[0]?.measurementAlterationData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  // console.log( productId, "prodcuts many ",alterationprod)
  // console.log("***********altrearionnnnnn measurment**************",altreationMeasurementData)
  // console.log("***********altrearionnnnnn measurment**************",products[0]?.altreationMeasurementData[0])
  // console.log("***********altrearionnnnnn measurment**************",products[0])
  const altreationSpecialInstructionData = products[0]?.specialAlterationInstructionData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  const contrastsData = products[0]?.contrastData[0]?.products.find(product => product?.productId.toString() === productId.toString());
  const billingData = products[0]?.billingData[0];
  const customerData = products[0]?.customerData;
  const orderInfo = products[0]?.orderInfo;
  console.log("Extracted data:", {
    // productData,
    // measurementData,
    // contrastsData,
    // specialInstructionData,
    // altreationProductData
  });

  if (!altreationProductData) {

    console.log("No productData found, returning an empty array.");
    return [];
  }

  const dataArray = [
    // { productData: productData || {} },
    // { measurementData: measurementData || {} },
    // { contrastsData: contrastsData || {} },
    // { specialInstructionData: specialInstructionData || {} },
    { altreationProductData: altreationProductData || {} },

    { altreationMeasurementData: altreationMeasurementData || {} },
    { altreationSpecialInstructionData: altreationSpecialInstructionData || {} },

    { billingData: billingData || {} },
    { customerData: customerData || {} },
    { orderInfo: orderInfo || {} }
  ];
  // console.log(dataArray, 'dataArray.....................')
  return dataArray;
};


/********************* New Order Number ********************/


const createOrderNumber = async (latestOrder) => {
  let orderNumber;
  if (!latestOrder || !latestOrder.orderNumber) {
    orderNumber = 100;
  } else {
    if (latestOrder.orderNumber.includes('/')) {
      const numericPart = parseInt(latestOrder.orderNumber.split('/')[1]); 
      orderNumber = numericPart + 1;
    } else {
      orderNumber = parseInt(latestOrder.orderNumber) + 1; 
    }
  }
  return `ORD${orderNumber}`;
};




module.exports = {
  getProduct, checkAndUpdateStatus, checkAndUpdateStatusAdmin, getProductDetailsService, extractData,
  getOrderTypeService, calculateQcCheckAllPercentages, findRealignedProductsService,
  altreationGetProductDetailsService, altreationExtractData,createOrderNumber
};




