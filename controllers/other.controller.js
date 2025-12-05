const { catchAsyncError } = require("../middleware/catchAsyncError");
const { CategoriesImages } = require("../models/Images.model");
const csv = require('csv-parser');
const fs = require('fs');

exports.getAllCategoryImages = catchAsyncError(async (req, res) => {
    // Find all categoryImages documents
    const categoryImages = await CategoriesImages.find();
  
    return res.status(200).json({
      success: true,
      categoryImages,
    });
  });

  exports.dummyCSVFileCreate = catchAsyncError(async (req, res, next) => {
    const dummyData = [
      { name: 'John Doe', age: 25, city: 'New York' },
      { name: 'Jane Smith', age: 30, city: 'San Francisco' },
      { name: 'Bob Johnson', age: 28, city: 'Los Angeles' },
    ];
  
    const csvData = [];
  
    // Convert dummy data to CSV format
    dummyData.forEach((item) => {
      const csvRow = {
        Name: item.name,
        Age: item.age,
        City: item.city,
      };
      csvData.push(csvRow);
    });
  
    // Convert CSV data to a string
    const csvString = csvData.map((row) => Object.values(row).join(',')).join('\n');
  
    // Save CSV data to a file
    fs.writeFileSync(`dummy_data.csv${Date.now()}`, csvString);
  
    res.json({ message: 'CSV file generated successfully' });
  })