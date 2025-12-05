const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendingEmail } = require("../utils/sendingEmail");
const Workers = require("../models/Worker.model");
const uploadToS3 = require("../utils/s3Upload");
const deleteFromS3 = require("../utils/deleteFroms3");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const AppError = require("../utils/errorHandler");

const Product = require('../models/Product');
const Style = require('../models/Style');
const Contrast = require('../models/Contrast');
const Measurement = require('../models/Measurement');
const WorkerStatus = require("../models/worker_status");
const QuickOrderStatus = require("../models/quickorderStatus.model");

const CommonServices = require("../services/common.service");
const OthersService = require("../services/others.service");
const ProductMapping = require("../models/ProductMapping.model");
/********************************* Worker Signup **************************************/

// exports.roleSignUp = catchAsyncError(async (req, res, next) => {
//   const { email, password, role ,name } = req.body;
//   const storeNumber = req.user.storeNumber;
//   const storeType = req.user.storeType;

//   // Check if the storeNumber, storeType, email, password, and role are provided
//   if (!email || !password || !role || !name) {
//     return next(new AppError("email, password, and role are required.", 400));
//   }

//   // Check if the storeNumber is present in the User collection
//   let store = await User.findOne({ storeNumber });
//   if (!store) {
//     return next(new AppError("Store not found.", 404));
//   }

//   // Check if the email is already registered for the same storeNumber
//   const existingWorkerForStore = await Workers.findOne({ email, storeNumber });
//   if (existingWorkerForStore) {
//     return next(new AppError("Email already registered for this store.", 400));
//   }

//   let newProfileImage = null;

//   if (req.files && req.files.workerProfileImage && req.files.workerProfileImage.length > 0) {
//     const addingWorkerProfileImage = req.files.workerProfileImage[0];
//     newProfileImage = await uploadToS3(addingWorkerProfileImage);
//   }

//   const worker = await Workers.create({
//     storeNumber: storeNumber,
//     password: password,
//     storeType: storeType,
//     name,
//     email,
//     role,
//     workerProfileImage: newProfileImage,
//   });

//   if (worker) {
//     sendingEmail(
//       email,
//       "Welcome to our Team",
//       `Your account for store ${storeNumber} has been registered successfully.\n\n Your Store Number: ${storeNumber}\n Your Password: ${password}`
//     );
//   }

//   res.status(200).json({
//     success: true,
//     message: `Registered successfully for role ${role}`,
//     worker,
//   });
// });

/************ */


exports.roleSignUp = catchAsyncError(async (req, res, next) => {
  try {

    // Retrieve user and storeId from the authenticated user
    const user = req.user;

    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }
    const { storeId } = user;
    console.log("storeId", storeId)

    const { email, password, role, name, joiningDate, salary, address } = req.body;
    let { location } = req.body
    if(location){
      location=location.toLocaleLowerCase();
    }
    const storeNumber = req.user.storeNumber;
    const storeType = req.user.storeType;

    if (!email || !password || !role || !name) {
      return next(new AppError("Email, password, and role are required.", 400));
    }

    // const store = await User.findOne({ storeNumber });
    // if (!store) {
    //   return next(new AppError("Store not found.", 404));
    // }

    const store = await User.findOne({ storeId, storeNumber });
    if (!store) {
      return next(new AppError("Store not found.", 404));
    }

    // Check if the email is already registered for the same storeNumber
    const existingWorkerForStore = await Workers.findOne({ email, storeNumber });
    if (existingWorkerForStore) {
      return next(new AppError("Email already registered for this store.", 400));
    }

    let newProfileImage = null;
    let aadharCardFront = null;
    let aadharCardBack = null;
    let panCardFront = null;
    let employmentDocumentPdf1 = null;
    let employmentDocumentPdf2 = null;
    let otherDocument1 = null;
    let otherDocument2 = null;

    if (req.files) {
      // Check and upload workerProfileImage
      if (req.files.workerProfileImage && req.files.workerProfileImage.length > 0) {
        newProfileImage = await uploadToS3(req.files.workerProfileImage[0]);
      }

      // Check and upload aadharCardFront
      if (req.files.aadharCardFront && req.files.aadharCardFront.length > 0) {
        aadharCardFront = await uploadToS3(req.files.aadharCardFront[0]);
      }

      // Check and upload aadharCardBack
      if (req.files.aadharCardBack && req.files.aadharCardBack.length > 0) {
        aadharCardBack = await uploadToS3(req.files.aadharCardBack[0]);
      }

      // Check and upload panCardFront
      if (req.files.panCardFront && req.files.panCardFront.length > 0) {
        panCardFront = await uploadToS3(req.files.panCardFront[0]);
      }

      // Check and upload employmentDocumentPdf1
      if (req.files.employmentDocumentPdf1 && req.files.employmentDocumentPdf1.length > 0) {
        employmentDocumentPdf1 = await uploadToS3(req.files.employmentDocumentPdf1[0]);
      }

      // Check and upload employmentDocumentPdf2
      if (req.files.employmentDocumentPdf2 && req.files.employmentDocumentPdf2.length > 0) {
        employmentDocumentPdf2 = await uploadToS3(req.files.employmentDocumentPdf2[0]);
      }

      // Check and upload otherDocument1
      if (req.files.otherDocument1 && req.files.otherDocument1.length > 0) {
        otherDocument1 = await uploadToS3(req.files.otherDocument1[0]);
      }

      // Check and upload otherDocument2
      if (req.files.otherDocument2 && req.files.otherDocument2.length > 0) {
        otherDocument2 = await uploadToS3(req.files.otherDocument2[0]);
      }
    }

    const worker = await Workers.create({
      storeId: storeId,
      storeNumber: storeNumber,
      password: password,
      storeType: storeType,
      name,
      email,
      role,
      joiningDate,
      salary,
      address,
      workerProfileImage: newProfileImage,
      aadharCardFront,
      aadharCardBack,
      panCardFront,
      employmentDocumentPdf1,
      employmentDocumentPdf2,
      otherDocument1,
      otherDocument2,
      location
    });

    if (worker) {
      sendingEmail(
        email,
        "Welcome to our Team",
        `Your account for store ${storeNumber} has been registered successfully.\n\nHere is your account details \n\nEmail: ${email}\nPassword: ${password}\nStore Number: ${storeNumber}\nRole: ${role}`
      );
    }

    res.status(200).json({
      success: true,
      message: `Registered successfully for role ${role}`,
      worker,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



/*************************************** Get Worker **************************************/


exports.getWorkers = catchAsyncError(async (req, res) => {
  const workers = await Workers.find({ storeNumber: req.user.storeNumber });
  if (!workers) {
    return next(new AppError("No workers found", 404));
  }
  res.status(200).json({
    success: true,
    message: "List of your store workers",
    count: workers.length,
    workers: workers,
  });
});


/*************************************  Delete Worker ************************************/


exports.deteleWorker = catchAsyncError(async (req, res) => {
  const workers = await Workers.findByIdAndDelete({ _id: req.params.id });
  if (!workers) {
    return next(new AppError("workers not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
  });
});


/************************************* Update Worker ************************************/

exports.updateWorkerProfile = catchAsyncError(async (req, res, next) => {
  try {
    const { email, password, role, name, joiningDate, salary, address,location } = req.body;
    const storeNumber = req.user.storeNumber;
    const storeType = req.user.storeType;
    const workerId = req.params.id;

    // if (!email || !role || !name) {
    //   return next(new AppError("Email, role, and name are required.", 400));
    // }

    // if (!email || !role) {
    //   return next(new AppError("Email, role, and name are required.", 400));
    // }

    const store = await User.findOne({ storeNumber });
    if (!store) {
      return next(new AppError("Store not found.", 404));
    }

    const existingWorker = await Workers.findById(workerId);
    if (!existingWorker) {
      return next(new AppError("Worker not found.", 404));
    }

    let updatedProfileImage = existingWorker.workerProfileImage;
    let updatedAadharCardFront = existingWorker.aadharCardFront;
    let updatedAadharCardBack = existingWorker.aadharCardBack;
    let updatedPanCardFront = existingWorker.panCardFront;
    let updatedEmploymentDocumentPdf1 = existingWorker.employmentDocumentPdf1;
    let updatedEmploymentDocumentPdf2 = existingWorker.employmentDocumentPdf2;
    let updatedOtherDocument1 = existingWorker.otherDocument1;
    let updatedOtherDocument2 = existingWorker.otherDocument2;

    if (req.files) {
      if (req.files.workerProfileImage && req.files.workerProfileImage.length > 0) {
        updatedProfileImage = await uploadToS3(req.files.workerProfileImage[0]);
      }

      if (req.files.aadharCardFront && req.files.aadharCardFront.length > 0) {
        updatedAadharCardFront = await uploadToS3(req.files.aadharCardFront[0]);
      }

      if (req.files.aadharCardBack && req.files.aadharCardBack.length > 0) {
        updatedAadharCardBack = await uploadToS3(req.files.aadharCardBack[0]);
      }

      if (req.files.panCardFront && req.files.panCardFront.length > 0) {
        updatedPanCardFront = await uploadToS3(req.files.panCardFront[0]);
      }

      if (req.files.employmentDocumentPdf1 && req.files.employmentDocumentPdf1.length > 0) {
        updatedEmploymentDocumentPdf1 = await uploadToS3(req.files.employmentDocumentPdf1[0]);
      }

      if (req.files.employmentDocumentPdf2 && req.files.employmentDocumentPdf2.length > 0) {
        updatedEmploymentDocumentPdf2 = await uploadToS3(req.files.employmentDocumentPdf2[0]);
      }

      if (req.files.otherDocument1 && req.files.otherDocument1.length > 0) {
        updatedOtherDocument1 = await uploadToS3(req.files.otherDocument1[0]);
      }

      if (req.files.otherDocument2 && req.files.otherDocument2.length > 0) {
        updatedOtherDocument2 = await uploadToS3(req.files.otherDocument2[0]);
      }
    }
    if (email !== existingWorker.email) {
      existingWorker.email = email;
    }

    if (password) {
      existingWorker.password = password;
    }
    if (joiningDate) {
      existingWorker.joiningDate = joiningDate;
    }
    if (salary) {
      existingWorker.salary = salary;
    }
    if (address) {
      existingWorker.address = address;
    }
    if (location) {
      existingWorker.location = location;
    }

    // Update the worker
    existingWorker.email = email;
    existingWorker.role = role;
    existingWorker.name = name;
    existingWorker.joiningDate = joiningDate;
    existingWorker.salary = salary;
    existingWorker.address = address;
    existingWorker.location = location;
    existingWorker.workerProfileImage = updatedProfileImage;
    existingWorker.aadharCardFront = updatedAadharCardFront;
    existingWorker.aadharCardBack = updatedAadharCardBack;
    existingWorker.panCardFront = updatedPanCardFront;
    existingWorker.employmentDocumentPdf1 = updatedEmploymentDocumentPdf1;
    existingWorker.employmentDocumentPdf2 = updatedEmploymentDocumentPdf2;
    existingWorker.otherDocument1 = updatedOtherDocument1;
    existingWorker.otherDocument2 = updatedOtherDocument2;

    await existingWorker.save();

    if (email !== existingWorker.email || password) {
      // Send email only if email or password is updated
      sendingEmail(
        email,
        " Update Your Details Successfully ",
        `Your account for store ${storeNumber} has been updated successfully.\n\n Your Store Number: ${storeNumber}\n Your Password: ${password}`
      );
    }

    res.status(200).json({
      success: true,
      message: "Worker updated successfully",
      worker: existingWorker,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});




/********************************** New Order Processssss **********************/

exports.updateTaskStatus = async (req, res) => {
  try {

    const { id, status, timer_start, timer_end } = req.body;
    const worker_id= req.user._id
    if (!['accepted', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'accepted' or 'completed'." });
    }

    if (!id) {
      return res.status(400).json({ message: 'id is required in params. id should be worker status Id' });
    }

    // Find the existing worker status document
    const existingTask = await WorkerStatus.findById(id);

    // Check if the document exists
    if (!existingTask) {
      return res.status(404).json({ message: 'Worker status not found.' });
    }

    // Update the document based on the provided status
    if (status === 'accepted') {
      existingTask.status = status;
      existingTask.timer_start = timer_start;
      existingTask.worker_id=worker_id
    } else if (status === 'completed') {
      if(existingTask.role=='QC'){
        await ProductMapping.create({product_id:existingTask.product_id})
      }
      existingTask.status = status;
      existingTask.timer_end = timer_end;

      // Automatically determine the next role based on the current role
      let nextRole;
      if (existingTask.role === 'cutter') {
        nextRole = 'QC';
      } 


      // Create a new document for the next role if a next role exists
      if (nextRole) {
        const newStatusDocument = await WorkerStatus.create({
          store_id: existingTask.store_id,
          product_id: existingTask.product_id,
          role: nextRole,
          status: 'pending', // Default status
        });

        return res.status(200).json({
          message: 'Task completed successfully!',
          data: existingTask,
          newDocument: newStatusDocument,
        });
      }
    }

    // Save the updated document
    const updatedTask = await existingTask.save();

    res.status(200).json({
      message: `Task ${status} successfully!`,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status', error: error.message });
  }
};


// /************************* Get Pending Data For Workers *******************/

exports.getPendingWork = async (req, res) => {
  try {
    const { storeId, role } = req.user;

    if (!storeId || !role) {
      return res.status(400).json({ message: 'store_id and role are required.' });
    }

    //pending tasks and related data
    const pendingTasks = await WorkerStatus.find({ store_id: storeId, role, status: 'pending' });
    if (!pendingTasks.length) return res.status(404).json({ message: 'No pending tasks found.' });

    const productIds = pendingTasks.map(task => task.product_id);

    //related data in parallel
    const [products, styles, contrasts, measurements] = await Promise.all([
      Product.find({ _id: { $in: productIds } }).select('fabric_id amount category gender type category_id').populate('fabric_id').lean(),
      Style.find({ product_id: { $in: productIds } }).select('type name image product_id').lean(),
      Contrast.find({ product_id: { $in: productIds } }).select('name type price currency product_id image_url fabric_image_url').populate('fabric_id').lean(),
      Measurement.find({ product_id: { $in: productIds } }).select('type value unit image_url alt1 alt2 context product_id').lean(),
    ]);

    // response
    res.status(200).json({
      message: 'Pending tasks retrieved successfully!',
      pendingTasks,
      relatedData: {
        products: products.map(({ fabric_id, ...rest }) => ({ ...rest, fabricData: fabric_id })),
        styles,
        contrasts: contrasts.map(({ fabric_id, ...rest }) => ({ ...rest, fabricData: fabric_id })),
        measurements,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending work', error: error.message });
  }
};


exports.getWorkersWork = catchAsyncError(async (req, res, next) => {
  const { role, storeId } = req.user;
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  const type = req.query.type
  dynamicAddFields = {};
  lookupKeywords = [];
  let response = { success: true, message: "Retrived Successfully", }
  if (type == 'b2b' || !type) {

    const matchQuery = OthersService.getNotAssignedMatchquery(role, storeId);

    const { pipeline, countPipeline } = CommonServices.commonPipelineService(matchQuery, query);
    let offlineOrders = await QuickOrderStatus.aggregate(pipeline);
    const offlineNotAssignedProductData = await OthersService.notAssignedProductsforWorkers(offlineOrders, role)
    const countResultOffline = await QuickOrderStatus.aggregate(countPipeline);
    let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;

    const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
    response = {
      ...response,
      totalOfflineQuickOrders,
      totalOfflineOrderPages: totalPagesOffline,
      pageNumber: page,
      offlineNotAssignedProductData,
      role
    }
  }
  if (type == 'b2c' || !type) {
    const totalOnlineUnassignedProducts = await WorkerStatus.countDocuments({ role, status: 'pending', store_id: storeId });
    let allUnassignedOnlineProducts = await WorkerStatus.find({ role, status: 'pending', store_id: storeId })
    .populate({
      path: 'product_id',
      populate: [
          { path: 'category_id' },  // Populate stylist_id
          { path: 'fabric_id' } 
      ]
  })
      .skip((page - 1) * limit)
      .limit(limit)
    let totalPagesOnline = Math.ceil(totalOnlineUnassignedProducts / limit);
    allUnassignedOnlineProducts = allUnassignedOnlineProducts.map(item => {
        
      const product_data ={
        ...item.product_id.toObject(),
        category_data:item.product_id.category_id,
        fabric_data:item.product_id.fabric_id,
        category_id:undefined,
        fabric_id:undefined

      }
      item.product_data=item.product_id
      
        return {...item.toObject(),product_id:undefined,product_data}
  });
      response = {
      ...response,
      totalOnlineUnassignedProducts,
      totalOnlineOrderPages: totalPagesOnline,
      pageNumber: page,
      onlineNotAssignedProductData: allUnassignedOnlineProducts,
      role
    };
  }



  return res.status(200).json(response)
})
