const { catchAsyncError } = require("../middleware/catchAsyncError");
const uploadToS3 = require("../utils/s3Upload");
const deleteFromS3 = require("../utils/deleteFroms3");
const { ObjectId } = require("mongodb");
const AppError = require("../utils/errorHandler");
const Tax = require('../models/taxpage');
const Coupon = require('../models/coupanPage')



  exports.createTax = async (req, res) => {
    try {
      const { storeId } = req.user;
      const existingTax = await Tax.findOne({ storeId });
      if (existingTax) {
        const updatedTax = await Tax.findOneAndUpdate({ storeId }, { ...req.body, storeId }, { new: true });
        // return res.status(200).json(updatedTax);
        return res.status(200).json({
            success: true,
            message: "Tax Update successfully",
            updatedTax,
          });
      } else {
        const newTax = new Tax({ ...req.body, storeId });
        const savedTax = await newTax.save();
        // return res.status(201).json(savedTax);
        return res.status(200).json({
            success: true,
            message: "Tax Saved successfully",
            savedTax,
          });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

  exports.getTaxByStoreId = async (req, res) => {
    try {
      const { storeId } = req.user;
      const taxData = await Tax.findOne({ storeId });
  
      if (taxData) {
        return res.status(200).json({
          success: true,
          message: "Tax data retrieved successfully",
          taxData,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Tax data not found for the specified storeId",
        });
      }
    } catch (error) {
    //   console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


  /************************* Coupon *******************/


  exports.createCoupon = async (req, res) => {
    try {
      // Ensure req.user and req.body exist and have the necessary properties
      const { storeId } = req.user || {};
      const { CouponName, PrecentageAmount, PriceAmount, ValidiyFrom, ValidiyTo, NumberOfCustomers,  CategoryType, ProductType } = req.body || {};
  
      if (!storeId || !CouponName || !PrecentageAmount || !PriceAmount || !ValidiyFrom || !ValidiyTo || !NumberOfCustomers  || !CategoryType || !ProductType) {
        return res.status(400).json({ error: 'Please provide all required fields' });
      }
      const remaining = NumberOfCustomers;
      // Creating a new coupon object based on the Coupon schema
      const newCouponData = {
        storeId,
        CouponName,
        PrecentageAmount,
        PriceAmount,
        ValidiyFrom,
        ValidiyTo,
        NumberOfCustomers,
        remaining,
        CategoryType,
        ProductType
      };
  
      const newCoupon = new Coupon(newCouponData); // Create a new instance of Coupon model
      const savedCoupon = await newCoupon.save(); // Save the coupon to the database
  
      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        savedCoupon,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  