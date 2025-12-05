const { OfflineCustomerB2C } = require("../models/Customerb2c.offline");
const { OnlineCustomers } = require("../models/OnlineCustomers.model")
const bcrypt = require("bcryptjs");
const fs = require("fs");
const CustomerProduct = require('../models/customerProduct');
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
const StylishLogs = require("../models/Stylish.model");
const CustomerInvoiceOnline = require("../models/BillInvoiceOnline.model");
const { sendEmailViaOneSignalwithoutTemplate } = require("../services/email.services");
const { createBillPDF } = require("../services/pdf.services");
const { handleDirectAppointment } = require("../services/appointment.service");
const CustomDesign = require("../models/customDesign");


const getNotAssignedUploadDesignsForAdminDesigner = catchAsyncError(async (req, res, next) => {
    const { role, stylishlocation} = req.user;
    const query = req.query;
    const page = req.query.page || 1;
    // const { type } = req.body;
  
    // Create the match query based on the type provided
    const matchQuery = {
    shippingOrderLocation: new RegExp(stylishlocation, 'i'),
    };
  
    const { pipeline, countPipeline } = await CommonServices.commonPipelineService(matchQuery, query);
  
    const CustomdDesignData = await CustomDesign.aggregate(pipeline);
    const countResult = await CustomDesign.aggregate(countPipeline);
    let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  
    const showingResult = await CommonServices.showingResults(query, totalCount);
  
    return res.status(200).json({
      success: true,
      message: "CustomDesigns found Successfully..",
      totalCount,
      page,
      showingResult,
      count: CustomdDesignData.length,
      CustomdDesignData,
    });
  });




module.exports = {
    getNotAssignedUploadDesignsForAdminDesigner,
  }
  
  


  