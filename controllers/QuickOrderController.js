const { OfflineCustomerB2C } = require("../models/Customerb2c.offline");
const { OnlineCustomers } = require("../models/OnlineCustomers.model")
const bcrypt = require("bcryptjs");
const fs = require("fs");
const CustomerProduct = require('../models/customerProduct');

const customerProductAlteration = require('../models/customerProductAltration');
const CustomerMesurmentAlteration = require('../models/CustomerMeasurmentAltreation');
const CustomerSpecialInstructionAlteration = require('../models/Customer_SpecialIstructionAltreation');

const { catchAsyncError } = require("../middleware/catchAsyncError");
const CustomerMesurment = require('../models/customerMesurment')
const CustomerMesurmentOnline = require('../models/CustomerMesurmentB2C.model')
const AdminMesurmentForUser = require('../models/QuickOrderNew_Measurment_adminUser');
const Store = require('../models/stores');
const CustomerSplInstruction = require('../models/customer_Special_Instruction');
const CustomerContrast = require('../models/CustomerContrast');
const CustomerInvoice = require('../models/Customer_Bill_Invoice')
const orderService = require("../services/order.service")
const CustomerReadymadeProduct = require('../models/Customer_ReadymadeProduct');
const CustomerReadymadeAccessories = require('../models/Customer_ReadymadeAccessories')
const sendTemplateMail = require('../utils/sendemail')
const CustomerAppointment = require("../models/UserApoinmentForMeasurment");
const CustomerCutterProduct = require('../models/worker_cutter');
const Workers = require('../models/Worker.model');

const { sendNotificationByOnesignal } = require('../utils/pushNotifcation'); // Update the path accordingly
const dbServices = require('../services/db.services')
const uploadToS3 = require("../utils/s3Upload");
const { ObjectId } = require("mongodb");
const AppError = require("../utils/errorHandler");
const QuickOrderStatus = require("../models/quickorderStatus.model");
const QuickOrderStatusOnline = require("../models/quickorderStatusB2C.model");
const OnlineCustomer = require("../models/OnlineCustomers.model");
const CustomerService = require("../services/customer.service");
const CustomerProductOnline = require("../models/customerProductB2C.model");
const CommonServices = require("../services/common.service");
const { default: mongoose } = require("mongoose");
const NotificationModel = require("../models/notification_Model");
const { billData } = require("../pdfBill/billData");
const { billEmail, sendingEmail } = require("../utils/sendingEmail");
const { mailwithTemplate } = require("../utils/sendMailWithTemplates");
const WorkerLogs = require("../models/worker_cutter");
const OthersService = require("../services/others.service");
const { sendSMS } = require("../utils/sns.service");
const OTPStylish = require("../models/OTPStylish.model");
const OTPDelivery = require("../models/OTPDelivery.model");
const StylishLogs = require("../models/Stylish.model");
const CustomerInvoiceOnline = require("../models/BillInvoiceOnline.model");
const { sendEmailViaOneSignalwithoutTemplate } = require("../services/email.services");
const { createBillPDF } = require("../services/pdf.services");
const { handleDirectAppointment } = require("../services/appointment.service");

const CustomerAddresses = require("../models/CustomerAddress");
const TemporaryReadymadeCartB2C = require("../models/TempReadymadeCartB2C.model");


/***************  QuickOrder Images Uploads Sepreatelly ****************/
//For Customer Product own fabric image  picker
const uploadQucikOrderImages = catchAsyncError(async (req, res, next) => {
  // Ensure req.files is set up properly by your multer middleware
  if (!req.files || !req.files.QuickOrderImages || req.files.QuickOrderImages.length === 0) {
    return next(new AppError("Invalid file or file name", 400));
  }
  const QuickOrderImages = req.files.QuickOrderImages[0];
  try {
    // Assuming uploadToS3 is a function that handles the actual file upload to S3
    const fileUrl = await uploadToS3(QuickOrderImages);
    // Check if the file upload was successful
    if (!fileUrl) {
      throw new AppError("An error occurred during file upload", 400);
    }
    // Send a success response with the file URL
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      ownProductImage: fileUrl,
    });
  } catch (error) {
    // Handle any errors that occurred during the file upload or processing
    return next(new AppError("An error occurred during file upload", 500));
  }
});


/********For Customer Product own Fabric style image picker ********/
const uploadQuickOrderImages1 = catchAsyncError(async (req, res, next) => {
  // Ensure req.files is set up properly by your multer middleware
  if (!req.files || !req.files.QuickOrderImages1 || req.files.QuickOrderImages1.length === 0) {
    return next(new AppError("Invalid file or file name", 400));
  }
  const QuickOrderImages1 = req.files.QuickOrderImages1[0];
  try {
    // Assuming uploadToS3 is a function that handles the actual file upload to S3
    const fileUrl = await uploadToS3(QuickOrderImages1);
    // Check if the file upload was successful
    if (!fileUrl) {
      throw new AppError("An error occurred during file upload", 400);
    }
    // Send a success response with the file URL
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      ownMeasurmentImage: fileUrl,
    });
  } catch (error) {
    // Handle any errors that occurred during the file upload or processing
    return next(new AppError("An error occurred during file upload", 500));
  }
});



/************************** URL :  *******************************/
const createCustomers = catchAsyncError(async (req, res, next) => {
  const { user, body, files } = req;
  const storeId = user.storeId;
  const { customerName, phoneNumber, alternatePhoneNumber, email, gender, dateOfBirth, country, address } = body;

  const existingDetails = await OfflineCustomerB2C.findOne({ storeId, phoneNumber });
  if (existingDetails) return next(new AppError("Details already exist for this user.", 400));

  const uploadFile = async (file) => file ? await uploadToS3(file[0]) : null;

  const customerProof1Url = await uploadFile(files.customerFront);
  const customerProof2Url = await uploadFile(files.customerBack);
  const customerProof3Url = await uploadFile(files.customerSide);

  const customerData = { storeId, customerName, phoneNumber, alternatePhoneNumber, email, gender, dateOfBirth, country, address, };

  if (customerProof1Url) customerData.customerFront = customerProof1Url;
  if (customerProof2Url) customerData.customerBack = customerProof2Url;
  if (customerProof3Url) customerData.customerSide = customerProof3Url;

  const customer = await OfflineCustomerB2C.create(customerData);

  res.status(200).json({ success: true, message: "Customer added successfully!", customer });
});






/******************************* URL  : **************************/
const searchCustomer = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;

  const pipeline = await CustomerService.searchService(req.query, storeId);

  // If search is empty, return a message
  if (!pipeline) {
    return res.status(400).json({
      success: false,
      message: "Please enter customer details for search.",
    });
  }

  const existingDetails = await OfflineCustomerB2C.aggregate(pipeline);

  if (!existingDetails || existingDetails.length === 0) {
    return next(new AppError("Customer not found with the provided search keyword and storeId.", 400));
  }

  return res.status(200).json({
    success: true,
    message: "Customer found successfully!",
    customer: existingDetails,
  });
});


/*************************** URL :  ****************************/
const getCustomers = catchAsyncError(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 4;
  const { storeId } = req.query;

  // Build matchQuery conditionally based on storeId presence
  let matchQuery = {};
  if (storeId) {
    matchQuery.storeId = mongoose.Types.ObjectId(storeId);
  }

  // Generate pipeline and countPipeline based on matchQuery and req.query
  const { pipeline, countPipeline } = CommonServices.commonPipelineService(matchQuery, req.query);
  // Fetch customers based on the pipeline
  const customers = await OfflineCustomerB2C.aggregate(pipeline);
  // Get total count of customers
  const countResult = await OfflineCustomerB2C.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  // Showing results for pagination
  const showingResults = CommonServices.showingResults(req.query, totalCount);

  // Send the response
  res.status(200).json({
    success: true,
    message: "Customer data fetched successfully.",
    totalCount,
    page,
    showingResults,
    count: customers.length,
    customers,
  });
});


/************************** URL :  *******************************/
const getCustomerById = catchAsyncError(async (req, res, next) => {
  const customers = await OfflineCustomerB2C.findById(req.params.id);
  res.status(200).json({
    success: true,
    count: customers.length,
    customers,
  });
});



/************************* Update customer **************************/
const createOrUpdateCustomer = catchAsyncError(async (req, res, next) => {
  const { user, body, files } = req;
  const storeId = user.storeId;
  const { customerId } = req.params;
  const { customerName, phoneNumber, alternatePhoneNumber, email, gender, dateOfBirth, country, address } = body;

  const existingDetails = await OfflineCustomerB2C.findOne({ _id: customerId, storeId });
  if (!existingDetails) return next(new AppError("Customer not found.", 404));

  const uploadFile = async (file) => file ? await uploadToS3(file[0]) : null;

  const customerProof1Url = await uploadFile(files.customerFront);
  const customerProof2Url = await uploadFile(files.customerBack);
  const customerProof3Url = await uploadFile(files.customerSide);

  const updatedCustomerData = {
    customerName,
    phoneNumber,
    alternatePhoneNumber,
    email,
    gender,
    dateOfBirth,
    country,
    address,
  };

  if (customerProof1Url) updatedCustomerData.customerFront = customerProof1Url;
  if (customerProof2Url) updatedCustomerData.customerBack = customerProof2Url;
  if (customerProof3Url) updatedCustomerData.customerSide = customerProof3Url;

  // Update the existing customer with new data
  const updatedCustomer = await OfflineCustomerB2C.findByIdAndUpdate(customerId, { $set: updatedCustomerData }, { new: true });

  res.status(200).json({ success: true, message: "Customer updated successfully!", customer: updatedCustomer });
});





/************************* Delete Customers Data ***********************/
const deleteCustomer = catchAsyncError(async (req, res, next) => {
  const { user } = req;
  const storeId = user.storeId;
  const { customerId } = req.params;


  // Find the customer record by ID and store ID
  const customer = await OfflineCustomerB2C.findOne({ _id: customerId, storeId });

  // If the customer record doesn't exist, return an error
  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  // Delete customer images from storage if they exist
  if (customer.customerFront) {
    await deleteFromS3(customer.customerFront);
  }
  if (customer.customerBack) {
    await deleteFromS3(customer.customerBack);
  }
  if (customer.customerSide) {
    await deleteFromS3(customer.customerSide);
  }

  // Delete the customer record from the database
  await customer.delete();

  res.status(200).json({ success: true, message: "Customer deleted successfully.." });
});


/**************************** Customer Product Api *******************/
const createCustomerProduct = async (req, res, next) => {
  const { storeId } = req.user;
  const { customerId, orderNumber, product, productNumber, fabricImage, fabricName, fabricMaterial, fabDashNumber, fabricQuantity, quantityType, tilex, tiley, contrast, brightness, rotation, color, glossy } = req.body;
  try {
    // Find customer
    const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
    if (!findCustomer) return next(new AppError("No customer found!", 400));

    // Validate the product array
    if (!product || !Array.isArray(product) || product.length === 0)
      return next(new AppError("Invalid product array in the request body", 400));

    // Find the existing QuickOrderStatus for the customer with status: false
    let orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });

    if (orderStatus) {
      // Update existing CustomerProduct if productID is found
      if (orderStatus.productID) {
        const existingCustomerProduct = await CustomerProduct.findOne({ storeId, _id: orderStatus.productID });

        if (existingCustomerProduct) {
          existingCustomerProduct.product.push(...product.map(item => ({
            ...item,
            categories: item.categories.map(category => ({
              name: category.name || 'Default Category Name',
              styles: category.styles || []
            }))
          })));
          const updatedCustomerProduct = await existingCustomerProduct.save();

          return res.status(200).json({ success: true, message: "Product updated successfully", updatedCustomerProduct });
        }
      }
    }

    // If no productID, create a new CustomerProduct
    const newCustomerProduct = new CustomerProduct({
      storeId, customerId, orderNumber, product: product.map(item => ({
        ...item,
        categories: item.categories.map(category => ({
          name: category.name || 'Default Category Name',
          styles: category.styles || []
        }))
      })),
      productNumber, fabricImage, fabricName, fabricMaterial, fabricQuantity, fabDashNumber, quantityType, tilex, tiley, contrast, brightness, rotation, color, glossy
    });

    const savedCustomerProduct = await newCustomerProduct.save();

    // If orderStatus exists, update its productID, otherwise create a new QuickOrderStatus
    if (orderStatus) {
      orderStatus.productID = savedCustomerProduct._id;
      await orderStatus.save();
    } else {
      orderStatus = await QuickOrderStatus.create({ storeID: storeId, customerID: customerId, productID: savedCustomerProduct._id });
    }

    return res.status(201).json({ success: true, message: "Product saved successfully", orderStatus, savedCustomerProduct });
  } catch (error) {
    console.error('Error creating customer product:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



const updateCustomerProduct = async (req, res) => {
  const { id } = req.params; // Get the document's _id from the URL
  const { storeId, customerId, productData } = req.body; // Get the updated data from the request body

  // Ensure productData is an array
  if (!Array.isArray(productData)) {
    return res.status(400).json({ message: 'Product data must be an array.' });
  }

  try {
    // Find the CustomerProduct by _id and update it, replacing the product array
    const result = await CustomerProduct.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          storeId,
          customerId,
          product: productData // Directly set the product array with the new data
        }
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'CustomerProduct not found' });
    }

    // Successfully updated
    return res.status(200).json({
      message: 'CustomerProduct updated successfully',
      updatedCustomerProduct: result
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating CustomerProduct', error });
  }
};




/*********************************************************************/
/**************************** Customer createCustomerAlterationProduct Api *******************/
const createCustomerAlterationProduct = async (req, res, next) => {
  const { storeId } = req.user;
  const { customerId, orderNumber, product, productNumber } = req.body;
  try {
    // Find customer
    const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
    if (!findCustomer) return next(new AppError("No customer found!", 400));

    // Validate the product array
    if (!product || !Array.isArray(product) || product.length === 0)
      return next(new AppError("Invalid AltreationProduct array in the request body", 400));

    // Find the existing QuickOrderStatus for the customer with status: false
    let orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });

    if (orderStatus) {
      // Update existing customerProductAlteration if ProductAlterationID is found
      if (orderStatus.ProductAlterationID) {
        const existingCustomerProduct = await customerProductAlteration.findOne({ storeId, _id: orderStatus.ProductAlterationID });

        if (existingCustomerProduct) {
          existingCustomerProduct.product.push(...product.map(item => ({
            ...item,
            categories: item.categories.map(category => ({
              name: category.name || 'Default Category Name',
              alteration: category.alteration || []
            }))
          })));
          const updatedCustomerProduct = await existingCustomerProduct.save();

          return res.status(200).json({ success: true, message: "AltreationProduct updated successfully", updatedCustomerProduct });
        }
      }
    }

    // If no ProductAlterationID, create a new customerProductAlteration
    const newCustomerProduct = new customerProductAlteration({
      storeId, customerId, orderNumber, product: product.map(item => ({
        ...item,
        categories: item.categories.map(category => ({
          name: category.name || 'Default Category Name',
          alteration: category.alteration || []
        }))
      }))
    });

    const savedCustomerProduct = await newCustomerProduct.save();

    // If orderStatus exists, update its ProductAlterationID, otherwise create a new QuickOrderStatus
    if (orderStatus) {
      orderStatus.ProductAlterationID = savedCustomerProduct._id;
      await orderStatus.save();
    } else {
      orderStatus = await QuickOrderStatus.create({ storeID: storeId, customerID: customerId, ProductAlterationID: savedCustomerProduct._id });
    }

    return res.status(201).json({ success: true, message: "AltreationProduct saved successfully", orderStatus, savedCustomerProduct });
  } catch (error) {
    console.error('Error creating customer AltreationProduct:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




/****************** Mark Quick Order Status (add readymade id also check)***************************/
const markQuickOrderStatus = catchAsyncError(async (req, res, next) => {
  const { markedStatus, customerId } = req.body;
  const { storeId, email, storeInfo } = req.user;

  try {
    const customer = await OfflineCustomerB2C.findById(customerId);
    if (!customer) return next(new AppError("Customer not found!", 400));

    let quickorderStatus = await QuickOrderStatus.findOne({
      storeID: ObjectId(storeId),
      customerID: ObjectId(customerId),
      status: false,
    });

    if (!quickorderStatus) {
      return next(new AppError("No Data to save!", 400));
    }

    if (quickorderStatus.markedStatus === true) {
      return next(new AppError("Order is already completed", 400));
    }

    let latestOrderNumber = await QuickOrderStatus.findOne({ storeID: storeId }).sort({ orderNumber: -1 });

    if (markedStatus === true) {
      if (!quickorderStatus.markedStatus || quickorderStatus.markedStatus === "Incomplete") {
        if (quickorderStatus.billInvoiceID) {
          const billInvoice = await dbServices.findById(CustomerInvoice, quickorderStatus.billInvoiceID);
          if (!billInvoice) return next(new AppError("Please complete billing first!", 400));

          quickorderStatus.markedStatus = "Completed";
          quickorderStatus.status = true;

          if (!quickorderStatus.orderNumber) {
            const newOrderNumber = await OthersService.createOrderNumber(latestOrderNumber, storeId);
            if (newOrderNumber) {
              quickorderStatus.orderNumber = newOrderNumber;
            } else {
              return next(new AppError("Order number failed to be created", 400));
            }
          }

          const products = await CustomerProduct.findById(quickorderStatus.productID);
          const productIds = products ? products.product.map(product => product._id) : [];

          if (quickorderStatus.readyMadeProductID) {
            const readymadeProducts = await CustomerReadymadeProduct.findById(quickorderStatus.readyMadeProductID);
            const readymadeProductIds = readymadeProducts ? readymadeProducts.products.map(products => products._id) : [];

            readymadeProductIds.forEach(productId => {
              if (!quickorderStatus.notAssignedProductIds.some(p => p.productId.equals(productId))) {
                quickorderStatus.notAssignedProductIds.push({ productId });
              }
            });
          }
          /////
          if (quickorderStatus.readyMadeAccessoriesID) {
            const readyMadeAccessories = await CustomerReadymadeAccessories.findById(quickorderStatus.readyMadeAccessoriesID);
            const readyMadeAccessoriesIds = readyMadeAccessories ? readyMadeAccessories.accessories.map(accessorie => accessorie._id) : [];
            readyMadeAccessoriesIds.forEach(productId => {
              if (!quickorderStatus.notAssignedProductIds.some(p => p.productId.equals(productId))) {
                quickorderStatus.notAssignedProductIds.push({ productId });
              }
            });
          }
          /////

          /////testing alteration//////
          if (quickorderStatus.ProductAlterationID) {
            const products = await customerProductAlteration.findById(quickorderStatus.ProductAlterationID);
            const productIds = products ? products.product.map(product => product._id) : [];

            productIds.forEach(productId => {
              if (!quickorderStatus.notAssignedProductIds.some(p => p.productId.equals(productId))) {
                quickorderStatus.notAssignedProductIds.push({ productId });
              }
            });
          }
          /////

          productIds.forEach(productId => {
            if (!quickorderStatus.notAssignedProductIds.some(p => p.productId.equals(productId))) {
              quickorderStatus.notAssignedProductIds.push({ productId });
            }
          });

          await quickorderStatus.save();

          const templates = "order-success";
          const replacements = {
            name: customer.customerName,
            order_number: quickorderStatus.orderNumber,
          };

          // const link = `${process.env.BACKEND_URL}/sdfdsiufbiu?storeId=sdfds&orderNumber=sudf`

          const message = `Thank You For Ordering. \nYour Order Placed Successfully.\nYour Order Number Is: ${quickorderStatus.orderNumber}. Visit: https://www.lovoj.com/`;
          const sms = await sendSMS(message, `91${customer?.phoneNumber}`, "Lovoj", process.env.AWS_ENTITY_ID, process.env.B2BORDER_COMPLETED_SMS_AWS_TEMPLATE_ID);
          if (!sms) return next(new AppError("Failed to send completion SMS.", 500));

          await sendEmailViaOneSignalwithoutTemplate({
            email: customer.email,
            order_number: quickorderStatus.orderNumber,
            name: customer.customerName,
            type: "Order-Success",
          });

          await sendEmailViaOneSignalwithoutTemplate({
            email,
            order_number: quickorderStatus.orderNumber,
            name: customer.customerName,
            type: "Admin-Order-Success",
          });

          const billEmailResult = await mailwithTemplate(customer.email, "Order Placed Successfully.", templates, "Order-Success", replacements);
          if (billEmailResult) {
            console.log(`Email sent successfully to: ${customer.email}`);
            const billingDetails = await QuickOrderStatus.aggregate(await CustomerService.billingDetailsPipelineService(quickorderStatus));
            if (billingDetails.length === 0) return next(new AppError("Billing details not found.", 400));

            const pdfFilePath = await createBillPDF(billingDetails[0], storeInfo);
            if (pdfFilePath) {
              const billEmailResult = await billEmail(customer.email, "Billing Pdf", "Here is the Bill", pdfFilePath);
              if (billEmailResult) {
                console.log(`Email sent successfully to: ${customer.email}`);
                try {
                  fs.unlinkSync(pdfFilePath);
                  console.log(`PDF file deleted: ${pdfFilePath}`);
                } catch (error) {
                  console.error("Error deleting PDF file:", error);
                }
              } else {
                console.error("Failed to send email");
              }
            }
          }

          const notification = await sendNotificationByOnesignal(req.user.deviceToken, 'Order Completed', 'Your order has been completed successfully.');
          if (notification) {
            await NotificationModel.create({
              storeId,
              customerId,
              type: "Offline",
              message: "Your order has been completed successfully.",
              title: "Order Completed",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Quick order status completed successfully!",
            quickorderStatus,
            billInvoice,
          });
        } else {
          return next(new AppError("Please complete billing first!", 400));
        }
      }
    }

    if (markedStatus === false) {
      const newOrderNumber = await OthersService.createOrderNumber(latestOrderNumber, storeId);
      if (newOrderNumber) {
        quickorderStatus.orderNumber = newOrderNumber;
      } else {
        return next(new AppError("Order number failed to be created", 400));
      }

      if (quickorderStatus.readyMadeProductID) {
        await dbServices.findByIdAndRemove(CustomerReadymadeProduct, quickorderStatus.readyMadeProductID);
        quickorderStatus.readyMadeProductID = null;
      }

      /************ */
      //  if (quickorderStatus.readyMadeProductID) {
      //  // Find and remove the CustomerReadymadeProduct
      //  await dbServices.findByIdAndRemove(CustomerReadymadeProduct, quickorderStatus.readyMadeProductID);
      //  quickorderStatus.readyMadeProductID = null;

      //  // Also remove the readyMadeProductId from notAssignedProductIds array
      //   quickorderStatus.notAssignedProductIds = quickorderStatus.notAssignedProductIds.filter(
      //   item => !item.productId.equals(quickorderStatus.readyMadeProductID)
      //   );
      //  }
      /********** */
      if (quickorderStatus.readyMadeAccessoriesID) {
        await dbServices.findByIdAndRemove(CustomerReadymadeAccessories, quickorderStatus.readyMadeAccessoriesID);
        quickorderStatus.readyMadeAccessoriesID = null;
      }

      quickorderStatus.markedStatus = "Incomplete";
      await quickorderStatus.save();

      const notification = await sendNotificationByOnesignal(
        quickorderStatus.deviceToken,
        'Order Incomplete',
        'Your order is marked as incomplete. Please complete your order.'
      );
      if (notification) {
        await NotificationModel.create({
          type: "Offline",
          storeId,
          customerId,
          message: "Your order is marked as incomplete. Please complete your order.",
          title: "Order Incomplete",
        });
      }

      const message = `Your order is marked as incomplete. Please complete your order with\nOrder Number : ${quickorderStatus?.orderNumber}. Visit: https://www.lovoj.com/`;
      const sms = await sendSMS(message, `91${customer?.phoneNumber}`, "Lovoj", process.env.AWS_ENTITY_ID, process.env.B2BORDER_INCOMPLETED_SMS_AWS_TEMPLATE_ID);
      const billEmailResult = await sendingEmail(customer.email, "Order Status", "Your order is marked as incomplete. Please complete your order.");
      if (billEmailResult) {
        console.log("Email sent successfully");
      } else {
        console.error("Failed to send email");
      }

      return res.status(200).json({
        success: true,
        message: "Quick order status marked as incomplete successfully!",
        quickorderStatus,
      });
    }
  } catch (error) {
    console.error('Error marking quick order status:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


/**************************** Download Pdf File Api ****************/

const downloadPDF = catchAsyncError(async (req, res, next) => {
  const { storeInfo } = req.user;
  // const storeInfo = await Store.findById("65715c8c36e9b8a5945ce4cc");
  const { storeID, orderNumber } = req.query;

  if (!orderNumber) {
    return next(new AppError('Order number is required', 400));
  }

  // Fetch billing details using the orderNumber
  const quickOrderStatus = await QuickOrderStatus.findOne({ storeID, orderNumber });
  if (!quickOrderStatus) {
    return next(new AppError('Order not found', 404));
  }

  // Get the pipeline for billing details
  const pipeline = await CustomerService.billingDetailsPipelineService(quickOrderStatus);

  // Aggregate billing details
  const billingDetails = await QuickOrderStatus.aggregate(pipeline);
  if (!billingDetails.length) {
    return next(new AppError('Billing details not found', 404));
  }

  // Create the PDF file
  const pdfFilePath = await createBillPDF(billingDetails[0], storeInfo);

  // Use res.download() to send the file as an attachment
  res.download(pdfFilePath, 'bill_invoice.pdf', (err) => {
    if (err) {
      // Handle any errors
      return next(new AppError('Error downloading the file', 500));
    } else {
      // Delete the temporary PDF file after download
      fs.unlinkSync(pdfFilePath);
    }
  });
});


/*******************Discard customer data*****************/
const discardCustomerData = catchAsyncError(async (req, res, next) => {
  const { customerId } = req.body;
  const { storeId } = req.user;

  let quickorderStatus = await QuickOrderStatus.findOne({
    storeID: ObjectId(storeId),
    customerID: ObjectId(customerId),
    status: false,
  });

  if (!quickorderStatus) return next(new AppError("No Data to save!", 400));

  if (!quickorderStatus.markedStatus) {
    await dbServices.findByIdAndRemove(CustomerProduct, quickorderStatus.productID);
    await dbServices.findByIdAndRemove(CustomerMesurment, quickorderStatus.measurementID);
    await dbServices.findByIdAndRemove(CustomerSplInstruction, quickorderStatus.specialIntructionID);
    await dbServices.findByIdAndRemove(CustomerContrast, quickorderStatus.constrastID);
    await dbServices.findByIdAndRemove(CustomerInvoice, quickorderStatus.billInvoiceID);
    await dbServices.findByIdAndRemove(CustomerReadymadeProduct, quickorderStatus.readyMadeProductID);
    await dbServices.findByIdAndRemove(CustomerReadymadeAccessories, quickorderStatus.readyMadeAccessoriesID);

    await dbServices.removeDocumentById(QuickOrderStatus, quickorderStatus._id);

    return res.status(200).json({ status: true, message: "Discarded successfully" });
  } else {
    return res.status(400).json({ status: false, message: "No data to discard" });
  }
})



/****************** Get All customers  ***************/
const getAllCustomerProducts = async (req, res, next) => {
  const storeId = req.user.storeId;
  try {
    const allCustomerProducts = await CustomerProduct.find({ storeId });
    res.status(200).json(allCustomerProducts);
  } catch (error) {
    console.error('Error fetching all customer products:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


/****************** Get Customer By Id ****************/
const getCustomerProductById = async (req, res, next) => {
  const { customerId } = req.params;
  const { orderNumber } = req.query;

  try {
    const customerProduct = await CustomerProduct.findOne({ customerId, orderNumber });

    if (!customerProduct) {
      return res.status(404).json({ message: 'Customer product not found' });
    }

    res.status(200).json(customerProduct);
  } catch (error) {
    console.error('Error fetching customer product by ID:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



/************************** Customer Measurment Api ****************/

/********* update voice measurment also **********/
const createCustomerMesurment = async (req, res, next) => {
  const storeId = req.user.storeId;

  try {
    const { customerId, products } = req.body;

    const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
    if (!findCustomer) return next(new AppError("No customer found!", 400));

    // Check if customerMesurment already exists for the given customerId and orderNumber
    const orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });
    if (!orderStatus || !orderStatus.productID) return next(new AppError("Please add product first!", 400));
    if (orderStatus.measurementID) {
      console.log(orderStatus.measurementID, "inside update")
      const existingCustomerMesurment = await CustomerMesurment.findOne({ storeId, _id: orderStatus.measurementID });
      if (orderStatus.measurementID) {
        // Update the existing document with the new product data
        console.log(orderStatus)
        let updated = false;
        let newCategoriesAdded = false;
        let productsMeasurementUpdated = [];
        let productsMeasurementInserted = [];

        // Loop through each category in the request
        for (const product of products) {
          console.log(product.productId)
          const existingCategoryIndex = existingCustomerMesurment.products.findIndex(cat => cat.productId.toString() === product.productId.toString());
          console.log(existingCategoryIndex)
          if (existingCategoryIndex === -1) {
            // If category doesn't exist, push the entire category object
            existingCustomerMesurment.products.push(product);
            newCategoriesAdded = true;
            productsMeasurementInserted.push(product)
          } else {
            // If product exists, update its measurements, MeasurmentVoiceRecording, and MeasurmentSizePreference
            existingCustomerMesurment.products[existingCategoryIndex].mesurments = product.mesurments;
            existingCustomerMesurment.products[existingCategoryIndex].MeasurmentVoiceRecording = product.MeasurmentVoiceRecording;
            existingCustomerMesurment.products[existingCategoryIndex].MeasurmentSizePreference = product.MeasurmentSizePreference;
            updated = true;
            productsMeasurementUpdated.push(product)
          }
        }

        if (updated || newCategoriesAdded) {
          // Save the updated measurement entry to the database
          await existingCustomerMesurment.save();

          let message = '';
          if (updated && newCategoriesAdded) {
            message = 'Measurement entry updated with existing and new products';
          } else if (updated) {
            message = 'Measurement entry updated with existing products';
          } else {
            message = 'New products added to the measurement entry';
          }
          let data = {}
          if (productsMeasurementUpdated.length > 0) {
            data.productsMeasurementUpdatedCount = productsMeasurementUpdated.length
            //  data.productsMeasurementUpdated = productsMeasurementUpdated
          }
          if (productsMeasurementInserted.length > 0) {
            data.productsMeasurementInsertedCount = productsMeasurementInserted.length
            //  data.productsMeasurementInserted = productsMeasurementInserted
          }
          return res.status(200).json({
            success: true,
            message,
            data,
            existingCustomerMesurment
          });
        }
      }
    } else if (!orderStatus.measurementID) {
      // If not, create a new customer mesurment
      const newCustomerMesurment = new CustomerMesurment({
        storeId,
        customerId,
        products
      });

      const savedCustomerMesurment = await newCustomerMesurment.save();

      //ORDER STATUS
      orderStatus.measurementID = savedCustomerMesurment._id;
      orderStatus.save();

      return res.status(201).json({ success: true, message: "Measurement saved successfully", orderStatus: orderStatus, savedCustomerMesurment });
    }

  } catch (error) {
    console.error('Error creating/updating customer mesurment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


/********* update voice Alterationmeasurment also **********/
const createCustomerAlterationMesurment = async (req, res, next) => {
  const storeId = req.user.storeId;

  try {
    const { customerId, products } = req.body;

    const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
    if (!findCustomer) return next(new AppError("No customer found!", 400));

    // Check if customerMesurment already exists for the given customerId and orderNumber
    const orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });
    if (!orderStatus || !orderStatus.ProductAlterationID) return next(new AppError("Please add product first!", 400));

    if (orderStatus.measurementAlterationID) {
      console.log(orderStatus.measurementAlterationID, "inside update");
      const existingCustomerMesurment = await CustomerMesurmentAlteration.findOne({ storeId, _id: orderStatus.measurementAlterationID });
      if (!existingCustomerMesurment) return next(new AppError("Measurement alteration not found!", 400));

      // Update the existing document with the new product data
      let updated = false;
      let newCategoriesAdded = false;
      let productsMeasurementUpdated = [];
      let productsMeasurementInserted = [];

      // Loop through each category in the request
      for (const product of products) {
        const existingCategoryIndex = existingCustomerMesurment.products.findIndex(cat => cat.productId.toString() === product.productId.toString());

        if (existingCategoryIndex === -1) {
          // If category doesn't exist, push the entire category object
          existingCustomerMesurment.products.push(product);
          newCategoriesAdded = true;
          productsMeasurementInserted.push(product);
        } else {
          // If product exists, update its measurements, MeasurmentVoiceRecording, and MeasurmentSizePreference
          existingCustomerMesurment.products[existingCategoryIndex].mesurments = product.mesurments;
          existingCustomerMesurment.products[existingCategoryIndex].MeasurmentVoiceRecording = product.MeasurmentVoiceRecording;
          existingCustomerMesurment.products[existingCategoryIndex].MeasurmentSizePreference = product.MeasurmentSizePreference;
          updated = true;
          productsMeasurementUpdated.push(product);
        }
      }

      if (updated || newCategoriesAdded) {
        try {
          await existingCustomerMesurment.save();
        } catch (err) {
          console.error('Error saving measurement alteration:', err);
          return res.status(500).json({ message: 'Failed to save updated measurement alteration', error: err.message });
        }

        let message = '';
        if (updated && newCategoriesAdded) {
          message = 'Measurement Altreation entry updated with existing and new products';
        } else if (updated) {
          message = 'Measurement Altreation entry updated with existing products';
        } else {
          message = 'New products added to the measurement entry';
        }

        let data = {};
        if (productsMeasurementUpdated.length > 0) {
          data.productsMeasurementUpdatedCount = productsMeasurementUpdated.length;
        }
        if (productsMeasurementInserted.length > 0) {
          data.productsMeasurementInsertedCount = productsMeasurementInserted.length;
        }

        return res.status(200).json({
          success: true,
          message,
          data,
          existingCustomerMesurment,
        });
      }
    } else {
      // If no measurementAlterationID, create a new customer measurement
      const newCustomerMesurmentAlteration = new CustomerMesurmentAlteration({
        storeId,
        customerId,
        products,
      });

      const savedCustomerMesurmentAlteration = await newCustomerMesurmentAlteration.save();

      orderStatus.measurementAlterationID = savedCustomerMesurmentAlteration._id;
      await orderStatus.save();

      return res.status(201).json({
        success: true,
        message: "Measurement Altreation saved successfully",
        orderStatus,
        savedCustomerMesurmentAlteration,
      });
    }

  } catch (error) {
    console.error('Error creating/updating customer mesurment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



/************************** Get all measurment  *************/

const getAllCustomerMesurments = async (req, res) => {
  const storeId = req.user.storeId;
  const { customerId, _id, name } = req.query;

  // Build the base filter based on storeId and optional customerId and _id
  const filter = { storeId };
  if (customerId) filter.customerId = customerId;
  if (_id) filter._id = _id;

  try {
    // Find all customer measurements based on the constructed filter
    let customerMeasurements = await CustomerMesurment.find(filter);

    // If name is provided, filter further by name within products array
    if (name) {
      customerMeasurements = customerMeasurements.filter(customerMeasurement =>
        customerMeasurement.products.some(product => product.name === name)
      );

      // Filter products array to include only the product with the specified name
      customerMeasurements.forEach(customerMeasurement => {
        customerMeasurement.products = customerMeasurement.products.filter(product => product.name === name);
      });

      // Check if any customer measurement matches the criteria
      if (customerMeasurements.length === 0) {
        return res.status(404).json({ message: `Customer measurement with name '${name}' not found` });
      }
    }

    // // Log fetched customer measurements for debugging
    // console.log('Fetched customer measurements:', customerMeasurements);

    // Return the filtered customer measurements as JSON response
    res.status(200).json({ message: 'Customer measurement found Successfully..', customerMeasurements });
  } catch (error) {
    // Handle any errors and log them
    console.error('Error retrieving customer measurements:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


/******************* Get Measurment By id and Name ***********/


const getCustomerMesurmentBy_id_Name = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name } = req.query;

    // Query based on customerId and product name
    const customerMesurments = await CustomerMesurment.find({
      customerId,
      'products.name': name,
    });

    if (!customerMesurments || customerMesurments.length === 0) {
      return res.status(404).json({ message: 'Customer measurement not found' });
    }

    // Extract products with the specified name
    const products = [];
    for (const customerMesurment of customerMesurments) {
      const matchingProducts = customerMesurment.products.filter((p) => p.name === name);
      products.push(...matchingProducts);
    }

    if (products.length === 0) {
      return res.status(404).json({ message: `Product with name '${name}' not found` });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching customer measurement:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




/**************************** Special Instruction ********************/
/*********************************************************************/

const createSpecialInstruction = async (req, res, next) => {
  try {
    const storeId = req.user.storeId;
    const { customerId, products } = req.body;

    // Step 1: Find the correct customer document
    const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
    if (!findCustomer) return next(new AppError("No customer found!", 400));

    // Step 2: Find order status (assuming QuickOrderStatus needs to be checked)
    const orderStatus = await QuickOrderStatus.findOne({
      storeID: storeId,
      customerID: customerId,
      status: false
    });
    if (!orderStatus || !orderStatus.productID) {
      return next(new AppError("Please add product first!", 400));
    }

    let isUpdated = false;

    // Step 3: Loop through each product to find the correct special instruction document
    for (const product of products) {
      // Find the special instruction document that contains the correct productId
      let existingCustomerInstruction = await CustomerSplInstruction.findOne({
        storeId,
        customerId,
        "products.productId": product.productId
      });

      if (existingCustomerInstruction) {
        // Step 4: Find the specific product within the products array
        const existingProductIndex = existingCustomerInstruction.products.findIndex(
          (existingProduct) => existingProduct.productId.toString() === product.productId.toString()
        );

        if (existingProductIndex !== -1) {
          // Product found, update the special instructions for this product
          existingCustomerInstruction.products[existingProductIndex].specialInstructions = product.specialInstructions;

          // Save the updated document
          await existingCustomerInstruction.save();

          // Set the update flag
          isUpdated = true;

          // Return the updated response
          return res.status(200).json({
            message: "Special instruction entry updated successfully for the product",
            customerID: customerId,
            storeID: storeId,
            products: {
              updatedProduct: existingCustomerInstruction.products[existingProductIndex],
            },
          });
        }
      } else {
        // If no matching special instruction is found, create a new entry for this product
        const newCustomerInstruction = new CustomerSplInstruction({
          storeId,
          customerId,
          products: [product], // Add the product to a new special instruction entry
        });

        const savedCustomerInstruction = await newCustomerInstruction.save();

        // Update the special instruction ID in the order status
        orderStatus.specialIntructionID = savedCustomerInstruction._id;
        await orderStatus.save();

        return res.status(201).json({
          success: true,
          message: "Special instruction saved successfully for the new product",
          customerID: customerId,
          storeID: storeId,
          products: {
            savedProduct: savedCustomerInstruction.products[0],
          },
        });
      }
    }

    if (!isUpdated) {
      return res.status(400).json({ message: "No matching product found for special instructions." });
    }
  } catch (error) {
    next(error);
  }
};


// const createSpecialInstruction = async (req, res, next) => {
//   try {
//     const storeId = req.user.storeId;
//     const { customerId, products } = req.body;

//     const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
//     if (!findCustomer) return next(new AppError("No customer found!", 400));

//     const orderStatus = await QuickOrderStatus.findOne({
//       storeID: storeId,
//       customerID: customerId,
//       status: false
//     });
//     if (!orderStatus || !orderStatus.productID) {
//       return next(new AppError("Please add product first!", 400));
//     }

//     let updatedProducts = [];
//     let newProducts = [];

//     for (const product of products) {
//       let existingCustomerInstruction = await CustomerSplInstruction.findOne({
//         storeId,
//         customerId,
//         "products.productId": product.productId
//       });

//       if (existingCustomerInstruction) {
//         const existingProductIndex = existingCustomerInstruction.products.findIndex(
//           (existingProduct) => existingProduct.productId.toString() === product.productId.toString()
//         );

//         if (existingProductIndex !== -1) {
//           existingCustomerInstruction.products[existingProductIndex].specialInstructions = product.specialInstructions;
//           await existingCustomerInstruction.save();
//           updatedProducts.push(existingCustomerInstruction.products[existingProductIndex]);
//         }
//       } else {
//         const newCustomerInstruction = new CustomerSplInstruction({
//           storeId,
//           customerId,
//           products: [product],
//         });

//         const savedCustomerInstruction = await newCustomerInstruction.save();
//         orderStatus.specialIntructionID = savedCustomerInstruction._id;
//         await orderStatus.save();

//         newProducts.push(savedCustomerInstruction.products[0]);
//       }
//     }

//     if (updatedProducts.length === 0 && newProducts.length === 0) {
//       return res.status(400).json({ message: "No matching product found for special instructions." });
//     }

//     return res.status(200).json({
//       message: "Special instructions processed successfully",
//       customerID: customerId,
//       storeID: storeId,
//       updatedProducts,
//       newProducts
//     });
//   } catch (error) {
//     next(error);
//   }
// };



/************************* Special Instruction Altreation ********************/

const createAlterationSpecialInstruction = async (req, res, next) => {
  try {
    const storeId = req.user.storeId;
    const { customerId, products } = req.body;

    const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
    if (!findCustomer) {
      return next(new AppError("No customer found!", 400));
    }

    const orderStatus = await QuickOrderStatus.findOne({
      storeID: storeId,
      customerID: customerId,
      status: false,
    });

    if (!orderStatus || !orderStatus.ProductAlterationID) {
      return next(new AppError("Please add product first!", 400));
    }

    let responseKey = "savedProduct";
    let responseMessage = "Special instruction saved successfully";

    if (orderStatus.specialIntructionAlterationID) {
      const existingCustomerInstruction = await CustomerSpecialInstructionAlteration.findOne({
        storeId,
        customerId,
      });

      if (existingCustomerInstruction) {
        let updated = false;
        let newSpecialInstructionAdded = false;

        for (const product of products) {
          const existingProduct = existingCustomerInstruction.products.find(
            (prod) => prod.productId.toString() === product.productId.toString()
          );

          if (existingProduct) {
            existingProduct.specialInstructions = product.specialInstructions;
            updated = true;
          } else {
            existingCustomerInstruction.products.push(product);
            newSpecialInstructionAdded = true;
          }
        }

        if (updated || newSpecialInstructionAdded) {
          await existingCustomerInstruction.save();

          responseMessage = updated
            ? "Special instruction entry updated successfully for the product"
            : "New products added to the special instruction entry";
          responseKey = updated ? "updatedProduct" : "savedProduct";

          const updatedProduct = existingCustomerInstruction.products.find(
            (prod) => prod.productId.toString() === products[0].productId.toString()
          );

          return res.status(200).json({
            message: responseMessage,
            customerID: customerId,
            storeID: storeId,
            products: {
              [responseKey]: updatedProduct,
            },
          });
        } else {
          return res.status(200).json({
            message: "No new products added or updates made",
            customerID: customerId,
            storeID: storeId,
            products: {
              savedProduct: existingCustomerInstruction.products.find(
                (prod) => prod.productId.toString() === products[0].productId.toString()
              ),
            },
          });
        }
      }
    } else {
      const newCustomerSpecialInstructionAlteration = new CustomerSpecialInstructionAlteration({
        storeId,
        customerId,
        products,
      });

      const savedCustomerSpecialInstructionAlteration = await newCustomerSpecialInstructionAlteration.save();

      orderStatus.specialIntructionAlterationID = savedCustomerSpecialInstructionAlteration._id;
      await orderStatus.save();

      return res.status(201).json({
        message: responseMessage,
        customerID: customerId,
        storeID: storeId,
        products: {
          savedProduct: savedCustomerSpecialInstructionAlteration.products[0],
        },
      });
    }
  } catch (error) {
    next(error);
  }
};




/************************  Working Now image Uploads ****************/
const Instruction_Image_Note_Voice = async (req, res) => {
  try {
    // Process file uploads
    let InstructionPhotoUrl = [];
    let InstructionNotesUrl = [];
    let InstructionVoiceUrl = [];

    if (req.files.InstructionPhoto && req.files.InstructionPhoto.length > 0) {
      const files = req.files.InstructionPhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      InstructionPhotoUrl.push(data);
    }

    if (req.files.InstructionNotes && req.files.InstructionNotes.length > 0) {
      const files = req.files.InstructionNotes;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      InstructionNotesUrl.push(data);
    }

    if (req.files.InstructionVoice && req.files.InstructionVoice.length > 0) {
      const files = req.files.InstructionVoice;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      InstructionVoiceUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      specialInstructions: [
        {
          instructionPhoto: InstructionPhotoUrl,
          instructionNotes: InstructionNotesUrl,
          instructionVoice: InstructionVoiceUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};



/**************************** Contrast Post Api **********************/
/********************************************************************/
const createCustomerContrast = async (req, res, next) => {
  const storeId = req.user.storeId;

  const { customerId, products } = req.body;
  if (!customerId) return next(new AppError("CustomerId is required!", 400));

  const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
  if (!findCustomer) return next(new AppError("No customer found!", 400));

  // Check if orderStatus already exists for the given customerId
  const orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });
  if (!orderStatus || !orderStatus.productID) return next(new AppError("Please add product first!", 400));

  if (orderStatus.constrastID) {
    const existingCustomerContrast = await CustomerContrast.findOne({ storeId, customerId });

    // Update the existing document with the new product data
    if (existingCustomerContrast) {
      let updated = false;
      let newCustomerContrast = false;

      // Loop through each product in the request
      for (const product of products) {
        const existingProductIndex = existingCustomerContrast.products.findIndex(cat => cat.productId.toString() === product.productId.toString());

        if (existingProductIndex === -1) {
          // If product doesn't exist, push the entire product object
          existingCustomerContrast.products.push(product);
          newCustomerContrast = true;
        } else {
          // If product exists, update its contrast
          existingCustomerContrast.products[existingProductIndex] = product;
          updated = true;
        }
      }

      if (updated || newCustomerContrast) {
        // Save the updated Contrast entry to the database
        await existingCustomerContrast.save();

        let message = '';
        if (updated && newCustomerContrast) {
          message = 'Contrast entry updated with existing and new products';
        } else if (updated) {
          message = 'Contrast entry updated with existing products';
        } else {
          message = 'New products added to the Contrast entry';
        }
        return res.status(200).json({ message, updated, newCustomerContrast, existingCustomerContrast });
      }
    }
  } else if (!orderStatus.constrastID) {
    // If not, create a new Contrast entry
    const newCustomerInstruction = new CustomerContrast({
      storeId,
      customerId,
      products,
    });

    const savedCustomerContrast = await newCustomerInstruction.save();

    // Update ORDER STATUS with the measurementID
    orderStatus.constrastID = savedCustomerContrast._id;
    await orderStatus.save();

    return res.status(201).json({ success: true, message: "Contrast saved successfully", orderStatus, savedCustomerContrast });
  }
};

/**************************** Contrast Style Images API ******************/
const ContrastImages = async (req, res) => {
  try {
    // Process file uploads
    let contrastPhotoUrl = [];

    if (req.files.contrastStylePhoto && req.files.contrastStylePhoto.length > 0) {
      const files = req.files.contrastStylePhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      contrastPhotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      specialContrast: [
        {
          contrastStylePhoto: contrastPhotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};


/*************************** Readymade Products ***************************/
const createCustomerReadymadeProduct = catchAsyncError(async (req, res, next) => {
  const storeId = req.user.storeId;
  const { customerId, products } = req.body;

  if (!customerId) {
    return next(new AppError("CustomerId is required!", 400));
  }

  const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
  if (!findCustomer) {
    return next(new AppError("No customer found!", 400));
  }

  const orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });

  if (orderStatus && orderStatus.readyMadeProductID) {
    const existingCustomerReadymadeProduct = await CustomerReadymadeProduct.findOne({ storeId, _id: orderStatus.readyMadeProductID });

    if (existingCustomerReadymadeProduct) {
      let updated = false;
      let newCustomerReadymadeProduct = false;

      for (const product of products) {
        const existingProductIndex = existingCustomerReadymadeProduct.products.findIndex(cat => cat.productNumber === product.productNumber);

        if (existingProductIndex === -1) {
          existingCustomerReadymadeProduct.products.push(product);
          newCustomerReadymadeProduct = true;
        } else {
          const existingProduct = existingCustomerReadymadeProduct.products[existingProductIndex];

          for (const size in product.Size) {
            existingProduct.Size[size] = (existingProduct.Size[size] || 0) + product.Size[size];
          }
          updated = true;
        }
      }

      if (updated || newCustomerReadymadeProduct) {
        await existingCustomerReadymadeProduct.save();
        const message = updated ? 'Readymade product entry updated with existing products' : 'New products added to the Readymade product entry';
        return res.status(200).json({ message, updated, newCustomerReadymadeProduct });
      }
    }
  }

  const newCustomerInstruction = new CustomerReadymadeProduct({
    storeId,
    customerId,
    products,
  });

  const savedCustomerReadymadeProduct = await newCustomerInstruction.save();

  if (orderStatus) {
    orderStatus.readyMadeProductID = savedCustomerReadymadeProduct._id;
    await orderStatus.save();
    return res.status(201).json({ status: true, message: "Readymade product added.", orderStatus: orderStatus, savedCustomerReadymadeProduct });
  } else {
    const saveOrderStatus = await QuickOrderStatus.create({ readyMadeProductID: savedCustomerReadymadeProduct._id, customerID: customerId, storeID: storeId })
    return res.status(201).json({ status: true, message: "Readymade product added.", orderStatus: saveOrderStatus, savedCustomerReadymadeProduct });
  }
});

/************************update quantity api******************************/
const updateCustomerReadymadeProduct = catchAsyncError(async (req, res, next) => {
  const storeId = req.user.storeId;
  const { customerId, productId, newSizeQuantity } = req.body;

  if (!customerId || !productId || !newSizeQuantity || Object.keys(newSizeQuantity).length === 0) {
    return next(new AppError("CustomerId, productId, and at least one newSizeQuantity are required!", 400));
  }

  const existingCustomerReadymadeProduct = await CustomerReadymadeProduct.findOne({ storeId, customerId, "products._id": productId });

  if (!existingCustomerReadymadeProduct) {
    return next(new AppError("No customer readymade product found!", 400));
  }

  const existingProduct = existingCustomerReadymadeProduct.products.find(product => product._id.toString() === productId);

  if (!existingProduct) {
    return next(new AppError("No product found with the given productId!", 400));
  }

  for (const size in newSizeQuantity) {
    if (newSizeQuantity[size] <= 0) {
      return next(new AppError("New size quantity must be greater than 0 for all sizes!", 400));
    }
    existingProduct.Size[size] = newSizeQuantity[size];
  }

  await existingCustomerReadymadeProduct.save();

  return res.status(200).json({ message: 'Readymade product updated successfully', updatedProduct: existingProduct });
});


/*************************** Readymade Accessories ***********************/
const createCustomerReadymadeAccessories = async (req, res) => {
  const storeId = req.user.storeId;
  const { customerId, accessories } = req.body;

  if (!customerId) {
    return next(new AppError("CustomerId is required!", 400));
  }

  const findCustomer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
  if (!findCustomer) {
    return next(new AppError("No customer found!", 400));
  }

  const orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });

  if (orderStatus && orderStatus.readyMadeAccessoriesID) {
    const existingCustomerReadymadeAccessories = await CustomerReadymadeAccessories.findOne({ storeId, _id: orderStatus.readyMadeAccessoriesID });

    if (existingCustomerReadymadeAccessories) {
      let updated = false;
      let newCustomerReadymadeAccessories = false;

      for (const product of accessories) {
        const existingProductIndex = existingCustomerReadymadeAccessories.accessories.findIndex(cat => cat.accessoriesNumber === product.accessoriesNumber);

        if (existingProductIndex === -1) {
          existingCustomerReadymadeAccessories.accessories.push(product);
          newCustomerReadymadeAccessories = true;
        } else {
          const existingProduct = existingCustomerReadymadeAccessories.accessories[existingProductIndex];
          existingProduct.Quantity = (existingProduct.Quantity || 0) + product.Quantity;
          updated = true;
        }
      }

      if (updated || newCustomerReadymadeAccessories) {
        await existingCustomerReadymadeAccessories.save();
        const message = updated ? 'Readymade accessories entry updated with existing accessories' : 'New accessories added to the Readymade accessories entry';
        return res.status(200).json({ message, updated, newCustomerReadymadeAccessories });
      }
    }
  }

  const newCustomerInstruction = new CustomerReadymadeAccessories({
    storeId,
    customerId,
    accessories,
  });

  const savedCustomerReadymadeAccessories = await newCustomerInstruction.save();

  if (orderStatus) {
    orderStatus.readyMadeAccessoriesID = savedCustomerReadymadeAccessories._id;
    await orderStatus.save();
    return res.status(201).json({ status: true, message: "Readymade product added.", orderStatus: orderStatus, savedCustomerReadymadeAccessories });
  } else {
    const saveOrderStatus = await QuickOrderStatus.create({ readyMadeAccessoriesID: savedCustomerReadymadeAccessories._id, customerID: customerId, storeID: storeId })
    return res.status(201).json({ status: true, message: "Readymade product added.", orderStatus: saveOrderStatus, savedCustomerReadymadeAccessories });
  }
};


/*******************update quantity api******************/
const updateCustomerReadymadeAccessories = catchAsyncError(async (req, res, next) => {
  const storeId = req.user.storeId;
  const { customerId, accessoriesId, newQuantity } = req.body;

  if (!customerId || !accessoriesId || newQuantity === undefined || newQuantity < 1) {
    return next(new AppError("CustomerId, accessoriesId, and valid newQuantity greater than 0 are required!", 400));
  }

  const existingCustomerReadymadeAccessories = await CustomerReadymadeAccessories.findOne({
    storeId,
    customerId,
    "accessories._id": accessoriesId,
  });

  if (!existingCustomerReadymadeAccessories) {
    return next(new AppError("No customer readymade accessories found!", 400));
  }

  const existingAccessory = existingCustomerReadymadeAccessories.accessories.find(
    (accessory) => accessory._id.toString() === accessoriesId
  );

  if (!existingAccessory) {
    return next(new AppError("No accessory found with the given accessoriesId!", 400));
  }

  existingAccessory.Quantity = newQuantity;

  if (existingAccessory.Quantity < 1) {
    return next(new AppError("New quantity must be greater than 0!", 400));
  }

  await existingCustomerReadymadeAccessories.save();

  return res.status(200).json({
    message: 'Readymade accessories updated successfully',
    updatedAccessory: existingAccessory,
  });
});


/*********************************** Bill And Invoice ***********************/
const createCustomerInvoice = catchAsyncError(async (req, res, next) => {
  const storeId = req.user.storeId;
  const { customerId, CustomersSection, CoastSection } = req.body;

  const customer = await OfflineCustomerB2C.findOne({ storeId, _id: customerId });
  if (!customer) return next(new AppError("No customer found!", 400));

  // Add storeId to the request body
  req.body.storeId = storeId;
  const orderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, status: false });

  if (!orderStatus || (!orderStatus.readyMadeProductID && !orderStatus.readyMadeAccessoriesID && !orderStatus.productID && !orderStatus.ProductAlterationID)) {
    return next(new AppError("At least add customize or ready-made product.", 400));
  }
  // if (!orderStatus.readyMadeProductID && !orderStatus.readyMadeAccessoriesID) {
  //   // if (orderStatus.productID && (!orderStatus.measurementID)) {
  //// if (orderStatus.productID ) {
  //     return next(new AppError("Products must be present with Customize Product", 400));
  //   }
  // }
  const data = {
    customerId,
    storeId,
    CustomersSection,
    CoastSection,
    OrderSection: [],
  }
  if (orderStatus.productID) {
    data.OrderSection.push({
      CustomizedProduct: {
        productId: orderStatus.productID,
      },
    });
  }
  if (orderStatus.ProductAlterationID) {
    data.OrderSection.push({
      CustomizedProduct: {
        ProductAlterationID: orderStatus.ProductAlterationID,
      },
    });
  }
  if (orderStatus.readyMadeProductID) {
    data.OrderSection.push({
      ReadymadeProduct: {
        readymadeProductId: orderStatus.readyMadeProductID,
      },
    });
  }
  if (orderStatus.readyMadeAccessoriesID) {
    data.OrderSection.push({
      ReadymadeAccessories: {
        accessorieId: orderStatus.readyMadeAccessoriesID,
      },
    });
  }

  const newInvoice = new CustomerInvoice(data);
  const savedInvoice = await newInvoice.save();
  orderStatus.billInvoiceID = savedInvoice._id;
  orderStatus.save();

  res.status(201).json({ status: true, message: "Bill invoice successfull", orderStatus, savedInvoice });
});

/****************Search Customer By Order Numnber(not main)********************/
const searchCustomerByOrderNumnber = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;

  // Check if order number is provided
  const { search } = req.query;
  const orderNumber = parseInt(search);

  if (isNaN(orderNumber)) {
    return next(new AppError("OrderNumber is required and must be a valid number.", 400));
  }

  // Search Service
  const pipeline = await CustomerService.searchServiceByOrderNumber(req.query, storeId);
  console.log("Aggregation Pipeline:", pipeline);
  const existingDetails = await QuickOrderStatus.aggregate(pipeline);
  console.log("Aggregation Result:", existingDetails);

  if (!existingDetails || existingDetails.length === 0) {
    return next(new AppError("Customer not found with the provided OrderNumber and storeId.", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Customer found successfully!",
    customerDetails: existingDetails,
  });
});


const getCustomerListing = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  function getOrderNumber(orderStatusArray, customerId) {
    const order = orderStatusArray.find(order => order.customerID === customerId);
    return order ? order.orderNumber : null;
  }
  function getmarkedStatus(orderStatusArray, customerId) {
    const order = orderStatusArray.find(order => order.customerID === customerId);
    return order ? order.markedStatus : null;
  }

  function getProductID(orderStatusArray, customerId) {
    const order = orderStatusArray.find(order => order.customerID === customerId);
    return order ? order.productID : null;
  }
  const orderStatus = await QuickOrderStatus.find({
    storeID: storeId, orderNumber: { $exists: true },
    $or: [
      { activeStatus: { $exists: false } }, // Include documents without activeStatus field
      { activeStatus: true } // Include documents with activeStatus set to true
    ]
  })
    .sort({ orderNumber: -1 });
  const orderStatusOnlineB2C = await QuickOrderStatusOnline.find({ storeID: storeId, orderNumber: { $exists: true } })
    .sort({ orderNumber: -1 });

  const uniqueOfflineCustomerIds = orderStatus.map(order => order.customerID);
  const uniqueOnlineCustomerIds = orderStatusOnlineB2C.map(order => order.customerID);
  const customerDetails = [];

  for (const customerId of uniqueOfflineCustomerIds) {
    const customer = await OfflineCustomerB2C.findById(customerId);
    const productId = await getProductID(orderStatus, customerId)
    const products = await CustomerProduct.findById(productId);
    if (customer) {
      const customerWithOrderNumber = { ...customer._doc, orderNumber: getOrderNumber(orderStatus, customerId), markedStatus: getmarkedStatus(orderStatus, customerId), type: "Offline", products };
      customerDetails.push(customerWithOrderNumber);
    }
  }

  for (const customerId of uniqueOnlineCustomerIds) {
    const customer = await OnlineCustomer.findById(customerId);
    const productId = await getProductID(orderStatusOnlineB2C, customerId)
    const products = await CustomerProductOnline.findById(productId);
    if (customer) {
      const customerWithOrderNumber = { ...customer._doc, orderNumber: getOrderNumber(orderStatusOnlineB2C, customerId), type: "Online", products };
      customerDetails.push(customerWithOrderNumber);
    }
  }

  return res.status(200).json({ success: true, message: "Customers found successfully.", customerDetails });
});



// /****************Search Customer By Order Numnber(main)********************/

const orderDetailsByOrderNumnber = catchAsyncError(async (req, res, next) => {
  try {
    const { storeId } = req.user;
    const { type, orderNumber, customerId } = req.query;


    // if (!type || (!orderNumber && !customerId)) {
    //   throw new AppError("Type and OrderNumber or customerId are required.", 400);
    // }

    const matchQuery = {
      storeID: mongoose.Types.ObjectId(storeId),
      // ...(orderNumber && { orderNumber: parseInt(orderNumber) }),
      ...(orderNumber && { orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') } }),
      ...(customerId && { customerID: mongoose.Types.ObjectId(customerId) }),
    };

    const serviceFunction = type === "Offline"
      ? CustomerService.searchServiceByOrderNumber
      : CustomerService.searchOnlineOrdersByOrderNumber;
    console.log(serviceFunction, "...........service function........")
    const pipeline = await serviceFunction(matchQuery);
    console.log(pipeline, "...........pipeline........")
    const schemaToAggregate = (type === "Offline") ? QuickOrderStatus : QuickOrderStatusOnline;
    console.log(schemaToAggregate, "...........schemaToAggregate........")

    const existingDetails = await schemaToAggregate.aggregate(pipeline);
    console.log(existingDetails, "...........existingDetails........")

    // if (existingDetails.length === 0) {
    //   throw new AppError("Customer not found with the provided search keyword and storeId.", 400);
    // }

    return res.status(200).json({
      success: true,
      message: "Customer found successfully!",
      customerDetails: existingDetails,
    });

  } catch (error) {
    next(error);
  }
});

/**********************Active Inactive Order Status************************/
const toggleOrderActiveStatus = catchAsyncError(async (req, res, next) => {
  const storeId = req.user.storeId;
  const { customerId, productId, type } = req.body;
  if (!type) return next(new AppError("Please define type online or offline!", 400));
  let quickOrderStatus
  if (type === "offline") {
    quickOrderStatus = await QuickOrderStatus.findOne({ storeID: storeId, customerID: customerId, productID: productId });
  }
  if (type === "online") {
    quickOrderStatus = await QuickOrderStatusOnline.findOne({ storeID: storeId, customerID: customerId, productID: productId });
  }

  if (!quickOrderStatus) return next(new AppError(" Order Not Found!", 400));

  quickOrderStatus.activeStatus = !quickOrderStatus.activeStatus;

  await quickOrderStatus.save();

  res.status(200).json({ success: true, message: 'Active status toggled successfully' });

});



/*****************************************************************************/
/*****************************************************************************/



/************************** Get Inactive Order data ***********************/
const getInActiveQuickOrdersWithAggregation = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 4;
  const { pipeline, countPipeline } = await CustomerService.InactiveOrdersPipelineService(storeId, page, limit);

  //   $lookup: {
  //     from: "customermesurments",
  //     localField: "measurementID",
  //     foreignField: "_id",
  //     as: "measurementData",
  //   },
  // },ersPipelineService(storeId, page, limit)


  const inactiveOrders = await QuickOrderStatus.aggregate(pipeline)

  const countResult = await QuickOrderStatus.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResults = {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, totalCount),
  };
  if (!inactiveOrders) return next(new AppError("No inactive customers found.", 400));

  res.status(200).json({
    status: true,
    message: inactiveOrders.length > 0 ? "Inactive orders found successfully" : "No active orders found",
    totalCount,
    page,
    showingResults,
    data: inactiveOrders
  })
})

/**************************** My Order Data (main, main,main,main) **************************/
const getCustomerListing1 = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  const query = req.query;
  const { active, status, qcstatus, fromDate, toDate, inProgress } = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  // let matchQuery = {
  //   $match: {
  //     orderNumber: { $exists: true }
  //   }
  // };
  // if (query.orderId) {
  //   matchQuery._id = ObjectId(query.orderId);
  // } else {
  //   matchQuery = { storeID: mongoose.Types.ObjectId(storeId) };
  //   matchQuery.activeStatus = active == "false" ? false : true;
  //   matchQuery.status = status == "false" ? false : true;
  // }

  let matchQuery = {
    orderNumber: { $exists: true }
  };
  if (query.orderId) {
    matchQuery._id = ObjectId(query.orderId);
  } else {
    matchQuery.storeID = mongoose.Types.ObjectId(storeId);
    matchQuery.activeStatus = active == "false" ? false : true; // Include activeStatus condition
    if (status === undefined) {
      // If status is not provided in query, retrieve both true and false status data
      matchQuery.status = { $in: [true, false] };
    } else {
      matchQuery.status = status == "false" ? false : true;
    }
    // Add QCStatus filter if qcstatus query is provided
    if (qcstatus) {
      matchQuery["QCStatus.status"] = qcstatus;
    }
    if (inProgress) {
      matchQuery.markedStatus = "Completed";
      matchQuery["QCStatus.status"] = "InProgress";
      matchQuery["$or"] = [
        { "cutterStatus.status": "InProgress" },
        { "mastertailorStatus.status": "InProgress" }
      ];
    }
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
  }

  console.log(matchQuery, "maqtchQuery........................")


  const OfflinePipeline = await CustomerService.searchQuickOrderServiceWithPagination(matchQuery, page, limit)
  if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const OnlinePipeline = await CustomerService.searchOnlineOrdersServiceWithPagination(matchQuery, page, limit)

  if (!OnlinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const offlineCustomers = await QuickOrderStatus.aggregate(OfflinePipeline.pipeline)
  const onlineCustomers = await QuickOrderStatusOnline.aggregate(OnlinePipeline.pipeline)

  const countResultOffline = await QuickOrderStatus.aggregate(OfflinePipeline.countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(OnlinePipeline.countPipeline);

  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;


  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);
  console.log("totalCount of offline and online")
  return res.status(200).json({
    success: true,
    message: "Online and Offline customers found successfully.",
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineCustomers,
    onlineCustomers
  })
});

/************************ After Order Complication Processs (For All Workers) ******************/
/*****************************************************************************/
const updateCutterStatus = catchAsyncError(async (req, res, next) => {
  const { storeId, _id, role, name } = req.user;
  console.log("......role.......", role)
  // const { id, productNumber } = req.params;
  const { status, problem, problemStatements, id, productId, workVideo, workPhoto } = req.body;
  let savedOrderStatus;

  try {
    if (problemStatements && role != 'cutter' && (!workPhoto || !workPhoto)) {
      return next(new AppError("Worke video and worker photo is required when problem occurs.", '404'));
    } else if (status === "Completed" && role != "cutter" && (!workPhoto || !workPhoto)) {
      return next(new AppError("Worke video and worker photo for mastertailor", '404'));
    }
    const getOrder = async () => {
      const offlineOrder = await QuickOrderStatus.findById(id);
      const onlineOrder = await QuickOrderStatusOnline.findById(id);

      if (offlineOrder) {
        return { targetOrder: offlineOrder, type: "Offline" };
      } else if (onlineOrder) {
        return { targetOrder: onlineOrder, type: "Online" };
      } else {
        return null; // Or you can throw an error here if necessary
      }
    };

    const { targetOrder, type } = await getOrder();
    console.log({status, role, problemStatements})
    // Use the service functions
    // const targetProduct = await orderService.getProduct(targetOrder, productId, next);
    let data = {};
    if (status === "InProgress" && role === "cutter") {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type }
    } else if ((status === 'Completed' && role != 'cutter') || (problemStatements && role != 'cutter')) {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type, workVideo, workPhoto }
    } else if (status === 'Completed' && role == 'cutter') {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type }
    } else if (status === 'InProgress' && role != 'cutter') {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type, workVideo, workPhoto }
    }
    // console.log("dataaaaaa", data)
    // if (role === "cutter") {
    //   await orderService.checkAndUpdateStatus(data);
    // } else if (role === "mastertailor") {

    //   await orderService.checkAndUpdateStatus(data);
    // } else {
    //   throw new Error('Invalid Role or Cutting status is not completed yet.');
    // }
    await orderService.checkAndUpdateStatus(data);

    savedOrderStatus = await targetOrder.save();
    return res.status(200).json({ message: 'Order updated successfully', updatedOrder: savedOrderStatus });
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    return next(new AppError(error.message, 404));
  }
});

/******************** All Cutter NotAssigned Data ************************/
const getCustomerListing1ForWorker = catchAsyncError(async (req, res, next) => {
  const { storeId, role } = req.user;
  console.log(".......role........", role)
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;

  const OfflinePipeline = await CustomerService.searchQuickOrderServiceWithPaginationForCutter(query, storeId, page, limit, role)
  if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const OnlinePipeline = await CustomerService.searchOnlineOrdersServiceWithPaginationForCutter(query, storeId, page, limit, role)

  if (!OnlinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const offlineCustomers = await QuickOrderStatus.aggregate(OfflinePipeline.pipeline);


  const onlineCustomers = await QuickOrderStatusOnline.aggregate(OnlinePipeline.pipeline);

  const countResultOffline = await QuickOrderStatus.aggregate(OfflinePipeline.countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(OnlinePipeline.countPipeline);

  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online and Offline customers found successfully.",
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineCustomers: offlineCustomers,
    onlineCustomers: onlineCustomers,
  });
});


/************* Specific Cutter Inprogress and Completed Data *************/
const getCustomerOrderStatusForCutter = catchAsyncError(async (req, res, next) => {
  const { storeId, id, role } = req.user;
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;

  const OfflinePipeline = await CustomerService.searchOrderStatusServiceWithPaginationForCutter(query, storeId, page, limit, id, role)
  // console.log(".......OfflinePipeline........",OfflinePipeline)
  if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const OnlinePipeline = await CustomerService.searchOnlineOrderStatusServiceForCutter(query, storeId, page, limit, id, role)

  if (!OnlinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const offlineCustomers = await QuickOrderStatus.aggregate(OfflinePipeline.pipeline);


  const onlineCustomers = await QuickOrderStatusOnline.aggregate(OnlinePipeline.pipeline);


  const countResultOffline = await QuickOrderStatus.aggregate(OfflinePipeline.countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(OnlinePipeline.countPipeline);

  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online and Offline customers found successfully.",
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineCustomers,
    onlineCustomers,
  });
});

//**********************Not Assigned********************/
const notAssigned = catchAsyncError(async (req, res, next) => {
  const { storeId, role } = req.user;
  const { orderId } = req.body;

  const getOrder = async () => {
    return await QuickOrderStatus.findById(orderId) || await QuickOrderStatusOnline.findById(orderId)
  }
  const targetOrder = await getOrder();
  let products = [];
  if (role === "cutter") {
    const notAssignedProductIds = targetOrder.notAssignedProductIds;
    for (const item of notAssignedProductIds) {
      const product = await orderService.getProduct(targetOrder, item.productId);
      if (product) {
        products.push(product);
      }
    }
  } else if (role === "mastertailor") {
    const aligned = targetOrder.aligned;
    for (const item of aligned) {
      if (item.alignedTo === "cutter" && item.alignedStatus === true) {
        console.log(JSON.stringify(targetOrder))
        const product = await orderService.getProduct(targetOrder, item.productId);
        if (product) {
          products.push(product);
        }
      }
    }
  } else if (role === "QC") {
    const aligned = targetOrder.aligned;
    for (const item of aligned) {
      if (item.alignedTo === "mastertailor" && item.alignedStatus === true) {
        const product = await orderService.getProduct(targetOrder, item.productId);
        if (product) {
          products.push(product);
        }
      }
    }
  }
  res.status(200).json({
    status: true,
    message: "Not assigned orders.",
    role,
    count: products.length,
    products
  });
})


//**********************Inprogress , Completed*****Joi Added***************/
const myOrdersForWorker = catchAsyncError(async (req, res, next) => {
  const { storeId, role } = req.user;
  const { orderId, status } = req.body;

  const getOrder = async () => {
    return await QuickOrderStatus.findById(orderId) || await QuickOrderStatusOnline.findById(orderId)
  }
  const targetOrder = await getOrder();
  let productsDetails = [];
  const workerOrders = targetOrder[`${role}Status`];
  for (const item of workerOrders) {
    console.log(item.productId)
    if (item.status === status) {
      const productData = await CustomerProduct.findById(targetOrder.productID);
      const flag = productData?.product?.some(product => product?._id?.toString() === item.productId?.toString());
      const product = await orderService.getProductDetailsService(targetOrder, item.productId, flag);
      if (product) {
        productsDetails.push(product);
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "Orders.",
    role,
    myOrderStatus: status,
    count: productsDetails.length,
    productsDetails
  });
})


/****************************OrderListing Worker Data **************************/
const orderListingforWorkers = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  const query = req.query;
  const { active } = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;

  let matchQuery = {};
  if (query.orderId) {
    matchQuery._id = ObjectId(query.orderId);
  } else {
    matchQuery = { storeID: mongoose.Types.ObjectId(storeId) };
    matchQuery.activeStatus = active == "false" ? false : true;
  }
  const OfflinePipeline = await CustomerService.offlineOrderListingServiceWorker(matchQuery, page, limit)
  if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const OnlinePipeline = await CustomerService.onlineOrderListingServiceWorker(matchQuery, page, limit)

  if (!OnlinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

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
    message: "Online and Offline customers found successfully.",
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineCustomers,
    onlineCustomers
  })
});


const orderDetailsByOrderNumberTest = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  const { type, orderNumber, customerId } = req.query;

  let lookupKeywords = [];
  let dynamicAddFields;

  const projectionFields = {
    quickOrderStatus: 1,
    productData: { product: 1 },
    measurementData: { products: 1 },
    contrastData: { products: 1 },
    specialInstructionData: { products: 1 },
    readymadeProductData: { products: 1 },
    readymadeAccessoriesData: { accessories: 1 },
    customerData: "$customerData",
  };

  // Set dynamicAddFields and lookupKeywords based on type
  if (type === 'Offline') {
    dynamicAddFields = {
      quickOrderStatus: {
        storeID: '$storeID',
        orderNumber: '$orderNumber',
        status: '$status',
        markedStatus: '$markedStatus',
      },
    };
    lookupKeywords = ['offlinecustomerb2cs', 'customerproducts', 'customermesurments', 'customercontrasts', 'customerspacialinstructions', 'customerreadymadeproducts', 'customerreadymadeaccessories'];
  } else {
    dynamicAddFields = {
      quickOrderStatus: {
        storeID: '$storeID',
        orderNumber: '$orderNumber',
        status: '$status',
        markedStatus: '$markedStatus',
      },
    };
    lookupKeywords = ['onlinecustomers', 'customerproductonlines', 'customermesurmentonlines', 'customersplinstructiononlines', 'customercontrastonlines', 'customerreadymadeproductonlines', 'customerreadymadeaccessoriesonlines'];
  }

  const matchQuery = {
    storeID: mongoose.Types.ObjectId(storeId),
    ...(orderNumber && { orderNumber: Number(orderNumber) }),
    ...(customerId && { customerID: mongoose.Types.ObjectId(customerId) }),
  };

  const { pipeline } = CommonServices.commonLoopkupPipelineService(lookupKeywords, matchQuery, {}, projectionFields, dynamicAddFields);

  // Choose schema based on type
  const schemaToAggregate = (type === "Offline") ? QuickOrderStatus : QuickOrderStatusOnline;

  const existingDetails = await schemaToAggregate.aggregate(pipeline);

  return res.status(200).json({
    success: true,
    message: "Customer found successfully!",
    customerDetails: existingDetails,
  });

});


const deleteProductDetails = catchAsyncError(async (req, res, next) => {
  const { itemId, orderId, arrayName } = req.body;
  const order = await QuickOrderStatus.findById(orderId);
  if (!order) return next(new AppError('Order not found.', '404'));

  const product = await CustomerProduct.findById(order.productID);
  const measurement = await CustomerMesurment.findById(order.measurementID);
  const contrast = await CustomerContrast.findById(order.constrastID);
  const specialInstruction = await CustomerSplInstruction.findById(order.specialIntructionID);

  const itemsToUpdate = [];
  if (arrayName === 'customerProduct') {
    product && itemsToUpdate.push(product);
    measurement && itemsToUpdate.push(measurement);
    contrast && itemsToUpdate.push(contrast);
    specialInstruction && itemsToUpdate.push(specialInstruction);
  } else if (arrayName === 'customerMeasurement') {
    measurement && itemsToUpdate.push(measurement);
  } else if (arrayName === 'customerContrast') {
    contrast && itemsToUpdate.push(contrast);
  } else if (arrayName === 'customerSpecialInstruction') {
    specialInstruction && itemsToUpdate.push(specialInstruction);
  }


  if (order.status === false) {
    // Delete categories based on itemId
    itemsToUpdate.forEach(item => {
      if (item.product) {
        //Delete Product
        item.product = item.product.filter(item => item._id.toString() !== itemId);
        item.product.forEach(product => {
          //Delete Categories
          product.categories = product.categories.filter(item => item._id.toString() !== itemId);
          product.categories.forEach(category => {
            //Delete Styles
            category.styles = category.styles.filter(item => item._id.toString() !== itemId);
          });
        });
      } else if (item.products) {
        item.products = item.products.filter(item => item.productId.toString() !== itemId);
        item.products.forEach(product => {
          // return console.log(product, "......check.....")
          // Delete Special Instructions
          if (product.specialInstructions) {
            product.specialInstructions = product.specialInstructions.filter(instruction => instruction._id.toString() !== itemId);
          }
          // Delete measurements
          if (product.mesurments) {
            product.mesurments = product.mesurments.filter(mesurment => mesurment._id.toString() !== itemId);
          }
          // Delete Categories
          if (product.categories) {
            product.categories = product.categories.filter(item => item._id.toString() !== itemId);
            product.categories.forEach(category => {
              //Delete styles
              if (category.styles)
                category.styles = category.styles.filter(item => item._id.toString() !== itemId);
            });
          }
        });
      }
    });

  }

  await Promise.all(itemsToUpdate.map(item => item.save()));

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});


/***********Worker InProgress and Completed products Listing (For All Workers)************** */
const workerCompletedProductsListing = catchAsyncError(async (req, res, next) => {
  const { id } = req.user;
  const query = req.query;
  const { status } = req.query
  const page = req.query.page || 1;
  let lookupKeywords = [];
  let dynamicAddFields;

  const projectionFields = {
    quickOrderStatus: 1,
    quickOrderStatusonline: 1,
    WorkerInfo: 1,
    createdAt: -1,
  };

  dynamicAddFields = {
    WorkerInfo: {
      storeId: '$storeId',
      orderStatus: '$orderStatus',
      productId: '$productId',
      problem: '$problem',
      workVideo: '$workVideo',
      workPhoto: '$workPhoto',
      role: '$role',
      workerId: '$workerId',
      type: '$type',
    },
  };
  lookupKeywords = ['quickorderstatuses', 'quickorderstatusonlines'];
  // const matchQuery = {
  //   workerId: mongoose.Types.ObjectId(id),
  // };
  const matchQuery = {
    workerId: mongoose.Types.ObjectId(id),
    ...(status && { orderStatus: status === 'false' ? false : true }),
  };

  // console.log(matchQuery, 'matchQuery......................')

  const { pipeline, countPipeline } = CommonServices.commonLoopkupPipelineService(lookupKeywords, matchQuery, query, projectionFields, dynamicAddFields);

  // console.log(JSON.stringify(pipeline))

  // let myOrders = await WorkerLogs.aggregate(pipeline);
  let myOrders = await WorkerLogs.aggregate(pipeline);

  console.log(JSON.stringify(myOrders), "JSON.stringify(myOrders).............................................")
  // console.log(myOrders.length, 'length................................')
  const filteredOrders = [];
  for (let item of myOrders) {
    const productId = item.WorkerInfo.productId;
    const productDetails = await CustomerProduct.findById(item?.quickOrderStatus[0]?.productID);
    const flag = productDetails?.product?.some(product => product?._id?.toString() === item?.WorkerInfo?.productId?.toString());
    const productData = await orderService.getProductDetailsService(item?.quickOrderStatus[0] || item?.quickOrderStatusonline[0], productId, flag);
    //Temporary product details only
    // const products = item?.WorkerInfo?.type === "Offline" ? await CustomerProduct.find({ _id: ObjectId(item?.quickOrderStatus[0].productID) }) : await CustomerProductOnline.find({ _id: ObjectId(item?.quickOrderStatus[0].productID) });
    // const productData = products[0]?.product.find(product => product?._id.toString() === productId.toString());
    if (productData && productData.length !== 0) {
      item.productData = productData;
      filteredOrders.push(item);
    }
    // if (type === "Offline") {
    //   item.offlineProducts = dataArray
    // } else {
    //   item.onlineProducts = dataArray;
    // }
  }
  console.log("jnhfjhfejuhguihguighguiehuidfhs")
  // const countResult = await WorkerLogs.aggregate(countPipeline);
  // console.log(countResult, 'countResult...................')
  // let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  const totalCount = filteredOrders.length;
  console.log(totalCount, 'totalCount...................')

  const showingResult = CommonServices.showingResults(query, totalCount)
  console.log(showingResult, 'showingResult...................')

  return res.json({
    success: true,
    message: filteredOrders.length > 0 ? "Orders found successfully" : "No orders found",
    totalCount,
    page,
    showingResult,
    count: filteredOrders.length,
    myOrders
  })
})


/***************Not Assigned all products (For All Workers)**************************/
const workerNotAssignedProductsListing = catchAsyncError(async (req, res, next) => {
  const { role, storeId } = req.user;
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  dynamicAddFields = {};
  lookupKeywords = [];
  const matchQuery = OthersService.getNotAssignedMatchquery(role, storeId);
  console.log(JSON.stringify(matchQuery), 'matchQuery....................')
  const { pipeline, countPipeline } = CommonServices.commonPipelineService(matchQuery, query);
  console.log(JSON.stringify(pipeline), 'pipeline..................')
  let offlineOrders = await QuickOrderStatus.aggregate(pipeline);
  // console.log(JSON.stringify(offlineOrders), "JSON.stringify(offlineOrders).................")
  let onlineOrders = await QuickOrderStatusOnline.aggregate(pipeline);
  // console.log(JSON.stringify(onlineOrders), "JSON.stringify(onlineOrders).................")
  const offlineNotAssignedProductData = await OthersService.notAssignedProductsforWorkers(offlineOrders, role)
  const onineNotAssignedProductData = await OthersService.notAssignedProductsforWorkers(onlineOrders, role)

  const cleanedOnlineNotAssignedProductData = onineNotAssignedProductData.filter(item => item && (!Array.isArray(item) || item.length > 0))
  const cleanedOfflineNotAssignedProductData = offlineNotAssignedProductData.filter(item => item && (!Array.isArray(item) || item.length > 0))

  // console.log(onineNotAssignedProductData, "onineNotAssignedProductData.................")

  const countResultOffline = await QuickOrderStatus.aggregate(countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(countPipeline);

  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  // Assuming you want the maximum total pages between online and offline customers
  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online and Offline not assigned products found successfully.",
    role,
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineNotAssignedProductData: cleanedOfflineNotAssignedProductData,
    onineNotAssignedProductData: cleanedOnlineNotAssignedProductData
  })
})


/****************** Qc Pass,Fail Logs (For QC )**************************/
const qcPassFailSurvey = catchAsyncError(async (req, res, next) => {
  const { storeId, _id, role } = req.user;
  const { qcLog, customerId, orderId, productId, productNumber } = req.body;
  console.log({qcLog, customerId, orderId, productId, productNumber})
  if (!qcLog || !customerId || !orderId || !productId || !productNumber) {
    return next(new AppError("All fields are required", 400));
  }

  const { targetOrder } = await orderService.getOrderTypeService(orderId);
  if (!targetOrder) {
    return next(new AppError("Order not found", 404));
  }

  const checkQCAlingned = targetOrder.aligned.find(item => item.productId.toString() === productId && item.alignedTo === "QC");
  if (!checkQCAlingned) {
    return next(new AppError("Product is not aligned to QC.", 400));
  }

  const reAlignedIndex = targetOrder.reAligned.findIndex(item =>
    item.reAlignedStatus && item.productId.toString() === productId && item.reAlignedTo === "mastertailor"
  );
  if (reAlignedIndex !== -1) {
    return next(new AppError("Product is already realigned", 400));
  }

  const { stylesPercentage, measurementsPercentage, contrastStylesPercentage, overallPercentage } =
    orderService.calculateQcCheckAllPercentages(qcLog);
  Object.assign(qcLog, { stylesPercentage, measurementsPercentage, contrastStylesPercentage, overallPercentage });
  qcLog.productCheckStatus = overallPercentage >= 70;

  if (!qcLog.productCheckStatus) {
    const mastertailor = targetOrder.mastertailorStatus.find(item => item.productId.toString() === productId);
    if (!mastertailor) {
      return next(new AppError("Mastertailor log not found", 400));
    }

    qcLog.reAlign = {
      masterTailorName: mastertailor.workerName,
      masterTailorId: mastertailor.workerId,
      role: "mastertailor"
    };

    targetOrder.reAligned.push({
      workerId: mastertailor.workerId,
      workerName: mastertailor.workerName,
      productId,
      reAlignedTo: "mastertailor",
      reAlignedStatus: true
    });
    await targetOrder.save();
  }

  const logData = { qcLog, customerId, orderId, productId, productNumber, workerId: _id, storeId, role, type: targetOrder.type };
  const savedWorkerLog = await new WorkerLogs(logData).save();

  const reAlignedIndexQC = targetOrder.reAligned.findIndex(item =>
    item.reAlignedStatus && item.productId === productId && item.reAlignedTo === "QC"
  );
  if (reAlignedIndexQC !== -1) {
    targetOrder.reAligned[reAlignedIndexQC].reAlignedStatus = false;
  }
  if (!qcLog.productCheckStatus) {
    res.status(201).json({ success: true, message: "Product quality failed and realigned to masterTailor", orderInfo: targetOrder, savedWorkerLog });
  } else {
    res.status(201).json({ success: true, message: "Product quality passed. Now mark complete to the product.", orderInfo: targetOrder, savedWorkerLog });
  }
});


/********************** Master Get Failed Listing (For Qc ) main**********/
/**************** *****************/
const masterTailorFailedListing = catchAsyncError(async (req, res, next) => {
  const { _id, role } = req.user;
  const { type } = req.query;
  const OrderModel = type === "online" ? QuickOrderStatusOnline : QuickOrderStatus;
  const offlineReAlined = await orderService.findRealignedProductsService(role, req.query, OrderModel);
  let productDetails = [];

  if (offlineReAlined.length > 0) {
    for (const log of offlineReAlined) {
      for (const item of log.reAligned) {
        const product = await orderService.getProductDetailsService(log, item.productId);
        if (product) {
          const WorkerInfo = {
            storeId: log.storeId,
            orderStatus: log.status,
            productId: item.productId,
            problem: log.problem,  // Assuming log has a problem field, adjust as needed
            workVideo: log.workVideo,  // Assuming log has a workVideo field, adjust as needed
            workPhoto: log.workPhoto,  // Assuming log has a workPhoto field, adjust as needed
            role: role,
            qcLog: log.qcLog,
            workerId: _id,
            type: type === "online" ? "Online" : "Offline",
          };

          productDetails.push({ product, ordeInfo: log, WorkerInfo });
        }
      }
    }
  }

  return res.status(200).json({
    success: true,
    type: type === 'online' ? 'online' : 'offline',
    message: productDetails.length > 0 ? "Failed product found" : "No failed product found",
    productDetails
  });
});

/****************** Update(Pass/Fail Data) ( For Realign agin to Qc ) *****************************/
const updateRealignByMastertailor = catchAsyncError(async (req, res, next) => {
  const { storeId, _id, role } = req.user;
  const { orderId, productId } = req.body;
  if (!orderId || !productId) {
    return next(new AppError("All fields are required", 400));
  }

  const { targetOrder } = await orderService.getOrderTypeService(orderId);
  if (!targetOrder) {
    return next(new AppError("Order not found", 404));
  }

  const reAlignedIndex = targetOrder.reAligned.findIndex(item =>
    item.reAlignedStatus && item.productId.toString() === productId && item.reAlignedTo === "mastertailor"
  );
  if (reAlignedIndex !== -1) {
    targetOrder.reAligned[reAlignedIndex].reAlignedStatus = false;
  }
  const qcStatusIndex = targetOrder.QCStatus.findIndex(item => item.productId.toString() === productId);
  if (qcStatusIndex !== -1) {

    targetOrder.reAligned.push({
      workerId: targetOrder.QCStatus[qcStatusIndex].workerId,
      workerName: targetOrder.QCStatus[qcStatusIndex].workerName,
      productId,
      reAlignedTo: "QC",
      reAlignedStatus: true
    });
  }

  await targetOrder.save();

  res.status(201).json({ success: true, message: "ReAlign status updated succesfully.", orderInfo: targetOrder });
})



/****************************** Delivery Section (Send Otp to Customer)*************************/
const createDeliveryOtp = catchAsyncError(async (req, res, next) => {
  const { mobileNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);

  // Save the OTP without checking for type
  await OTPDelivery.create({ mobileNumber, otp: hashedOTP });

  // Use a generic message since type logic is removed
  const message = `Your OTP for the service is: ${otp}. Visit https://www.lovoj.com/`;

  // Use a generic template ID
  const templateId = process.env.SERVICE_OTP_AWS_TEMPLATE_ID;

  const success = await sendSMS(
    message,
    `91${mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    templateId
  );

  if (!success) {
    return next(new AppError("Failed to send OTP.", 500));
  }

  console.log(`OTP sent to ${mobileNumber}: ${otp}`);

  return res.status(200).json({ success: true, message: "Service OTP sent to mobile number" });
});



/****************** Admin Delivery Api Update Pending Amount Also **************/
/*******************************************************************************/

// const updateDeliveryStatus = catchAsyncError(async (req, res) => {
//   const { storeID, customerID, productID, readyMadeProductID, productIds, ProductAlterationID, deliveryStatus, invoiceID, pendingAmount } = req.body;

//   // Validation
//   if (!storeID || !customerID || !deliveryStatus || !invoiceID) {
//     return res.status(400).json({ message: 'All required fields: storeID, customerID, deliveryStatus, and invoiceID must be provided' });
//   }

//   if (productIds && !Array.isArray(productIds)) {
//     return res.status(400).json({ message: 'productIds must be an array when provided' });
//   }

//   if (!['InProgress', 'Completed'].includes(deliveryStatus)) {
//     return res.status(400).json({ message: 'Invalid deliveryStatus value' });
//   }

//   // // Fetch QuickOrderStatus
//   // const quickOrderStatus = await QuickOrderStatus.findOne({ storeID, customerID, productID });
//   // Fetch QuickOrderStatus
//   const quickOrderStatus = await QuickOrderStatus.findOne({
//     storeID,
//     customerID,
//     billInvoiceID: invoiceID,
//     $or: [{ productID }, { readyMadeProductID }, { ProductAlterationID }]  // Check for either productID or readyMadeProductID
//   });

//   console.log(JSON.stringify(quickOrderStatus))

//   if (!quickOrderStatus) {
//     return res.status(404).json({ message: 'QuickOrderStatus not found' });
//   }

//   // If productIds are provided, update deliveryStatus for each productId
//   if (productIds && productIds.length > 0) {
//     let { deliveryStatus: existingStatuses = [] } = quickOrderStatus;

//     productIds.forEach(productId => {
//       // Find index of the status that matches the productId
//       const statusIndex = existingStatuses.findIndex(({ productId: id }) => id && id.equals(productId));

//       if (statusIndex === -1) {
//         // If productId is not found, add a new entry
//         existingStatuses.push({ productId, status: deliveryStatus });
//       } else {
//         // If productId is found, update the status
//         existingStatuses[statusIndex].status = deliveryStatus;
//       }
//     });

//     quickOrderStatus.deliveryStatus = existingStatuses;
//     // Save updated QuickOrderStatus
//     await quickOrderStatus.save();
//   } else {
//   }

//   let updatedInvoice = null;

//   // Update PendingAmount if provided
//   if (pendingAmount !== undefined) {
//     const invoice = await CustomerInvoice.findOne({ _id: invoiceID });
//     if (!invoice || !invoice.CoastSection.length) {
//       return res.status(404).json({ message: 'CustomerInvoice CoastSection not found' });
//     }

//     const { PendingAmount: previousPendingAmount } = invoice.CoastSection[0];
//     invoice.CoastSection[0].PendingAmount = pendingAmount;
//     updatedInvoice = await invoice.save();

//     return res.status(200).json({
//       message: 'PendingAmount and delivery status updated successfully',
//       updatedQuickOrderStatus: 23,
//       updatedInvoice: {
//         previousPendingAmount,
//         newPendingAmount: pendingAmount,
//         invoiceData: updatedInvoice,
//       }
//     });
//   }

//   // If no pendingAmount, only update deliveryStatus if applicable
//   res.status(200).json({
//     message: 'Delivery status updated successfully',
//     updatedQuickOrderStatus: quickOrderStatus,
//   });
// });



const updateDeliveryStatus = catchAsyncError(async (req, res) => {
  const {
    storeID,
    customerID,
    productID,
    readyMadeProductID,
    productIds,
    ProductAlterationID,
    deliveryStatus,
    invoiceID,
    pendingAmount
  } = req.body;

  // Validation
  if (!storeID || !customerID || !deliveryStatus || !invoiceID) {
    return res.status(400).json({
      message: 'All required fields: storeID, customerID, deliveryStatus, and invoiceID must be provided'
    });
  }

  if (productIds && !Array.isArray(productIds)) {
    return res.status(400).json({ message: 'productIds must be an array when provided' });
  }

  if (!['InProgress', 'Completed'].includes(deliveryStatus)) {
    return res.status(400).json({ message: 'Invalid deliveryStatus value' });
  }

  // Fetch QuickOrderStatus document
  const quickOrderStatus = await QuickOrderStatus.findOne({
    storeID,
    customerID,
    billInvoiceID: invoiceID,
    $or: [
      { productID },
      { readyMadeProductID },
      { ProductAlterationID }
    ]
  });

  if (!quickOrderStatus) {
    return res.status(404).json({ message: 'QuickOrderStatus not found' });
  }

  // Update deliveryStatus based on provided productIds
  if (productIds && productIds.length > 0) {
    let existingStatuses = quickOrderStatus.deliveryStatus || [];

    productIds.forEach(productId => {
      const index = existingStatuses.findIndex(
        entry => entry.productId && entry.productId.equals(productId)
      );

      if (index === -1) {
        existingStatuses.push({ productId, status: deliveryStatus });
      } else {
        existingStatuses[index].status = deliveryStatus;
      }
    });

    quickOrderStatus.deliveryStatus = existingStatuses;
  }

  // Save QuickOrderStatus if modified
  await quickOrderStatus.save();

  let updatedInvoice = null;

  // Update PendingAmount if provided
  if (pendingAmount !== undefined) {
    const invoice = await CustomerInvoice.findOne({ _id: invoiceID });

    if (!invoice || !invoice.CoastSection || invoice.CoastSection.length === 0) {
      return res.status(404).json({ message: 'CustomerInvoice CoastSection not found' });
    }

    const { PendingAmount: previousPendingAmount } = invoice.CoastSection[0];
    invoice.CoastSection[0].PendingAmount = pendingAmount;
    updatedInvoice = await invoice.save();

    return res.status(200).json({
      message: 'PendingAmount and delivery status updated successfully',
      updatedQuickOrderStatus: quickOrderStatus,
      updatedInvoice: {
        previousPendingAmount,
        newPendingAmount: pendingAmount,
        invoiceData: updatedInvoice,
      }
    });
  }

  // If no pendingAmount, return consistent response
  return res.status(200).json({
    message: 'Delivery status updated successfully',
    updatedQuickOrderStatus: quickOrderStatus,
  });
});



/******************************************************************************************/
/******************************************************************************************/
/*****************************Get Not Assigned fr Stylish**********************************/

const getNotAssignedStylish = catchAsyncError(async (req, res, next) => {
  const { role, stylishlocation } = req.user;
  const query = req.query;
  const page = req.query.page || 1;
  const { type } = req.body;

  // Create the match query based on the type provided
  const matchQuery = {
    acceptappointement: false,
    isCancelled: false,
    ...(type === "offline" && { location: stylishlocation }),
    ...(type === "offline" && { $or: [{ offlineAppointment: true }, { offlineAppointmentForWholeProcess: true }] }),
    ...(type === "online" && { $or: [{ onlineAppointment: true }, { onlineAppointmentForWholeProcess: true }] }),
  };

  const { pipeline, countPipeline } = await CommonServices.commonPipelineService(matchQuery, query);

  const appointments = await CustomerAppointment.aggregate(pipeline);
  const countResult = await CustomerAppointment.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResult = await CommonServices.showingResults(query, totalCount);

  return res.status(200).json({
    success: true,
    message: "Appointments found Successfully..",
    totalCount,
    page,
    showingResult,
    count: appointments.length,
    appointments,
  });
});

/*****************************Get stylish inprogress or completed logs*******************************/
const getStylishAppointmentWorkLogs = catchAsyncError(async (req, res, next) => {
  const { id: workerId } = req.user
  console.log("id", workerId)
  const query = req.query;
  const page = req.query.page || 1;
  let matchQuery = {
    workerId: ObjectId(workerId),
    ...(query.orderStatus === "true" && { orderStatus: true }),
    ...(query.orderStatus === "false" && { orderStatus: false })
  };
  let dynamicAddFields;

  const projectionFields = {
    "_id": 1,
    storeId: 1,
    workerId: 1,
    type: 1,
    orderStatus: 1,
    customerId: 1,
    orderId: 1,
    orderNumber: 1,
    productId: 1,
    appointmentDetails: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  dynamicAddFields = {};
  const lookupStage = [
    CommonServices.createLookupStage('customerappointments', 'appointmentId', '_id', 'appointmentDetails')
  ]

  const { pipeline, countPipeline } = CommonServices.commonLoopkupIndependentPipelineService(lookupStage, matchQuery, query, projectionFields, dynamicAddFields);

  const stylishWorkLogs = await StylishLogs.aggregate(pipeline)
  const countResult = await StylishLogs.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  const showingResult = await CommonServices.showingResults(query, totalCount)

  res.status(200).json({
    success: true,
    message: "Stylish logs retrieved successfully",
    totalCount,
    page,
    showingResult,
    count: stylishWorkLogs.length,
    stylishWorkLogs,
  });

})


/*****************************Accept Appointement fr Stylish*******************************/
const accpetAppointmentStylish = catchAsyncError(async (req, res, next) => {
  const { _id: workerId } = req.user;
  const { storeId, orderNumber, customerID, productID, type, otp, mobileNumber, status } = req.body;

  const otpType = (status === 'InProgress') ? 'startOtp' : (status === 'Completed') ? 'endOtp' : null;

  // Find the OTP for the given mobileNumber
  const otpDocument = await OTPStylish.findOne({ mobileNumber: mobileNumber, type: otpType }).sort({ createdAt: -1 });

  if (!otpDocument) {
    return next(new AppError("OTP not found", 400));
  }

  // Verify the OTP
  const isOtpValid = await bcrypt.compare(otp, otpDocument.otp);

  if (!isOtpValid) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Check if the OTP is expired
  const isOtpExpired = Date.now() > otpDocument.createdAt.getTime() + 900000; // 15 minutes expiry

  if (isOtpExpired) {
    return next(new AppError("OTP has expired", 400));
  }

  // Check if the OTP has already been used
  if (otpDocument.isUsed) {
    return next(new AppError("OTP has already been used", 400));
  }

  // OTP is valid and not expired, mark it as used
  otpDocument.isUsed = true;
  await otpDocument.save();

  // Proceed to accept the appointment
  const appointment = await CustomerAppointment.findOne({ customerID, productID, orderNumber });

  if (appointment) {

    if (appointment.measurmentpresent === false && status === 'Completed') {
      const quickOrderStatus = await QuickOrderStatusOnline.findOne({ storeID: storeId, orderNumber })

      if (quickOrderStatus && quickOrderStatus.measurementID && quickOrderStatus.billInvoiceID) {
        const WorkerLog = await StylishLogs.findOne({ storeId, workerId, orderNumber, orderStatus: false })

        if (WorkerLog) {
          WorkerLog.orderStatus = true

          WorkerLog.save()
        } else {
          return next(new AppError('No record found.', 400))
        }
        //Billind data Update
        const invoiceData = await CustomerInvoiceOnline.findById(quickOrderStatus.billInvoiceID)
        invoiceData.OrderSection.push({
          CustomizedProduct: {
            measurementId: quickOrderStatus.measurementID,
          },
        });
        invoiceData.save();

        appointment.measurmentpresent = true;
        appointment.save();

        return res.status(200).json({
          success: true,
          message: "Order completed successfully",
        })
      } else {
        return next(new AppError('Measurment not found', 404))
      }

    }

    // Create Worker Log
    const WorkerLog = await StylishLogs.create({
      storeId,
      workerId,
      type,
      customerId: customerID,
      orderNumber,
      productId: productID
    });

    if (WorkerLog) {
      appointment.acceptappointement = true;
      await appointment.save();
      return res.status(200).json({ message: 'Appointment accepted successfully' });
    }
  }

  // Handle case where appointment is not found or WorkerLog creation failed
  return next(new AppError("Appointment not found or could not be accepted", 400));
});
/*****************************Accept Direct Appointement for Stylish*******************************/
const directAppointmentStylish = catchAsyncError(async (req, res, next) => {
  const { _id: workerId } = req.user;
  const { appointmentId, type, otp, mobileNumber, status } = req.body;

  const result = await handleDirectAppointment({ workerId, appointmentId, type, otp, mobileNumber, status });
  res.status(200).json(result);
});

/*****************Update Order Direct Appointement for Stylish******************/
const updateOrderToDirectAppointmentStylish = catchAsyncError(async (req, res, next) => {
  const { _id: workerId } = req.user;
  const { appointmentId, orderNumber } = req.body;
  const order = await QuickOrderStatusOnline.findOne({ orderNumber })
  if (!order) return next(new AppError("Order not found", 400))

  const appointment = await CustomerAppointment.findById(appointmentId);
  if (!appointment) return next(new AppError("Appointment not found", 400))
  appointment.orderNumber = orderNumber;

  const workerLog = await StylishLogs.findOne({ appointmentId: ObjectId(appointmentId), workerId })
  if (workerLog) {
    workerLog.orderNumber = orderNumber
    workerLog.orderId = order._id
    await workerLog.save();
    await appointment.save();
  }


  return res.status(200).json({ success: true, message: "Appointment updated successfully", appointment })
});


/********************************Crete Stylish OTP fr Stylish*******************************/
const createStylishOtp = catchAsyncError(async (req, res, next) => {
  const { mobileNumber, type } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);

  const otpType = (type === 'startOtp') ? 'startOtp' : (type === 'endOtp') ? 'endOtp' : null;

  if (!otpType)
    return next(new AppError("Invalid type.", 500));

  await OTPStylish.create({ mobileNumber, otp: hashedOTP, type: otpType });

  // const message = (otpType === 'startOtp') ? `Your OTP for accepting order is: ${otp}` :
  //   (otpType === 'endOtp') ? `Your OTP for service completion is: ${otp}` : null;
  const message = (otpType === 'startOtp') ? `Your OTP for accepting order is: ${otp}. Visit https://www.lovoj.com/` :
    (otpType === 'endOtp') ? `Your OTP for service completion is: ${otp}. Visit https://www.lovoj.com/` : null;

  if (!message)
    return next(new AppError("Invalid type.", 500));

  // const success = await sendSMS(message, `91${mobileNumber}`, "Lovoj");


  // const success = await sendSMS(
  //   message, 
  //   `91${mobileNumber}`, 
  //   "Lovoj", 
  //   process.env.AWS_ENTITY_ID, 
  //   process.env.APPOINTEMENT_REQ_START_AWS_TEMPLATE_ID,
  //   process.env.APPOINTEMENT_REQ_END_AWS_TEMPLATE_ID
  // );

  const templateId = (otpType === 'startOtp')
    ? process.env.APPOINTEMENT_REQ_START_AWS_TEMPLATE_ID
    : process.env.APPOINTEMENT_REQ_END_AWS_TEMPLATE_ID;

  const success = await sendSMS(
    message,
    `91${mobileNumber}`,
    "Lovoj",
    process.env.AWS_ENTITY_ID,
    templateId
  );

  if (!success)
    return next(new AppError("Failed to send OTP.", 500));

  console.log(`OTP sent to ${mobileNumber}: ${otp}`);

  return res.status(200).json({ success: true, message: "Service OTP sent to mobile number" });
});

/********************************* Get Stylish Measurment DataFor Filling the Value **********/
const getMeasurementsForStylish = catchAsyncError(async (req, res, next) => {
  const { storeId, categoriename } = req.params;
  // Validate storeId and categoriename
  if (!storeId || !categoriename) {
    return next(new AppError('storeId and categoriename are required parameters', 404))
  }
  const mesurment = await AdminMesurmentForUser.findOne({
    storeId: storeId,
    categoriename: categoriename,
  });

  if (!mesurment) {
    return next(new AppError('Mesurment not found for the given store and category', 404))
  }

  return res.status(200).json({
    success: true,
    message: 'Mesurment retrieved successfully',
    data: mesurment,
  });
});


/********************************* Stylish Update Measurments  ****************************/
const createCustomerMesurmentForStylist = async (req, res, next) => {
  // const storeId = req.user.storeId;

  try {
    const { storeId, orderNumber, customerId, products } = req.body;

    const findCustomer = await CustomerAppointment.findOne({
      storeID: ObjectId(storeId),
      customerID: ObjectId(customerId),
      orderNumber,
    });

    console.log("findCustomer", findCustomer)
    if (!findCustomer) return next(new AppError("No customer found!", 400));

    // Check if customerMesurment already exists for the given customerId and orderNumber
    const orderStatus = await QuickOrderStatusOnline.findOne({ storeID: storeId, customerID: customerId, orderNumber, status: true });
    if (!orderStatus || !orderStatus.productID) return next(new AppError("Please add product first!", 400));
    if (orderStatus.measurementID) {
      console.log(orderStatus.measurementID, "inside update")
      const existingCustomerMesurment = await CustomerMesurmentOnline.findOne({ storeId, _id: orderStatus.measurementID });
      if (orderStatus.measurementID) {
        // Update the existing document with the new product data
        console.log(orderStatus)
        let updated = false;
        let newCategoriesAdded = false;
        let productsMeasurementUpdated = [];
        let productsMeasurementInserted = [];

        // Loop through each category in the request
        for (const product of products) {
          console.log(product.productId)
          const existingCategoryIndex = existingCustomerMesurment.products.findIndex(cat => cat.productId.toString() === product.productId.toString());
          console.log(existingCategoryIndex)
          if (existingCategoryIndex === -1) {
            // If category doesn't exist, push the entire category object
            existingCustomerMesurment.products.push(product);
            newCategoriesAdded = true;
            productsMeasurementInserted.push(product)
          } else {
            // If product exists, update its measurements
            existingCustomerMesurment.products[existingCategoryIndex].mesurments = product.mesurments;
            updated = true;
            productsMeasurementUpdated.push(product)
          }
        }

        if (updated || newCategoriesAdded) {
          // Save the updated measurement entry to the database
          await existingCustomerMesurment.save();

          let message = '';
          if (updated && newCategoriesAdded) {
            message = 'Measurement entry updated with existing and new products';
          } else if (updated) {
            message = 'Measurement entry updated with existing products';
          } else {
            message = 'New products added to the measurement entry';
          }
          let data = {}
          if (productsMeasurementUpdated.length > 0) {
            data.productsMeasurementUpdatedCount = productsMeasurementUpdated.length
            //  data.productsMeasurementUpdated = productsMeasurementUpdated
          }
          if (productsMeasurementInserted.length > 0) {
            data.productsMeasurementInsertedCount = productsMeasurementInserted.length
            //  data.productsMeasurementInserted = productsMeasurementInserted
          }
          return res.status(200).json({
            success: true,
            message,
            data,
            existingCustomerMesurment
          });
        }
      }
    }
    else if (!orderStatus.measurementID) {

      // If not, create a new customer mesurment
      const newCustomerMesurment = new CustomerMesurmentOnline({
        storeId,
        customerId,
        products
      });

      const savedCustomerMesurment = await newCustomerMesurment.save();

      //ORDER STATUS
      orderStatus.measurementID = savedCustomerMesurment._id;
      orderStatus.save();

      return res.status(201).json({ success: true, message: "Measurement saved successfully", orderStatus: orderStatus, savedCustomerMesurment });
    }

  } catch (error) {
    console.error('Error creating/updating customer mesurment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

/************************************ Order Listing For Stylish ***************************/

const orderDetailsByOrderNumnberForStylist = catchAsyncError(async (req, res, next) => {
  try {
    const { type, storeId, orderNumber, customerId } = req.query;

    // Validate that at least orderNumber is provided
    if (!orderNumber) {
      return res.status(400).json({ success: false, message: "Order number is required" });
    }

    const matchQuery = {
      ...(storeId && { storeID: mongoose.Types.ObjectId(storeId) }),
      ...(orderNumber && { orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') } }),
      ...(customerId && { customerID: mongoose.Types.ObjectId(customerId) }),
    };

    // Default to searching online orders if type is not specified
    const serviceFunction = type === "Offline"
      ? CustomerService.searchServiceByOrderNumber
      : CustomerService.searchOnlineOrdersByOrderNumber;

    const pipeline = await serviceFunction(matchQuery);
    const schemaToAggregate = (type === "Offline") ? QuickOrderStatus : QuickOrderStatusOnline;

    const existingDetails = await schemaToAggregate.aggregate(pipeline);

    if (existingDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No order found with the provided orderNumber.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order found successfully!",
      customerDetails: existingDetails,
    });

  } catch (error) {
    next(error);
  }
});

/********************Stylish INPROGRESS and COMPLETED***************************/
const getOrderStatusForStylish = catchAsyncError(async (req, res, next) => {
  const { id } = req.user;
  const query = req.query;
  const { status } = req.query
  const page = req.query.page || 1;
  let dynamicAddFields;

  const projectionFields = {
    quickOrderStatusonline: 1,
    WorkerInfo: 1,
    createdAt: -1,
  };

  dynamicAddFields = {
    WorkerInfo: {
      storeId: '$storeId',
      orderStatus: '$orderStatus',
      productId: '$productId',
      orderNumber: '$orderNumber',
      role: '$role',
      workerId: '$workerId',
      type: '$type',
      createdAt: '$createdAt',
      updatedAt: '$updatedAt'
    },
  };
  const matchQuery = {
    workerId: mongoose.Types.ObjectId(id),
    ...(status && { orderStatus: status === 'false' ? false : true }),
  };
  const lookupStage = [
    CommonServices.createLookupStage('quickorderstatusonlines', 'orderNumber', 'orderNumber', 'quickOrderStatusonline')
  ]

  const { pipeline, countPipeline } = CommonServices.commonLoopkupIndependentPipelineService(lookupStage, matchQuery, query, projectionFields, dynamicAddFields);

  let myOrders = await StylishLogs.aggregate(pipeline);

  for (let item of myOrders) {
    // console.log(item,"......item.....")
    const productData = await CustomerProductOnline.findById(item?.quickOrderStatusonline[0]?.productID)
    const appointmentData = await CustomerAppointment.findOne({ storeID: item?.WorkerInfo?.storeId, orderNumber: item?.WorkerInfo?.orderNumber })
    item.productData = productData;
    item.appointmentData = appointmentData;
  }
  const countResult = await StylishLogs.aggregate(countPipeline);
  console.log("countResult", countResult)
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


/******************** (Stylish) New APIs Order Data (Not Use Right Now) *******************/
const getCustomerListingForAssositedStylish = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.user;
  console.log("..........req.user........", req.user)
  const query = req.query;
  const { active, status } = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;

  let matchQuery = {
    orderNumber: { $exists: true }
  };
  if (query.orderId) {
    matchQuery._id = ObjectId(query.orderId);
  } else {
    matchQuery.storeID = mongoose.Types.ObjectId(storeId);
    matchQuery.activeStatus = active == "false" ? false : true; // Include activeStatus condition
    if (status === undefined) {
      // If status is not provided in query, retrieve both true and false status data
      matchQuery.status = { $in: [true, false] };
    } else {
      matchQuery.status = status == "false" ? false : true;
    }
  }

  // const OfflinePipeline = await CustomerService.searchQuickOrderServiceWithPagination(matchQuery, page, limit)
  // if (!OfflinePipeline) return next(new AppError("Couldn't find offline pipeline", "404"))

  const OnlinePipeline = await CustomerService.searchOnlineOrdersServiceWithPagination(matchQuery, page, limit)

  if (!OnlinePipeline) return next(new AppError("Couldn't find online pipeline", "404"))

  // const offlineCustomers = await QuickOrderStatus.aggregate(OfflinePipeline.pipeline)
  const onlineCustomers = await QuickOrderStatusOnline.aggregate(OnlinePipeline.pipeline)

  // console.log("offlinecustomer",offlineCustomers)
  // console.log("onlinecustomer",onlineCustomers)

  // const countResultOffline = await QuickOrderStatus.aggregate(OfflinePipeline.countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(OnlinePipeline.countPipeline);

  // let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  // console.log("totalOfflineQuickOrders",totalOfflineQuickOrders)
  // console.log("totalOnlineQuickOrders",totalOnlineQuickOrders)


  // const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  // Assuming you want the maximum total pages between online and offline customers
  const totalPages = Math.max(totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online customers found successfully.",
    // totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    // offlineCustomers,
    onlineCustomers
  })
});










/********************************** Testing Api *****************************************/
// /***************Not Assigned all products (For All Workers)**************************/
const workerNotAssignedProductsListingsss = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  dynamicAddFields = {};
  lookupKeywords = [];

  // Modify the matchQuery function to conditionally exclude storeId
  const matchQuery = OthersService.getNotAssigneddMatchquery(role, req.user.storeId);

  const { pipeline, countPipeline } = CommonServices.commonPipelineService(matchQuery, query);
  let offlineOrders = await QuickOrderStatus.aggregate(pipeline);
  let onlineOrders = await QuickOrderStatusOnline.aggregate(pipeline);
  const offlineNotAssignedProductData = await OthersService.notAssignedProductsforWorkers(offlineOrders, role);
  const onineNotAssignedProductData = await OthersService.notAssignedProductsforWorkers(onlineOrders, role);

  const countResultOffline = await QuickOrderStatus.aggregate(countPipeline);
  const countResultOnline = await QuickOrderStatusOnline.aggregate(countPipeline);

  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  // Assuming you want the maximum total pages between online and offline customers
  const totalPages = Math.max(totalPagesOffline, totalPagesOnline);

  return res.status(200).json({
    success: true,
    message: "Online and Offline not assigned products found successfully.",
    role,
    totalOfflineQuickOrders,
    totalOnlineQuickOrders,
    totalPages,
    PageNumber: page,
    offlineNotAssignedProductData,
    onineNotAssignedProductData
  });
});

/********************************** Testing Api *****************************************/
// /***************Accept Request all products (For All Workers)**************************/
const updateCutterStatusss = catchAsyncError(async (req, res, next) => {
  const { storeId, _id, role, name } = req.user;
  console.log("......role.......", role)
  // const { id, productNumber } = req.params;
  const { status, problem, problemStatements, id, productId, workVideo, workPhoto } = req.body;
  let savedOrderStatus;

  try {
    if (problemStatements && role != 'cutter' && (!workPhoto || !workPhoto)) {
      return next(new AppError("Worke video and worker photo is required when problem occurs.", '404'));
    } else if (status === "Completed" && role != "cutter" && (!workPhoto || !workPhoto)) {
      return next(new AppError("Worke video and worker photo for mastertailor", '404'));
    }
    const getOrder = async () => {
      const offlineOrder = await QuickOrderStatus.findById(id);
      const onlineOrder = await QuickOrderStatusOnline.findById(id);

      if (offlineOrder) {
        return { targetOrder: offlineOrder, type: "Offline" };
      } else if (onlineOrder) {
        return { targetOrder: onlineOrder, type: "Online" };
      } else {
        return null; // Or you can throw an error here if necessary
      }
    };

    const { targetOrder, type } = await getOrder();
    // Use the service functions
    // const targetProduct = await orderService.getProduct(targetOrder, productId, next);
    let data = {};
    if (status === "InProgress" && role === "cutter") {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type }
    } else if ((status === 'Completed' && role != 'cutter') || (problemStatements && role != 'cutter')) {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type, workVideo, workPhoto }
    } else if (status === 'Completed' && role == 'cutter') {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type }
    } else if (status === 'InProgress' && role != 'cutter') {
      data = { targetOrder, role, _id, productId, status, problemStatements, name, type, workVideo, workPhoto }
    }
    console.log("dataaaaaa", data)
    // if (role === "cutter") {
    //   await orderService.checkAndUpdateStatus(data);
    // } else if (role === "mastertailor") {

    //   await orderService.checkAndUpdateStatus(data);
    // } else {
    //   throw new Error('Invalid Role or Cutting status is not completed yet.');
    // }
    await orderService.checkAndUpdateStatus(data);

    savedOrderStatus = await targetOrder.save();
    return res.status(200).json({ message: 'Order updated successfully', updatedOrder: savedOrderStatus });
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    return next(new AppError(error.message, 404));
  }
});
/********************************** Testing Api *****************************************/
/***********Worker InProgress and Completed products Listing (For All Workers)************** */
const workerCompletedProductsListinggg = catchAsyncError(async (req, res, next) => {
  const { id } = req.user;
  const query = req.query;
  const { status } = req.query
  const page = req.query.page || 1;
  let lookupKeywords = [];
  let dynamicAddFields;

  const projectionFields = {
    quickOrderStatus: 1,
    quickOrderStatusonline: 1,
    WorkerInfo: 1,
    createdAt: -1,
  };

  dynamicAddFields = {
    WorkerInfo: {
      storeId: '$storeId',
      orderStatus: '$orderStatus',
      productId: '$productId',
      problem: '$problem',
      workVideo: '$workVideo',
      workPhoto: '$workPhoto',
      role: '$role',
      workerId: '$workerId',
      type: '$type',
    },
  };
  lookupKeywords = ['quickorderstatuses', 'quickorderstatusonlines'];
  // const matchQuery = {
  //   workerId: mongoose.Types.ObjectId(id),
  // };
  const matchQuery = {
    workerId: mongoose.Types.ObjectId(id),
    ...(status && { orderStatus: status === 'false' ? false : true }),
  };

  const { pipeline, countPipeline } = CommonServices.commonLoopkupPipelineService(lookupKeywords, matchQuery, query, projectionFields, dynamicAddFields);

  let myOrders = await WorkerLogs.aggregate(pipeline);
  for (let item of myOrders) {
    const productId = item.WorkerInfo.productId;
    const productData = await orderService.getProductDetailsService(item?.quickOrderStatus[0] || item?.quickOrderStatusonline[0], productId);

    //Temporary product details only
    // const products = item?.WorkerInfo?.type === "Offline" ? await CustomerProduct.find({ _id: ObjectId(item?.quickOrderStatus[0].productID) }) : await CustomerProductOnline.find({ _id: ObjectId(item?.quickOrderStatus[0].productID) });
    // const productData = products[0]?.product.find(product => product?._id.toString() === productId.toString());
    item.productData = productData;
    // if (type === "Offline") {
    //   item.offlineProducts = dataArray
    // } else {
    //   item.onlineProducts = dataArray;
    // }
  }
  const countResult = await WorkerLogs.aggregate(countPipeline);
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






/********************************** *****************************************/
/*********************** Admin Update All status **************************/

/******** Only Completed ***********/

const updateAllStatus = catchAsyncError(async (req, res, next) => {
  const { storeId, _id, name } = req.user;
  const { role, editedRole, status, problem, problemStatements, id, productId, workVideo, workPhoto } = req.body;
  let savedOrderStatus;

  try {
    // If problemStatements exist, workPhoto and workVideo are required
    if (problemStatements && (!workPhoto || !workVideo)) {
      return next(new AppError("Worker video and worker photo are required when problem occurs.", '404'));
    }

    const getOrder = async () => {
      const offlineOrder = await QuickOrderStatus.findById(id);
      const onlineOrder = await QuickOrderStatusOnline.findById(id);

      if (offlineOrder) {
        return { targetOrder: offlineOrder, type: "Offline" };
      } else if (onlineOrder) {
        return { targetOrder: onlineOrder, type: "Online" };
      } else {
        return null;
      }
    };

    const { targetOrder, type } = await getOrder();
    let data = {};

    // Removed dependency on "InProgress" status for "Completed" transition
    if (status === "Completed") {
      data = { targetOrder, role, editedRole, _id, productId, status, problemStatements, name, type, workVideo, workPhoto };
    } else if (problemStatements && role !== 'cutter') {
      data = { targetOrder, role, editedRole, _id, productId, status, problemStatements, name, type, workVideo, workPhoto };
    } else {
      data = { targetOrder, role, editedRole, _id, productId, status, problemStatements, name, type };
    }

    await orderService.checkAndUpdateStatusAdmin(data);

    savedOrderStatus = await targetOrder.save();
    return res.status(200).json({ message: 'Order updated successfully', updatedOrder: savedOrderStatus });
  } catch (error) {
    console.error('Error:', error);
    return next(new AppError(error.message, 404));
  }
});



/*************************************************************************************/
////alteratttttttiooooooonnnnnnnn processssssssssssss parrrrrrrrrrrttttttttt//////////

const altreationNotAssignedProductsListings = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 4;
  dynamicAddFields = {};
  lookupKeywords = [];

  // Modify the matchQuery function to conditionally exclude storeId
  const matchQuery = OthersService.altreationGetNotAssigneddMatchquery(role, req.user.storeId);

  const { pipeline, countPipeline } = CommonServices.commonPipelineService(matchQuery, query);
  console.log(JSON.stringify(pipeline))
  let offlineOrders = await QuickOrderStatus.aggregate(pipeline);
  // console.log(JSON.stringify(offlineOrders), "offilelineOrders........................................................................................................")
  // let onlineOrders = await QuickOrderStatusOnline.aggregate(pipeline);
  const offlineNotAssignedProductData = await OthersService.altreationNotAssignedProductsforWorkers(offlineOrders, role);
  // const onineNotAssignedProductData = await OthersService.altreationNotAssignedProductsforWorkers(onlineOrders, role);

  const countResultOffline = await QuickOrderStatus.aggregate(countPipeline);
  // const countResultOnline = await QuickOrderStatusOnline.aggregate(countPipeline);

  let totalOfflineQuickOrders = countResultOffline.length > 0 ? countResultOffline[0].totalCount : 0;
  // let totalOnlineQuickOrders = countResultOnline.length > 0 ? countResultOnline[0].totalCount : 0;

  const totalPagesOffline = Math.ceil(totalOfflineQuickOrders / limit);
  // const totalPagesOnline = Math.ceil(totalOnlineQuickOrders / limit);

  // Assuming you want the maximum total pages between online and offline customers
  const totalPages = Math.max(totalPagesOffline);

  return res.status(200).json({
    success: true,
    message: " Offline not assigned products found successfully.",
    role,
    totalPages,
    totalOfflineQuickOrders,
    PageNumber: page,
    offlineNotAssignedProductData,
  });
});












/****************************** Customer Addresssssssssss Api For Stylish ****************************/

const createCustomerAddress = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log("customerId: ", customerId)
    const { full_name, mobile_number, address_1, address_2, address_3, landmark, pincode, city_name, state, country, default_address } = req.body;
    // const { customerId } = req.user;

    const address = new CustomerAddresses({
      customer_id: customerId,
      full_name,
      mobile_number,
      address_1,
      address_2,
      address_3,
      landmark,
      pincode,
      city_name,
      state,
      country,
      default_address,
    });

    await address.save();
    res.status(201).json({ message: "Customer address created successfully", data: address });
  } catch (error) {
    res.status(500).json({ message: "Error creating customer address", error: error.message });
  }
};

// Get all addresses for a specific customer
const getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;
    // const customerId = req.user._id;

    const addresses = await CustomerAddresses.find({ customer_id: customerId });
    res.status(200).json({ message: "Customer addresses retrieved successfully", data: addresses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customer addresses", error: error.message });
  }
};

// Update a specific address for a customer
const updateCustomerAddress = async (req, res) => {
  try {
    // const customerId = req.user._id;
    const { customerId, addressId } = req.params;
    const updates = req.body;

    const updatedAddress = await CustomerAddresses.findOneAndUpdate(
      { _id: addressId, customer_id: customerId },
      updates,
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Customer address updated successfully", data: updatedAddress });
  } catch (error) {
    res.status(500).json({ message: "Error updating customer address", error: error.message });
  }
};

// Delete a specific address for a customer
const deleteCustomerAddress = async (req, res) => {
  try {
    // const customerId = req.user._id;
    const { customerId, addressId } = req.params;

    const deletedAddress = await CustomerAddresses.findOneAndDelete({
      _id: addressId,
      customer_id: customerId,
    });

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Customer address deleted successfully", data: deletedAddress });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer address", error: error.message });
  }
};



module.exports = {
  uploadQucikOrderImages,
  uploadQuickOrderImages1,
  createCustomers,
  deleteCustomer,
  searchCustomer,
  getCustomers,
  getCustomerById,
  createOrUpdateCustomer,
  createCustomerProduct,
  updateCustomerProduct,
  markQuickOrderStatus,
  downloadPDF,//download pdf
  discardCustomerData,
  getAllCustomerProducts,
  getCustomerProductById,
  createCustomerMesurment,
  getAllCustomerMesurments,
  getCustomerMesurmentBy_id_Name,
  createSpecialInstruction,
  Instruction_Image_Note_Voice,
  createCustomerContrast,
  ContrastImages,
  createCustomerReadymadeProduct,
  updateCustomerReadymadeProduct,
  createCustomerReadymadeAccessories,
  updateCustomerReadymadeAccessories,
  createCustomerInvoice,
  searchCustomerByOrderNumnber,
  getCustomerListing1, // Joi Added
  orderDetailsByOrderNumnber,
  getInActiveQuickOrdersWithAggregation,
  getCustomerListing,
  toggleOrderActiveStatus,

  //Alteration Product
  createCustomerAlterationProduct,
  createCustomerAlterationMesurment,
  createAlterationSpecialInstruction,

  updateCutterStatus,
  updateCutterStatus,
  getCustomerListing1ForWorker,  // All not assigned for workers
  getCustomerOrderStatusForCutter,
  notAssigned, // Joi Added
  myOrdersForWorker, // Joi Added
  orderListingforWorkers, // Joi Added
  orderDetailsByOrderNumberTest, // Joi Added
  deleteProductDetails, //Joi Added
  workerCompletedProductsListing,
  workerNotAssignedProductsListing, // Not Assigned
  getNotAssignedStylish,
  accpetAppointmentStylish,
  createStylishOtp,
  getMeasurementsForStylish,
  createCustomerMesurmentForStylist,
  orderDetailsByOrderNumnberForStylist,
  getOrderStatusForStylish,

  getCustomerListingForAssositedStylish,

  qcPassFailSurvey,
  masterTailorFailedListing,
  updateRealignByMastertailor,  // Update realign by mastertailor

  createDeliveryOtp,

  directAppointmentStylish,
  updateOrderToDirectAppointmentStylish,
  getStylishAppointmentWorkLogs,

  //testing
  workerNotAssignedProductsListingsss,
  updateCutterStatusss,
  workerCompletedProductsListinggg,


  updateAllStatus,

  //deliver admin
  updateDeliveryStatus,


  //
  altreationNotAssignedProductsListings,

  createCustomerAddress,
  getCustomerAddresses,
  updateCustomerAddress,
  deleteCustomerAddress,


  // createCustomerProductB2C,
  // createCustomerMeasurementB2C,
  // createCustomerSpecialInstructionB2C

}



