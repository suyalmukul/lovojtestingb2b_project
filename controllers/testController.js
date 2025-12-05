const { catchAsyncError } = require('../middleware/catchAsyncError');
const { CategoriesImages } = require('../models/Images.model');
const CategoryItem = require('../models/CategoryItem'); // this is testing product quickorder schema

const { sendNotification } = require('../utils/pushNotifcation');
const uploadToS3 = require('../utils/s3Upload');

// Controller function to handle sending a push notification
exports.sendPushNotification = async(req, res) => {
  console.log("bodyyyy" ,req.body)
  const { deviceToken, title, body } = req.body;

  // Validate the presence of required fields
  if (!deviceToken || !title || !body) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await sendNotification(deviceToken, title, body);
    return res.status(200).json({ message: 'Push notification sent successfully' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ message: 'Failed to send push notification' });
  }
}




exports.categoryImagesPost = catchAsyncError(async (req, res) => {
  // Request Body
  let { category, subtitle } = req.body;

  // Find the existing categoryImages document for the given category
  let categoryImages = await CategoriesImages.findOne({ category });

  // Initialize an array to store the image URLs
  const imageUrls = [];
  let ttlImgUrl = '';

  // Check if designerImage file is provided
  if (req.files.designerImage && req.files.designerImage.length > 0) {
    const designerImageObj = req.files.designerImage[0];
    const designerImageUrl = await uploadToS3(designerImageObj);
    imageUrls.push({ designerImage: designerImageUrl });
  }

  // Check if accessoriesImage file is provided
  if (req.files.accessoriesImage && req.files.accessoriesImage.length > 0) {
    const accessoriesImageObj = req.files.accessoriesImage[0];
    const accessoriesImageUrl = await uploadToS3(accessoriesImageObj);
    imageUrls.push({ accessoriesImage: accessoriesImageUrl });
  }

  // Check if factoryImage file is provided
  if (req.files.factoryImage && req.files.factoryImage.length > 0) {
    const factoryImageObj = req.files.factoryImage[0];
    const factoryImageUrl = await uploadToS3(factoryImageObj);
    imageUrls.push({ factoryImage: factoryImageUrl });
  }

  // Check if fabricImage file is provided
  if (req.files.fabricImage && req.files.fabricImage.length > 0) {
    const fabricImageObj = req.files.fabricImage[0];
    const fabricImageUrl = await uploadToS3(fabricImageObj);
    imageUrls.push({ fabricImage: fabricImageUrl });
  }

  // Check if fabricImage file is provided
  if (req.files.titleImage1 && req.files.titleImage1.length > 0) {
    const titleImage1Obj = req.files.titleImage1[0];
    const titleImage1Url = await uploadToS3(titleImage1Obj);
    ttlImgUrl = titleImage1Url;
  }

  // Update or Insert Data
  if (categoryImages) {
    // Update the existing categoryImages document
    categoryImages.Images = categoryImages.Images.concat(imageUrls);
    categoryImages.titleImages = ttlImgUrl;
    categoryImages = await categoryImages.save();
  } else {
    // Insert a new categoryImages document
    categoryImages = await CategoriesImages.create({
      category,
      Images: imageUrls,
      titleImage1: ttlImgUrl,
      subtitle,
    });
  }

  return res.status(201).json({
    success: true,
    categoryImages,
  });
});





/*************************************************** tesing Products for QuickOrder setup part ******************************/



exports.createOrUpdateCategoryItem = catchAsyncError(async (req, res, next) => {
  try {
    const { category, subcategories } = req.body;

    // Iterate through the provided subcategories and create a document for each
    if (subcategories && Array.isArray(subcategories) && subcategories.length > 0) {
      for (const subcategory of subcategories) {
        // Search for an existing document with the specified category and subcategory
        let existingItem = await CategoryItem.findOne({ category, 'subcategories.subcategory': subcategory.subcategory });

        if (!existingItem) {
          // If the document doesn't exist, create a new one
          existingItem = new CategoryItem({
            category,
            subcategories: [subcategory],
          });
        } else {
          // If the document exists, add the subcategory to its subcategories array
          existingItem.subcategories.push(subcategory);
        }

        await existingItem.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Documents created or updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating or updating the documents.',
      error: error.message,
    });
  }
});
