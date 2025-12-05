const Store = require("../models/stores");
const { commonPipelineService, showingResults } = require("../services/common.service");
const AdminProductForUser = require('../models/QuickorderNew_pro_sub_adminUser');
const AdminMesurmentForUser = require('../models/QuickOrderNew_Measurment_adminUser');
const AdminContrastStyle = require('../models/QuickOrderNew_ContrastStyle_adminUser');
const { SuperadminButton, SuperadminButtonHole, SuperadminButtonThread, } = require('../models/QuickorderNew_Button');
const { AdminButton, AdminButtonHole, AdminButtonThread, } = require('../models/QuickorderNew_Button_Admin');

const { SuperadminColor, SuperadminFont } = require('../models/QuickorderNew_Color_Font');
const { AdminColor, AdminFont } = require('../models/QuickorderNew_Color_Font_Admin');

const AdminReadymadeProductForUser = require("../models/QuickorderNew_ReadymadeProduct_adminUser");
const AdminReadymadeAccessoriesForUser = require('../models/QuickorderNew_ReadymadeAccessories_adminUser');

const SuperadminPattern = require("../models/QuickorderNew_petterns")
const ProductMakingCharges = require('../models/ProductMakingCharges');
const AppError = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const uploadToS3 = require("../utils/s3Upload");
const QRCode = require('qrcode');
const { generateQRCode } = require("../utils/others");
const OthersService = require("../services/others.service");

/*********************** Universal Image Picker Api******************************/


exports.universalImagePicker = async (req, res) => {
  try {
    let ProductPthotoUrl = [];
    let FabricPthotoUrl = [];
    if (req.files.adminProductsImage && req.files.adminProductsImage.length > 0) {
      const files = req.files.adminProductsImage;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ProductPthotoUrl.push(data);
    }
    if (req.files.adminFabricsImage && req.files.adminFabricsImage.length > 0) {
      const files = req.files.adminFabricsImage;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      FabricPthotoUrl.push(data);
    }
    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      Images: [
        {
          adminProductsImage: ProductPthotoUrl,
          adminFabricsImage: FabricPthotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};


/***************************************************************************************/



// exports.adminCreateProductForUser = async (req, res, next) => {
//   try {
//     const user = req.user;
//     if (!user) {
//       return next(new AppError("User not authenticated", 401));
//     }
//     const { storeId } = user;
//     const store = await Store.findById(storeId);

//     if (!store) {
//       return next(new AppError("Store not found", 404));
//     }

//     const { name, productNumber, genderName, productName, productImage, categories, catStyleNameArraytoDelete } = req.body;

//     // Check if 'categories' is undefined or empty
//     if (!categories || categories.length === 0 || !categories[0].name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Categories array is required, and it must have at least one element with a valid name',
//       });
//     }

//     const existingProduct = await AdminProductForUser.findOne({
//       storeId: storeId,
//       productName: productName,
//     });

//     if (existingProduct) {
//       // Update existing categories or push new categories if not already present
//       categories.forEach((newCategory) => {
//         const existingCategoryIndex = existingProduct.categories.findIndex(
//           (existingCategory) => existingCategory.name === newCategory.name
//         );

//         if (existingCategoryIndex !== -1) {
//           // If category already exists, update its styles or push new style if not already present
//           newCategory.styles.forEach((newStyle) => {
//             const existingStyleIndex = existingProduct.categories[existingCategoryIndex].styles.findIndex(
//               (existingStyle) => existingStyle.catStyleName === newStyle.catStyleName
//             );

//             if (existingStyleIndex !== -1) {
//               // If style already exists, update it
//               existingProduct.categories[existingCategoryIndex].styles[existingStyleIndex] = newStyle;
//             } else {
//               // If style doesn't exist, push the new style
//               existingProduct.categories[existingCategoryIndex].styles.push(newStyle);
//             }
//           });

//           // Delete styles specified in catStyleNameArraytoDelete
//           existingProduct.categories[existingCategoryIndex].styles = existingProduct.categories[existingCategoryIndex].styles.filter(
//             (existingStyle) => !catStyleNameArraytoDelete.includes(existingStyle.catStyleName)
//           );
//         } else {
//           // If category doesn't exist, push the new category
//           existingProduct.categories.push(newCategory);
//         }
//       });

//       const updatedProduct = await existingProduct.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Product updated successfully',
//         data: updatedProduct,
//       });
//     }
//     const newAdminProductForUser = new AdminProductForUser({
//       storeId: storeId,
//       ownFlag: false,
//       name: name,
//       productNumber: productNumber,
//       genderName: genderName,
//       productName: productName,
//       productImage: productImage,
//       categories: categories,
//     });

//     const savedProduct = await newAdminProductForUser.save();

//     return res.status(201).json({
//       success: true,
//       message: 'Product added successfully',
//       data: savedProduct,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


/*********** */
exports.adminCreateProductForUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { storeId } = user;
    const store = await Store.findById(storeId);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const {
      name,
      productNumber,
      genderName,
      productName,
      productImage,
      categories
    } = req.body;

    // Check if product already exists
    const existingProduct = await AdminProductForUser.findOne({
      storeId: storeId,
      productName: productName,
    });

    // If categories invalid (empty or missing name)
    const isInvalidCategory =
      !Array.isArray(categories) ||
      categories.length === 0 ||
      !categories[0].name;

    if (isInvalidCategory) {
      if (existingProduct) {
        // Delete the existing product (exact match)
        await AdminProductForUser.deleteOne({
          storeId: storeId,
          productName: productName,
        });

        return res.status(200).json({
          success: true,
          message: 'Product deleted successfully due to empty or invalid categories',
        });
      } else {
        // If product doesn't exist yet, just reject
        return res.status(400).json({
          success: false,
          message: 'Categories array is required, and it must have at least one element with a valid name',
        });
      }
    }

    if (existingProduct) {
      // Replace all fields if product exists
      existingProduct.name = name;
      existingProduct.productNumber = productNumber;
      existingProduct.genderName = genderName;
      existingProduct.productImage = productImage;
      existingProduct.categories = categories;

      const updatedProduct = await existingProduct.save();

      return res.status(200).json({
        success: true,
        message: 'Product replaced successfully',
        data: updatedProduct,
      });
    }

    // Create new product
    const newAdminProductForUser = new AdminProductForUser({
      storeId: storeId,
      ownFlag: false,
      name,
      productNumber,
      genderName,
      productName,
      productImage,
      categories,
    });

    const savedProduct = await newAdminProductForUser.save();

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: savedProduct,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};






exports.adminGetProductForUser = async (req, res, next) => {
  try {
    const { storeId, productName } = req.params;

    const product = await AdminProductForUser.findOne({ storeId, productName });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.adminGetSeenProductForUser = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.params;
  const { seen } = req.query;
  const query = { storeId };

  if (seen !== undefined) {
    query.seen = seen;
  }
  const seenProducts = await AdminProductForUser.find(query);

  // Extract only the desired fields from each product
  const simplifiedProducts = seenProducts.map(product => ({
    _id: product._id,
    storeId: product.storeId,
    ownFlag: product.ownFlag,
    seen: product.seen,
    name: product.name,
    productNumber: product.productNumber,
    genderName: product.genderName,
    productName: product.productName,
    productImage: product.productImage,
    discription: product.discription,
  }));

  return res.status(200).json({
    success: true,
    message: "Product Get Successfully",
    data: simplifiedProducts,
  });
});



exports.adminUpdateProductForUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { seen, productName, productImage, discription } = req.body;

  const updatedProduct = await AdminProductForUser.findByIdAndUpdate(
    id,
    { seen: seen || false, productName, productImage, discription },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    return next(new AppError('Product not found', 404));
  }
  return res.status(200).json({ success: true, message: 'Product Update Successfully' });
});





/**************************************************************************************/


exports.adminCreateMesurmentForUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { storeId } = user;

    // Now you have the storeId, you can use it in your logic
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    const { name, gender, categoriename, measurements, ownFlag, catMeasurmentNameArraytoDelete } = req.body;

    // Find an existing Mesurment with the same gender and categoriename in the specific store
    const existingMesurment = await AdminMesurmentForUser.findOne({
      storeId: storeId,
      categoriename,
    });

    if (existingMesurment) {
      // If the document exists, remove styles specified in catMeasurmentNameArraytoDelete
      existingMesurment.measurements = existingMesurment.measurements.filter(
        (existingMeasurement) => !catMeasurmentNameArraytoDelete.includes(existingMeasurement.name)
      );

      // Check if the measurements already exist based on name
      const existingMeasurementsNames = existingMesurment.measurements.map((measurement) => measurement.name);

      measurements.forEach((newMeasurement) => {
        const existingMeasurementIndex = existingMeasurementsNames.indexOf(newMeasurement.name);

        if (existingMeasurementIndex !== -1) {
          // If measurement already exists, update it
          existingMesurment.measurements[existingMeasurementIndex] = newMeasurement;
        } else {
          // If measurement doesn't exist, push the new measurement
          existingMesurment.measurements.push(newMeasurement);
        }
      });

      existingMesurment.ownFlag = ownFlag; // Update ownFlag

      const updatedMesurments = await existingMesurment.save();

      return res.status(200).json({
        success: true,
        message: 'Measurements updated for existing Mesurment',
        data: updatedMesurments,
      });
    } else {
      // Create a new Mesurment instance associated with the specific store
      const newMesurment = new AdminMesurmentForUser({
        ownFlag,
        name,
        gender,
        categoriename,
        measurements,
        storeId: storeId, // Corrected field name to storeId
      });

      // Save the new Mesurment to the database
      const savedMesurment = await newMesurment.save();

      return res.status(201).json({
        success: true,
        message: 'Mesurment created successfully',
        data: savedMesurment,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



exports.getMeasurementsForUser = catchAsyncError(async (req, res, next) => {
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



/******************************************************************************/
/********************** Readymade Products APIs Admin For Users *******************/


// exports.AdmincreateReadymadeProductForUser = catchAsyncError(async (req, res) => {
//   const { storeId, storeType } = req.user;

//   // Create a new product instance with the storeId and storeType from the request
//   const newReadymadeProduct = new AdminReadymadeProductForUser({
//     ...req.body,
//     storeId,
//     storeType,
//   });

//   // Check if there are any uploaded product images and upload them to S3
//   if (req.files && req.files.ReadymadeProductImage && req.files.ReadymadeProductImage.length > 0) {
//     const files = req.files.ReadymadeProductImage;
//     const uploadedImages = await Promise.all(files.map((file) => uploadToS3(file)));
//     newReadymadeProduct.AdminReadymadeProductImage = uploadedImages;
//   }

//   // Save the new product to the database to get its ID
//   const savedProduct = await newReadymadeProduct.save();

//   // Generate the QR code URL based on the saved product's ID
//   // const getProductAPIUrl = `http://54.167.48.52:5001/api/v1/SetupsforUser/getReadymadeProductById/${savedProduct._id}`;
//   const getProductAPIUrl = `https://admin.lovoj.com/readyMade/${savedProduct._id}`;
//   //https://admin.lovoj.com/readyMade
//   const base64QRCode = await generateQRCode(getProductAPIUrl);
//   const qrCodeURL = base64QRCode.replace(/^data:image\/png;base64,/, ''); // Remove base64 prefix

//   // Update the saved product with the generated QR code URL and save it again
//   savedProduct.qrCodeURL = qrCodeURL;
//   await savedProduct.save();

//   return res.status(200).json({
//     success: true,
//     message: "AdminReadymadeProduct uploaded successfully",
//     savedProduct,
//     qrCodeURL,
//   });
// });




exports.AdmincreateReadymadeProductForUser = catchAsyncError(async (req, res) => {
  const { storeId, storeType } = req.user;

  console.log("Request received for creating a ready-made product.");

  // Generate a unique product number if not provided in req.body
  const productNumber = req.body.productNumber || await OthersService.generateUniqueProductNumber();
  console.log("Generated productNumber:", productNumber);

  // Create a new product instance
  const newReadymadeProduct = new AdminReadymadeProductForUser({
    ...req.body,
    storeId,
    storeType,
    productNumber, // Ensure productNumber is assigned
  });

  // Handle image upload if images are provided
  if (req.files && req.files.ReadymadeProductImage && req.files.ReadymadeProductImage.length > 0) {
    const files = req.files.ReadymadeProductImage;
    const uploadedImages = await Promise.all(files.map((file) => uploadToS3(file)));
    newReadymadeProduct.AdminReadymadeProductImage = uploadedImages;
  }

  // Save product to database
  const savedProduct = await newReadymadeProduct.save();
  console.log("Product saved successfully:", savedProduct);

  // Generate QR Code with product URL
  const getProductAPIUrl = `https://admin.lovoj.com/readyMade/${savedProduct._id}`;
  const base64QRCode = await generateQRCode(getProductAPIUrl);
  const qrCodeURL = base64QRCode.replace(/^data:image\/png;base64,/, ''); 

  // Update product with QR Code URL
  savedProduct.qrCodeURL = qrCodeURL;
  await savedProduct.save();
  console.log("QR Code added successfully.");

  return res.status(200).json({
    success: true,
    message: "AdminReadymadeProduct uploaded successfully",
    data: savedProduct,
    qrCodeURL,
  });
});


// Controller to get readymade product by ID Use this in qrcode url data get
exports.getReadymadeProductById = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  // Fetch the product by its ID
  const product = await AdminReadymadeProductForUser.findById(id);
  if (!product) {
    console.log("Product not found for ID:", id);
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  // Return the full product data
  return res.status(200).json({
    success: true,
    product,
  });
});



exports.AdminUpdateReadymadeProductForUser = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { productId } = req.params;

  let existingProduct = await AdminReadymadeProductForUser.findById(productId);
  if (!existingProduct) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Update the product fields
  existingProduct.set({
    ...req.body,
    storeId,
  });

  // Check if there are uploaded files
  if (
    req.files &&
    req.files.ReadymadeProductImage &&
    req.files.ReadymadeProductImage.length > 0
  ) {
    const files = req.files.ReadymadeProductImage;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    existingProduct.AdminReadymadeProductImage = data;
  }
  // Save the updated product
  const updatedProduct = await existingProduct.save();

  return res.status(200).json({
    success: true,
    message: "AdminReadymadeProduct updated successfully",
    updatedProduct,
  });
});


exports.AdminDeleteReadymadeProductForUser = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { productId } = req.params;

  if (!storeId) {
    return next(new AppError("User not authenticated", 401));
  }
  // Find the product by ID
  const existingProduct = await AdminReadymadeProductForUser.findById(productId);
  if (!existingProduct) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  await existingProduct.remove();
  return res.status(200).json({
    success: true,
    message: "AdminReadymadeProduct deleted successfully",
  });
});




exports.AdminsearchReadymadeProductsForUser = catchAsyncError(async (req, res) => {
  const { gender, productType, productColor, seen, productName, id, productNumber, search, storeId, minDiscount, maxDiscount, location, storeType, minPrice, maxPrice } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 4;

  let matchQuery = {};

  // If storeId is provided, include it in the matchQuery
  if (storeId) {
    matchQuery.storeId = mongoose.Types.ObjectId(storeId);
  }
  // Convert id to ObjectId if provided
  if (id) {
    matchQuery._id = mongoose.Types.ObjectId(id);
  }

  if (storeType) {
    const storeTypesArray = Array.isArray(storeType) ? storeType : [storeType];
    matchQuery.storeType = {
      $in: storeTypesArray.map((s) => new RegExp(s, "i")),
    };
  }
  
  if (productType) {
    const productTypeArray = Array.isArray(productType) ? productType : [productType];
    matchQuery.productType = {
      $in: productTypeArray.map((s) => new RegExp(s, "i")),
    };
  }

  if (productName) {
    const productNameArray = Array.isArray(productName) ? productName : [productName];
    matchQuery.productName = {
      $in: productNameArray.map((s) => new RegExp(s, "i")),
    };
  }

  if (productColor) {
    const productColorArray = Array.isArray(productColor) ? productColor : [productColor];
    matchQuery.productColor = {
      $in: productColorArray.map((c) => new RegExp(c, "i")),
    };
  }

  if (location) {
    const locationsArray = Array.isArray(location) ? location : [location];
    matchQuery.location = {
      $in: locationsArray.map((l) => new RegExp(l, "i")),
    };
  }



  if (minPrice && maxPrice) {
    matchQuery.productPrice = {
      $gte: parseInt(minPrice),
      $lte: parseInt(maxPrice),
    };
  } else if (minPrice) {
    matchQuery.productPrice = { $gte: parseInt(minPrice) };
  } else if (maxPrice) {
    matchQuery.productPrice = { $lte: parseInt(maxPrice) };
  }


  if (minDiscount && maxDiscount) {
    matchQuery.productDiscount = {
      $gte: parseInt(minDiscount),
      $lte: parseInt(maxDiscount),
    };
  } else if (minDiscount) {
    matchQuery.productDiscount= { $gte: parseInt(minDiscount) };
  } else if (maxDiscount) {
    matchQuery.productDiscount= { $lte: parseInt(maxDiscount) };
  }



  // Include other query parameters for filtering if provided
   matchQuery = {
      ...matchQuery,
      ...(seen && { seen: seen.toLowerCase() === 'true' }),
      ...(gender && { gender }),
      ...(productNumber && { productNumber }),
      ...(search && {
        $or: [
          { productName: { $regex: search, $options: "i" } },
          { productNumber: { $regex: search, $options: "i" } },
          { productColor: { $regex: search, $options: "i" } },
          { productType: { $regex: search, $options: "i" } },
          { storeType: { $regex: search, $options: "i" } },
        ],
      }),
    };
  

  console.log("matchQuery:", matchQuery);

  const { pipeline, countPipeline } = commonPipelineService(matchQuery, req.query);

  const foundProducts = await AdminReadymadeProductForUser.aggregate(pipeline);
  const countResult = await AdminReadymadeProductForUser.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  const showingResult = showingResults(req.query, totalCount);

  return res.status(200).json({
    success: true,
    message: foundProducts.length > 0 ? "Products retrieved successfully" : "No Products found",
    totalCount,
    showingResult,
    page,
    foundProducts,
  });
});



/******************************************************************************/
/******************  Readymade Accessories APIs Admin For Users ******************/


// exports.AdmincreateReadymadeAccessoriesForUser = catchAsyncError(async (req, res) => {
//   const { storeId,storeType } = req.user;
//   const newAdminReadymadeAccessories = new AdminReadymadeAccessoriesForUser({
//     ...req.body,
//     storeId,
//     storeType,
//   });

//   // Check if there are uploaded files
//   if (
//     req.files &&
//     req.files.ReadymadeAccessoriesImage &&
//     req.files.ReadymadeAccessoriesImage.length > 0
//   ) {
//     const files = req.files.ReadymadeAccessoriesImage;
//     const data = await Promise.all(files.map((file) => uploadToS3(file)));
//     newAdminReadymadeAccessories.ReadymadeAccessoriesImage = data;
//   }

//   const savedProduct = await newAdminReadymadeAccessories.save();
//   return res.status(200).json({
//     success: true,
//     message: "AdminReadymadeAccessories uploaded successfully",
//     savedProduct,
//   });
// });

exports.AdmincreateReadymadeAccessoriesForUser = catchAsyncError(async (req, res) => {
  const { storeId, storeType } = req.user;

  console.log("Request received for creating a ready-made accessory.");

  // Generate a unique accessoriesNumber if not provided in req.body
  const accessoriesNumber = req.body.accessoriesNumber || await OthersService.generateUniqueAccessorieNumber();
  console.log("Generated accessoriesNumber:", accessoriesNumber);

  // Create a new accessory instance
  const newAdminReadymadeAccessories = new AdminReadymadeAccessoriesForUser({
    ...req.body,
    storeId,
    storeType,
    accessoriesNumber, // Ensure accessoriesNumber is assigned
  });

  // Handle image upload if images are provided
  if (req.files && req.files.ReadymadeAccessoriesImage && req.files.ReadymadeAccessoriesImage.length > 0) {
    const files = req.files.ReadymadeAccessoriesImage;
    const uploadedImages = await Promise.all(files.map((file) => uploadToS3(file)));
    newAdminReadymadeAccessories.ReadymadeAccessoriesImage = uploadedImages;
  }

  // Save accessory to database
  const savedAccessory = await newAdminReadymadeAccessories.save();
  console.log("Accessory saved successfully:", savedAccessory);

  return res.status(200).json({
    success: true,
    message: "AdminReadymadeAccessories uploaded successfully",
    data: savedAccessory,
  });
});

exports.AdminUpdateReadymadeAccessoriesForUser = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { accessoriesId } = req.params;

  let existingAccessories = await AdminReadymadeAccessoriesForUser.findById(accessoriesId);
  if (!existingAccessories) {
    return res.status(404).json({ success: false, message: "Accessories not found" });
  }

  // Update the accessories fields
  existingAccessories.set({
    ...req.body,
    storeId,
  });

  // Check if there are uploaded files
  if (
    req.files &&
    req.files.ReadymadeAccessoriesImage &&
    req.files.ReadymadeAccessoriesImage.length > 0
  ) {
    const files = req.files.ReadymadeAccessoriesImage;
    const data = await Promise.all(files.map((file) => uploadToS3(file)));
    existingAccessories.ReadymadeAccessoriesImage = data;
  }

  const updatedAccessories = await existingAccessories.save();
  return res.status(200).json({
    success: true,
    message: "AdminReadymadeAccessories updated successfully",
    updatedAccessories,
  });
});

exports.AdminDeleteReadymadeAccessoriesForUser = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { accessoriesId } = req.params;

  if (!storeId) {
    return next(new AppError("User not authenticated", 401));
  }

  const existingAccessories = await AdminReadymadeAccessoriesForUser.findById(accessoriesId);
  if (!existingAccessories) {
    return res.status(404).json({ success: false, message: "Accessories not found" });
  }

  // Delete the accessories
  await existingAccessories.remove();
  return res.status(200).json({
    success: true,
    message: "AdminReadymadeAccessories deleted successfully",
  });
});


exports.AdminsearchReadymadeAccessoriesForUser = catchAsyncError(async (req, res) => {
  const { gender, seen, accessorieType, productName, id, accessoriesNumber, search, storeId } = req.query;
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;

  let matchQuery = {};

  if (storeId) {
    matchQuery.storeId = mongoose.Types.ObjectId(storeId);
  }
  // Convert id to ObjectId if provided
  if (id) {
    matchQuery._id = mongoose.Types.ObjectId(id);
  }

  console.log("matchQuery", matchQuery);

  // Merge properties into matchQuery
  matchQuery = {
    ...matchQuery, // Preserve previously set properties
    ...(seen && { seen: seen.toLowerCase() === 'true' }),
    ...(gender && { gender }),
    ...(accessorieType && { accessorieType }),
    ...(productName && { productName: { $regex: productName, $options: "i" } }),
    ...(accessoriesNumber && { accessoriesNumber }),
    ...(search && {
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { accessoriesNumber: { $regex: search, $options: "i" } },
      ],
    }),
  };
  console.log("matchquery", matchQuery);

  const { pipeline, countPipeline } = commonPipelineService(matchQuery, req.query);

  const foundAccessories = await AdminReadymadeAccessoriesForUser.aggregate(pipeline);
  const countResult = await AdminReadymadeAccessoriesForUser.aggregate(countPipeline);
  let totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  const showingResult = showingResults(req.query, totalCount);

  return res.status(200).json({
    success: true,
    message: foundAccessories.length > 0 ? "Accessories retrieved successfully" : "No Accessories found",
    totalCount,
    showingResult,
    page,
    foundAccessories,
  });
});




/*********************************** Contrast Styles For the Admin User *******************/

exports.adminCreateContrastStyle = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }
    const { storeId } = user;
    const store = await Store.findById(storeId);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const { genderName, productName, categories, catStyleNameArraytoDelete } = req.body;

    // Check if 'categories' is undefined or empty
    if (!categories || categories.length === 0 || !categories[0].name) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required, and it must have at least one element with a valid name',
      });
    }

    const existingStyle = await AdminContrastStyle.findOne({
      storeId: storeId,
      productName: productName,
    });

    if (existingStyle) {
      // Update existing categories or push new categories if not already present
      categories.forEach((newCategory) => {
        const existingCategoryIndex = existingStyle.categories.findIndex(
          (existingCategory) => existingCategory.name === newCategory.name
        );

        if (existingCategoryIndex !== -1) {
          // If category already exists, update its styles or push new style if not already present
          newCategory.styles.forEach((newStyle) => {
            const existingStyleIndex = existingStyle.categories[existingCategoryIndex].styles.findIndex(
              (existingStyle) => existingStyle.catStyleName === newStyle.catStyleName
            );

            if (existingStyleIndex !== -1) {
              // If style already exists, update it
              existingStyle.categories[existingCategoryIndex].styles[existingStyleIndex] = newStyle;
            } else {
              // If style doesn't exist, push the new style
              existingStyle.categories[existingCategoryIndex].styles.push(newStyle);
            }
          });

          // Delete styles specified in catStyleNameArraytoDelete
          existingStyle.categories[existingCategoryIndex].styles = existingStyle.categories[existingCategoryIndex].styles.filter(
            (existingStyle) => !catStyleNameArraytoDelete.includes(existingStyle.catStyleName)
          );
        } else {
          // If category doesn't exist, push the new category
          existingStyle.categories.push(newCategory);
        }
      });

      const updatedStyle = await existingStyle.save();

      return res.status(200).json({
        success: true,
        message: 'Contrast style updated successfully',
        data: updatedStyle,
      });
    }

    const newContrastStyle = new AdminContrastStyle({
      storeId: storeId,
      genderName: genderName,
      productName: productName,
      categories: categories,
    });

    const savedStyle = await newContrastStyle.save();

    return res.status(201).json({
      success: true,
      message: 'Contrast style added successfully',
      data: savedStyle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getAdminContrastStyle = async (req, res, next) => {
  try {
    const { storeId, productName } = req.params;

    // Find the contrast style based on storeId and productName
    const contrastStyle = await AdminContrastStyle.findOne({ storeId, productName });

    // If contrast style not found, return an error
    if (!contrastStyle) {
      return res.status(404).json({ success: false, message: 'Contrast style not found' });
    }

    // If contrast style found, return the contrast style data
    res.status(200).json({ success: true, message: 'Contrast style found successfully', data: contrastStyle });
  } catch (error) {
    console.error('Error while fetching contrast style:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching contrast style data' });
  }
};



