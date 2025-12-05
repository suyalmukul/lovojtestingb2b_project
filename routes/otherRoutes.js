const express = require("express");
const { getAllCategoryImages, dummyCSVFileCreate } = require("../controllers/other.controller");
const validateMiddleWare = require("../middleware/validate");
const otherRouter = express.Router();

// endpoint for sending OTP to user's email
otherRouter.get("/images", getAllCategoryImages);

otherRouter.post("/dummycsv", dummyCSVFileCreate);


module.exports = otherRouter;