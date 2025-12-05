const passport = require("passport");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const CustomerOnline = require("../models/Customerb2c.online");
const AppError = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const authKeys = require("../middleware/authKeys");
const customerService = require("../services/customer.service");
const ExistingCustomerMeasurement = require("../models/existingMeasurement.model");
const { OfflineCustomerB2C } = require("../models/Customerb2c.offline");


/************************************** Online customer Register *********************************/

exports.registerCustomer = catchAsyncError(async (req, res, next) => {
  const { email, fullName, contactNumber, password } = req.body;

  // Check if the email is already registered
  const existingCustomer = await CustomerOnline.findOne({ email });
  if (existingCustomer) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Create a new customer instance
  const newCustomer = new CustomerOnline({
    email,
    fullName,
    contactNumber,
    password,
  });

  // Save the customer to the database
  await newCustomer.save();

  res.status(201).json({
    success: true,
    message: "Customer registered successfully",
  });
});



/************************************** Online customer Login *********************************/


exports.customerB2CLogin = (req, res, next) => {
  customerService.authenticateCustomer(req, res, next)
};

/************************************** Offline customer Measurement Existing *********************************/

exports.existingCustomerMeasurement = async(req, res, next) => {
  const { storeId } = req.user;
    const { customerId, categories } = req.body;

    // Check if the request body has customerId and categories
    if (!customerId || !categories || !categories.length) {
      return next(new AppError('Customer ID and at least one category are required', 400));
    }

    const customer = await OfflineCustomerB2C.findOne({_id: customerId, storeId: storeId})
    if (!customer) {
      return next(new AppError('No customer found!', 400));
    }

    // Find the existing measurement entry based on customerId and storeId
    let existingMeasurement = await ExistingCustomerMeasurement.findOne({ customerId, storeId });

    if (!existingMeasurement) {
      // If no measurement found, create a new entry
      existingMeasurement = new ExistingCustomerMeasurement({
        storeId,
        customerId,
        categories
      });
      await existingMeasurement.save();
      return res.status(201).json({ message: 'New measurement entry created' });
    }

    // Flags to track if any updates occurred
    let updated = false;
    let newCategoriesAdded = false;
    let categoriesUpdated = [];
    let categoriesInserted = [];

    // Loop through each category in the request
    for (const category of categories) {
      const existingCategoryIndex = existingMeasurement.categories.findIndex(cat => cat.name === category.name);

      if (existingCategoryIndex === -1) {
        // If category doesn't exist, push the entire category object
        existingMeasurement.categories.push(category);
        newCategoriesAdded = true;
        categoriesInserted.push(category.name)
      } else {
        // If category exists, update its measurements
        existingMeasurement.categories[existingCategoryIndex].mesurments = category.mesurments;
        updated = true;
        categoriesUpdated.push(category.name)
      }
    }

    if (updated || newCategoriesAdded) {
      // Save the updated measurement entry to the database
      await existingMeasurement.save();

      let message = '';
      if (updated && newCategoriesAdded) {
        message = 'Measurement entry updated with existing and new categories';
      } else if (updated) { 
        message = 'Measurement entry updated with existing categories';
      } else {
        message = 'New categories added to the measurement entry';
      }

      return res.status(200).json({ message, categoriesUpdated, categoriesInserted });
    }

    return res.status(200).json({ message: 'No changes made to the measurement entry' });
};

/******************* Get Exesting Measurment By id and Name ***********/
// exports.getExestingCustomerMesurmentBy_id_Name = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     console.log("........customerId..........", customerId);
//     const { name } = req.query;

//     // Query based on customerId
//     const customerMesurment = await ExistingCustomerMeasurement.findOne({ customerId });
//     console.log("........customerMesurment..........", customerMesurment);

//     if (!customerMesurment) {
//       return res.status(404).json({ message: 'Customer measurement not found' });
//     }

//     // Extract category with the specified name
//     const category = customerMesurment.categories.find((c) => c.name === name);

//     if (!category) {
//       return res.status(404).json({ message: `Category with name '${name}' not found` });
//     }

//     res.status(200).json(category);
//   } catch (error) {
//     console.error('Error fetching customer measurement:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };


exports.getExestingCustomerMesurmentBy_id_Name = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log("........customerId..........", customerId);
    const { name } = req.query;

    // Query based on customerId
    const customerMesurment = await ExistingCustomerMeasurement.findOne({ customerId });
    console.log("........customerMesurment..........", customerMesurment);

    if (!customerMesurment) {
      return res.status(404).json({ message: 'Customer measurement not found' });
    }

    if (name) {
      // Extract category with the specified name
      const category = customerMesurment.categories.find((c) => c.name === name);

      if (!category) {
        return res.status(404).json({ message: `Category with name '${name}' not found` });
      }

      res.status(200).json(category);
    } else {
      // Return all categories if no name is provided
      res.status(200).json(customerMesurment.categories);
    }
  } catch (error) {
    console.error('Error fetching customer measurement:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





