const Store = require("../models/stores");
const Product = require("../models/QuickOrderSetup");

const SuperadminProduct = require('../models/QuickorderNew_pro_sub');
const AdminProduct = require('../models/QuickorderNew_pro_sub_admin');
const SuperadminMesurment = require('../models/QuickorderNew_Measurment');
const AdminMesurment = require('../models/QuickorderNew_Measurment_Admin');
const { SuperadminButton, SuperadminButtonHole, SuperadminButtonThread,} = require('../models/QuickorderNew_Button');
const { AdminButton, AdminButtonHole, AdminButtonThread,} = require('../models/QuickorderNew_Button_Admin');



const SubProduct = require("../models/QuickOrderSetupCategory");
const Mesurment = require("../models/QuickSetupMesurment");
const Button = require("../models/QuickSetupButton");
const ButtonHole = require("../models/QuickSetupButtonHole");
const Font = require("../models/QuickSetupFont");
const Color = require("../models/QuickSetupColor");
const ColorThread = require("../models/QuickSetupColorThread");
const ReadymadeProduct = require("../models/Quicksetup_ReadymadeProduct");
const ReadymadeAccessories = require("../models/Quicksetup_ReadymadeAccessories");
const AppError = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const uploadToS3 = require("../utils/s3Upload");

/****************************** Add Product **************************/

//superadmin

exports.addProductSuperadmin = catchAsyncError(async (req, res, next) => {
  try {
    const { name, gender } = req.body;
    const categoryImage = req.files["CategoryImage"][0];
    const productImage = req.files["CategoryProductImg"]
      ? req.files["CategoryProductImg"][0]
      : null;

    const categoryImageUrl = await uploadToS3(categoryImage);
    const productImageUrl = productImage
      ? await uploadToS3(productImage)
      : null;

    if (!categoryImageUrl) {
      return next(
        new AppError("An error occurred during category image upload", 400)
      );
    }

    // Find the product with the same gender.name and gender.categories.name
    const existingProduct = await Product.findOne({
      "gender.name": gender.name,
      "gender.categories.name": gender.categories[0].name,
    });

    if (existingProduct) {
      // If it exists, find the category with the same name
      const existingCategory = existingProduct.gender.categories.find(
        (category) => category.name === gender.categories[0].name
      );

      if (existingCategory) {
        // If the category exists, add new subcategories to the existing category
        gender.categories[0].subcategories.forEach((subcategory) => {
          // Logging the subcategory to check if it's defined
          console.log("Subcategory:", subcategory);

          // Update the following line to use the file URL from the request
          subcategory.subCatImage = categoryImageUrl;

          existingCategory.subcategories.push({
            name: subcategory.name,
            subCatImage: subcategory.subCatImage,
            subCatNumber: subcategory.subCatNumber,
          });
        });

        await existingProduct.save();

        // Update the product image URL if provided
        if (productImageUrl) {
          existingProduct.productImage = productImageUrl;
          await existingProduct.save();
        }

        return res.status(201).json({
          message: "Subcategories and product image added successfully",
          data: existingProduct,
        });
      }
    }

    // If the product or category doesn't exist, create a new product
    const newProduct = new Product({
      name,
      gender: {
        name: gender.name,
        categories: [
          {
            name: gender.categories[0].name,
            subcategories: gender.categories[0].subcategories.map(
              (subcategory) => ({
                name: subcategory.name,
                subCatImage: categoryImageUrl, // Use the file URL from the request
                subCatNumber: subcategory.subCatNumber,
              })
            ),
          },
        ],
      },
    });

    // Set the product image URL if provided
    if (productImageUrl) {
      newProduct.productImage = productImageUrl;
    }

    // Logging the newProduct to check the subCatImage value
    console.log("New Product:", newProduct);

    await newProduct.save();

    return res
      .status(201)
      .json({ message: "Product added successfully", data: newProduct });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return next(new AppError("Internal server error", 500));
  }
});

//admin

exports.addProductAdmin = catchAsyncError(async (req, res, next) => {
  try {
    // Retrieve user and storeId from the authenticated user
    const user = req.user;

    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { storeId } = user;

    // Now you have the storeId, you can use it in your logic
    const store = await Store.findById(storeId);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const { name, gender } = req.body;
    const categoryImage = req.files["CategoryImage"][0];
    const productImage = req.files["CategoryProductImg"]
      ? req.files["CategoryProductImg"][0]
      : null;

    const categoryImageUrl = await uploadToS3(categoryImage);
    const productImageUrl = productImage
      ? await uploadToS3(productImage)
      : null;

    if (!categoryImageUrl) {
      return next(
        new AppError("An error occurred during category image upload", 400)
      );
    }

    // Find the product with the same gender.name and gender.categories.name
    const existingProduct = await Product.findOne({
      "gender.name": gender.name,
      "gender.categories.name": gender.categories[0].name,
    });

    if (existingProduct) {
      // If it exists, find the category with the same name
      const existingCategory = existingProduct.gender.categories.find(
        (category) => category.name === gender.categories[0].name
      );

      if (existingCategory) {
        // If the category exists, add new subcategories to the existing category
        gender.categories[0].subcategories.forEach((subcategory) => {
          subcategory.subCatImage = categoryImageUrl;
          existingCategory.subcategories.push({
            name: subcategory.name,
            subCatImage: subcategory.subCatImage,
            subCatNumber: subcategory.subCatNumber,
          });
        });

        await existingProduct.save();

        // Update the product image URL if provided
        if (productImageUrl) {
          existingProduct.productImage = productImageUrl;
          await existingProduct.save();
        }

        return res.status(201).json({
          message: "Subcategories and product image added successfully",
          data: existingProduct,
        });
      }
    }

    // If the product or category doesn't exist, create a new product
    const newProduct = new Product({
      storeId,
      name,
      gender: {
        name: gender.name,
        categories: [
          {
            name: gender.categories[0].name,
            subcategories: gender.categories[0].subcategories.map(
              (subcategory) => ({
                name: subcategory.name,
                subCatImage: categoryImageUrl,
                subCatNumber: subcategory.subCatNumber,
              })
            ),
          },
        ],
      },
    });

    // Set the product image URL if provided
    if (productImageUrl) {
      newProduct.productImage = productImageUrl;
    }

    await newProduct.save();

    return res
      .status(201)
      .json({ message: "Product added successfully", data: newProduct });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError("Internal server error", 500));
  }
});

/********************** Search product by her Name *************/

exports.searchCategories = async (req, res, next) => {
  try {
    const { categoryName } = req.query;

    // Validate that categoryName is provided in the query
    if (!categoryName) {
      return next(new AppError("Category name is required for search", 400));
    }

    // Use MongoDB's regex to perform a case-insensitive search for the category name
    const categories = await Product.find({
      "gender.categories.name": { $regex: new RegExp(categoryName, "i") },
    });

    if (categories.length === 0) {
      return res
        .status(404)
        .json({ message: "No categories found for the given search" });
    }

    return res
      .status(200)
      .json({ message: "Categories found successfully", data: categories });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError("Internal server error", 500));
  }
};

/*************************** Update Product ****************************/

/*********** */

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { productId, subcategoryId } = req.params;
    const { gender } = req.body;
    const image = req.files["CategoryImage"]
      ? req.files["CategoryImage"][0]
      : null; // Check if image is present in the request
    const { subCatNumber, name: subCatName } =
      gender.categories[0].subcategories[0];

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let fileUrl =
      existingProduct.gender.categories[0].subcategories[0].subCatImage
        .imageUrl; // Use existing image URL by default

    // Check if a new image file was provided in the request
    if (image) {
      fileUrl = await uploadToS3(image);
      if (!fileUrl) {
        return next(new AppError("An error occurred during image upload", 400));
      }
    }

    const subcategoryIndex =
      existingProduct.gender.categories[0].subcategories.findIndex(
        (subcategory) => subcategory._id.toString() === subcategoryId
      );

    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    if (image) {
      // Delete the previous subCatImage from storage (if it exists)
      if (
        existingProduct.gender.categories[0].subcategories[subcategoryIndex]
          .subCatImage.imageUrl
      ) {
        await deleteFromS3(
          existingProduct.gender.categories[0].subcategories[subcategoryIndex]
            .subCatImage.imageUrl
        );
      }
      // Update the subCatImage only if a new image is provided
      existingProduct.gender.categories[0].subcategories[
        subcategoryIndex
      ].subCatImage = fileUrl;
    }

    existingProduct.gender.categories[0].subcategories[subcategoryIndex].name =
      subCatName ||
      existingProduct.gender.categories[0].subcategories[subcategoryIndex].name;
    existingProduct.gender.categories[0].subcategories[
      subcategoryIndex
    ].subCatNumber =
      subCatNumber ||
      existingProduct.gender.categories[0].subcategories[subcategoryIndex]
        .subCatNumber;

    await existingProduct.save();

    return res
      .status(200)
      .json({ message: "Product updated successfully", data: existingProduct });
  } catch (error) {
    console.log("error", error);
    return next(new AppError("Internal server error", 500));
  }
});

/**************************** Delete Product ***************************/

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { productId, subcategoryId } = req.params;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const subcategoryIndex =
      existingProduct.gender.categories[0].subcategories.findIndex(
        (subcategory) => subcategory._id.toString() === subcategoryId
      );

    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Delete the subcategory from the array
    existingProduct.gender.categories[0].subcategories.splice(
      subcategoryIndex,
      1
    );

    // Save the updated product
    await existingProduct.save();

    return res
      .status(200)
      .json({
        message: "Subcategory deleted successfully",
        data: existingProduct,
      });
  } catch (error) {
    console.log("error", error);
    return next(new AppError("Internal server error", 500));
  }
});

/*************************** Add Subcategory ************************/

//superadmin

exports.addSubProductSuperadmin = catchAsyncError(async (req, res, next) => {
  try {
    const { product, category, subcategory, styles } = req.body;
    // console.log('Request Body:', req.body);

    const image = req.files["SubCategoryImage"][0];
    // console.log('Request Files:', req.files);

    // Check if a SubProduct with the same product, category, and subcategory already exists
    const existingSubProduct = await SubProduct.findOne({
      product,
      category,
      subcategory,
    });

    if (existingSubProduct) {
      // If it exists, update the existing document by adding styles and the image URL
      const fileUrl = await uploadToS3(image);
      // console.log('File URL:', fileUrl);

      if (!fileUrl) {
        return next(new AppError("An error occurred during image upload", 400));
      }

      // Create a new style object with the required fields
      const newStyles = styles.map((style) => ({
        catStyleName: style.catStyleName,
        catStyleNumber: style.catStyleNumber,
        styleImage: fileUrl,
      }));

      existingSubProduct.styles.push(...newStyles);

      // Save the updated SubProduct
      const updatedSubProduct = await existingSubProduct.save();

      res.status(200).json({
        message: "SubProduct updated successfully",
        data: updatedSubProduct,
      });
    } else {
      // When creating a new product
      const newSubProduct = new SubProduct({
        product,
        category,
        subcategory,
        styles,
        styleImage: "",
      });

      const fileUrl = await uploadToS3(image);
      if (!fileUrl) {
        return next(new AppError("An error occurred during image upload", 400));
      }

      // Update the styleImage field with the fileUrl
      newSubProduct.styles.forEach((style) => {
        style.styleImage = fileUrl;
      });

      await newSubProduct.save();

      return res
        .status(201)
        .json({ message: "Product added successfully", data: newSubProduct });
    }
  } catch (error) {
    // Inside your error handling middleware
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});

//admin

exports.addSubProductAdmin = catchAsyncError(async (req, res, next) => {
  try {
    // Retrieve user and storeId from the authenticated user
    const user = req.user;

    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { storeId } = user;

    // Now you have the storeId, you can use it in your logic
    const store = await Store.findById(storeId);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    const { product, category, subcategory, styles } = req.body;
    const image = req.files["SubCategoryImage"][0];

    // Check if a SubProduct with the same product, category, and subcategory already exists
    const existingSubProduct = await SubProduct.findOne({
      product,
      category,
      subcategory,
      // storeId: storeId, // Ensure the SubProduct is associated with the correct store
    });

    if (existingSubProduct) {
      // If it exists, update the existing document by adding styles and the image URL
      const fileUrl = await uploadToS3(image);

      if (!fileUrl) {
        return next(new AppError("An error occurred during image upload", 400));
      }

      // Create a new style object with the required fields
      const newStyles = styles.map((style) => ({
        catStyleName: style.catStyleName,
        catStyleNumber: style.catStyleNumber,
        styleImage: fileUrl,
        storeId: storeId, // Ensure the style is associated with the correct store
      }));

      existingSubProduct.styles.push(...newStyles);

      // Save the updated SubProduct
      const updatedSubProduct = await existingSubProduct.save();

      res.status(200).json({
        message: "SubProduct updated successfully",
        data: updatedSubProduct,
      });
    } else {
      // When creating a new product
      const fileUrl = await uploadToS3(image);
      if (!fileUrl) {
        return next(new AppError("An error occurred during image upload", 400));
      }

      const newSubProduct = new SubProduct({
        // storeId,
        product,
        category,
        subcategory,
        styles: styles.map((style) => ({
          catStyleName: style.catStyleName,
          catStyleNumber: style.catStyleNumber,
          styleImage: fileUrl,
          storeId: storeId, // Ensure the style is associated with the correct store
        })),
        styleImage: fileUrl,
      });

      await newSubProduct.save();

      return res
        .status(201)
        .json({ message: "Product added successfully", data: newSubProduct });
    }
  } catch (error) {
    // Inside your error handling middleware
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});




/**************** Get all subproduct and own  subproduct admin   Working Fine ************/
/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/


/***************own not work properly in server side*********/

exports.getownSubProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { id, storeId } = req.params;

    console.log("id before filtering:", id);
    console.log("storeId:", storeId);

    const store = await Store.findById(storeId);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    let subProducts;

    // Use a generic method that should work for both MongoDB and DocumentDB
    subProducts = await SubProduct.find({ _id: id, storeId }).lean();

    console.log("SubProducts from the database:", subProducts);

    if (!subProducts || subProducts.length === 0) {
      return next(new AppError("No SubProducts found for the given storeId and id", 404));
    }

    const subProductsWithFilteredStyles = subProducts.map(subProduct => {
      const filteredStyles = subProduct.styles.filter(
        style => String(style.storeId) === storeId
      );

      return {
        ...subProduct,
        styles: filteredStyles,
      };
    });

    console.log("SubProducts after filtering:", subProductsWithFilteredStyles);

    res.status(200).json({
      message: "SubProducts retrieved successfully",
      data: subProductsWithFilteredStyles,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});


/***************** take all subproduct by id *********/


exports.getSubProductsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the SubProduct based on the provided id
    const subProduct = await SubProduct.findById(id);

    // Check if the SubProduct is found
    if (!subProduct) {
      return res.status(404).json({
        success: false,
        message: 'SubProduct not found',
      });
    }

    // Respond with the SubProduct data
    res.status(200).json({
      success: true,
      message: 'SubProduct retrieved successfully',
      data: subProduct,
    });
  } catch (error) {
    console.error(error);
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




/******************* For All *************/


exports.getSubProducts = catchAsyncError(async (req, res, next) => {
  try {
    // Retrieve all SubProducts from the database
    const subProducts = await SubProduct.find();

    res.status(200).json({
      message: "SubProducts retrieved successfully",
      data: subProducts,
    });
  } catch (error) {
    // Inside your error handling middleware
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});




/********************** delete styles in subproduct *****************/

exports.deleteStyleById = async (req, res, next) => {
  try {
    const { subProductId, styleId } = req.params;

    // Find the SubProduct based on the provided subProductId
    const subProduct = await SubProduct.findById(subProductId);

    // Check if the SubProduct is found
    if (!subProduct) {
      return res.status(404).json({
        success: false,
        message: 'SubProduct not found',
      });
    }

    // Find the index of the style in the styles array
    const styleIndex = subProduct.styles.findIndex(style => String(style._id) === styleId);

    // Check if the style is found
    if (styleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Style not found in the SubProduct',
      });
    }

    // Remove the style from the styles array
    subProduct.styles.splice(styleIndex, 1);

    // Save the updated SubProduct
    await subProduct.save();

    // Respond with success message
    res.status(200).json({
      success: true,
      message: 'Style deleted successfully',
    });
  } catch (error) {
    console.error(error);
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




/*****************************************************************************************/
/*****************************************************************************************/
/*****************************************************************************************/





/**************************** Update Subcategory *******************/

exports.updateSubProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { subproductId } = req.params; // Get subproductId from URL
    const { product, category, subcategory, styles } = req.body;
    const image = req.files["SubCategoryImage"][0];

    // Find the existing SubProduct by subproductId
    const existingSubProduct = await SubProduct.findOne({
      "styles._id": subproductId,
    });

    if (!existingSubProduct) {
      return next(new AppError("SubProduct not found", 404));
    }

    // Log the current styleImage before updating
    console.log("Current styleImage:", existingSubProduct.styleImage);

    // Delete the existing style image from S3 if it exists
    if (existingSubProduct.styleImage) {
      await deleteFromS3(existingSubProduct.styleImage);
    }

    // Update the existing SubProduct with the new data
    const fileUrl = await uploadToS3(image);

    if (!fileUrl) {
      return next(new AppError("An error occurred during image upload", 400));
    }

    // Find the index of the style within the styles array
    const styleIndex = existingSubProduct.styles.findIndex(
      (style) => style._id.toString() === subproductId
    );

    if (styleIndex === -1) {
      return next(new AppError("Style not found within SubProduct", 404));
    }

    // Update the SubProduct fields with the new values
    existingSubProduct.product = product;
    existingSubProduct.category = category;
    existingSubProduct.subcategory = subcategory;

    // Create a new style object with the required fields
    const newStyles = styles.map((style) => ({
      catStyleName: style.catStyleName,
      catStyleNumber: style.catStyleNumber,
      styleImage: fileUrl,
    }));

    // Update the specific style within the styles array
    existingSubProduct.styles[styleIndex] = newStyles[0];

    // Save the updated SubProduct
    const updatedSubProduct = await existingSubProduct.save();

    res.status(200).json({
      message: "SubProduct updated successfully",
      data: updatedSubProduct,
    });
  } catch (error) {
    // Inside your error handling middleware
    // console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});

/**************************** Delete Subcategory *******************/

exports.deleteSubProduct = catchAsyncError(async (req, res, next) => {
  try {
    const { subproductId } = req.params; // Get subproductId from URL

    // Find the existing SubProduct by subproductId
    const existingSubProduct = await SubProduct.findOne({
      "styles._id": subproductId,
    });

    if (!existingSubProduct) {
      return next(new AppError("SubProduct not found", 404));
    }

    // Delete the style image from S3 if it exists
    if (existingSubProduct.styleImage) {
      await deleteFromS3(existingSubProduct.styleImage);
    }

    // Remove the specific style from the styles array
    existingSubProduct.styles = existingSubProduct.styles.filter(
      (style) => style._id.toString() !== subproductId
    );

    // Save the updated SubProduct without the deleted style
    const updatedSubProduct = await existingSubProduct.save();

    res.status(200).json({
      message: "SubProduct deleted successfully",
      data: updatedSubProduct,
    });
  } catch (error) {
    // Inside your error handling middleware
    // console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});

/*********************** Update flag toggleStyleFlag true and false *************************/

exports.updateStyleFlag = catchAsyncError(async (req, res, next) => {
  try {
    const { styleId } = req.params; // Get styleId from URL

    // Find the existing SubProduct containing the style with styleId
    const existingSubProduct = await SubProduct.findOne({
      "styles._id": styleId,
    });

    if (!existingSubProduct) {
      return next(new AppError("Style not found within SubProduct", 404));
    }

    // Find the index of the style within the styles array
    const styleIndex = existingSubProduct.styles.findIndex(
      (style) => style._id.toString() === styleId
    );

    if (styleIndex === -1) {
      return next(new AppError("Style not found within SubProduct", 404));
    }

    // Toggle the flag field of the specific style
    existingSubProduct.styles[styleIndex].flag =
      !existingSubProduct.styles[styleIndex].flag;

    // Save the updated SubProduct
    const updatedSubProduct = await existingSubProduct.save();

    res.status(200).json({
      message: `Style flag toggled to ${existingSubProduct.styles[styleIndex].flag} successfully`,
      data: updatedSubProduct,
    });
  } catch (error) {
    // Inside your error handling middleware
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});

/****************** Get true value acq to Product id****************/

exports.getSubProductsWithFlag = async (req, res) => {
  try {
    const { productId } = req.params;

    const subProducts = await SubProduct.find({
      "styles.flag": true,
      product: productId,
    });

    if (!subProducts || subProducts.length === 0) {
      return res
        .status(200)
        .json({
          message: `No SubProducts with flag set to true found for productId: ${productId}`,
          data: [],
        });
    }

    const simplifiedStyles = subProducts.flatMap((product) => {
      return product.styles
        .filter((style) => style.flag === true)
        .map((style) => ({
          _id: style._id,
          catStyleName: style.catStyleName,
          catStyleNumber: style.catStyleNumber,
          flag: true,
          styleImage: style.styleImage,
          productId: product.product,
          categoryId: product.category,
          subcategoryId: product.subcategory,
        }));
    });

    res
      .status(200)
      .json({
        message: `Styles with flag set to true found for productId: ${productId}`,
        data: simplifiedStyles,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/********************************* By a Id ***********************/

exports.getSubProductsWithFlagandId = async (req, res) => {
  try {
    const { id } = req.params;
    const subProduct = await SubProduct.findOne({
      _id: id,
      "styles.flag": true,
    });

    if (!subProduct) {
      return res
        .status(404)
        .json({
          message: "SubProduct not found or no styles with flag set to true",
        });
    }

    const filteredStyles = subProduct.styles.filter(
      (style) => style.flag === true
    );

    res
      .status(200)
      .json({
        message: "SubProduct with flag set to true found",
        data: filteredStyles,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/******************************* Get Whole Propduct *******************/

exports.getProducts = catchAsyncError(async (req, res, next) => {
  try {
    const products = await Product.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Data get successfully",
        data: products,
      });
  } catch (error) {
    return next(new AppError("Internal server error", 500));
  }
});


/************************************************************************/
/******************  Update storeIdentity by storeId for admin **********/


exports.updateStoresIdentities = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    const subProduct = await SubProduct.findOne({
      "styles._id": id,
    });

    if (!subProduct) {
      console.log("SubProduct not found!");
      return next(new AppError("SubProduct not found", 404));
    }

    // Update the storesIdentifier field within the styles array
    const styleIndex = subProduct.styles.findIndex((style) =>
      style._id.equals(id)
    );

    if (styleIndex !== -1) {
      // Check if storesIdentifier is an array, and push new values
      const user = req.user;
      if (!user) {
        return next(new AppError("User not authenticated", 401));
      }

      const { storeId } = user;

      // Now you have the storeId, you can use it in your logic
      const store = await Store.findById(storeId);

      // Check if the store is not already in the array before pushing
      const existingStoreIndex = subProduct.styles[styleIndex].storesIdentifier.findIndex(
        (storeIdentity) => storeIdentity.storeId.equals(storeId)
      );

      if (existingStoreIndex === -1) {
        // Save storeId in storesIdentifier array
        subProduct.styles[styleIndex].storesIdentifier.push({ storeId });
      }
    } else {
      console.log("Style not found!");
      return next(new AppError("Style not found", 404));
    }

    // Save the updated SubProduct
    const updatedSubProduct = await subProduct.save();

    console.log("Updated SubProduct:", updatedSubProduct);

    res.status(200).json({
      message: "SubProduct updated successfully",
      data: updatedSubProduct,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});


/******************  Update storeflag value by storeId for admin *********/


exports.updateStoresflag = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    const subProduct = await SubProduct.findOne({
      "styles.storesIdentifier._id": id,
    });

    if (!subProduct) {
      console.log("SubProduct not found!");
      return next(new AppError("SubProduct not found", 404));
    }

    // Find the index of the styles array that contains the storesIdentifier with the given id
    const styleIndex = subProduct.styles.findIndex((style) =>
      style.storesIdentifier.some((identity) => identity._id.equals(id))
    );

    if (styleIndex !== -1) {
      // Toggle the storeflag for the storesIdentifier with the given id
      const targetIdentityIndex = subProduct.styles[styleIndex].storesIdentifier.findIndex(
        (identity) => identity._id.equals(id)
      );

      if (targetIdentityIndex !== -1) {
        subProduct.styles[styleIndex].storesIdentifier[targetIdentityIndex].storeflag = !subProduct.styles[styleIndex].storesIdentifier[targetIdentityIndex].storeflag;
      } else {
        console.log("StoresIdentifier not found!");
        return next(new AppError("StoresIdentifier not found", 404));
      }
    } else {
      console.log("Style not found!");
      return next(new AppError("Style not found", 404));
    }

    // Save the updated SubProduct
    const updatedSubProduct = await subProduct.save();

    console.log("Updated SubProduct:", updatedSubProduct);

    res.status(200).json({
      message: "SubProduct updated successfully",
      data: updatedSubProduct,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});


/******************* Get default subCategory data  ************************/


exports.getSubProductsWithTrueStoreFlag = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { storeId } = user;

    // Now you have the storeId, you can use it in your logic
    const store = await Store.findById(storeId);

    const subProducts = await SubProduct.find({
      'styles.storesIdentifier.storeflag': true
    });

    if (!subProducts || subProducts.length === 0) {
      console.log("No SubProducts found with true storeflag");
      return res.status(404).json({
        message: "No SubProducts found with true storeflag. Please first select default styles.",
        data: [],
      });
    }

    // Filter and include only styles with true storeflag and matching storeId
    const filteredStyles = subProducts.map((subProduct) => {
      const stylesWithTrueStoreFlag = subProduct.styles.filter((style) =>
        style.storesIdentifier.some((identity) => identity.storeflag === true && identity.storeId.equals(storeId))
      );

      if (stylesWithTrueStoreFlag.length > 0) {
        return {
          ...subProduct.toObject(),
          styles: stylesWithTrueStoreFlag,
        };
      }

      return null;
    }).filter(Boolean);

    if (filteredStyles.length === 0) {
      return res.status(404).json({
        message: "No matching styles found with true storeflag. Please first select default styles.",
        data: [],
      });
    }

    res.status(200).json({
      message: "SubProducts with true storeflag retrieved successfully",
      data: filteredStyles,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});

/************************************************************************/
/************************************************************************/







/*********************** Get specfic data by a id or storeNumber *********************/

exports.getSubProductsByStoresIdentities = catchAsyncError(
  async (req, res, next) => {
    try {
      const { storesIdentities, id } = req.params;

      console.log("Stores Identities:", storesIdentities);
      console.log("SubProduct ID:", id);

      // Use aggregation to filter SubProducts based on the condition
      const filteredSubProducts = await SubProduct.aggregate([
        {
          $unwind: "$styles", // Unwind the styles array
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(id), // Match by SubProduct ID
            "styles.storesIdentities": storesIdentities,
          },
        },
        {
          $group: {
            _id: "$_id",
            product: { $first: "$product" },
            category: { $first: "$category" },
            subcategory: { $first: "$subcategory" },
            styles: { $push: "$styles" },
            __v: { $first: "$__v" },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        message: "SubProducts retrieved successfully",
        data: filteredSubProducts,
      });
    } catch (error) {
      // Handle errors
      console.error(error);
      return next(new AppError("Internal server error", 500));
    }
  }
);

/************************** Get SubProducts All *************************************/

exports.getAllSubProducts = catchAsyncError(async (req, res, next) => {
  try {
    const allSubProducts = await SubProduct.find();

    res.status(200).json({
      success: true,
      message: "All SubProducts retrieved successfully",
      data: allSubProducts,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});

/***************************** Get SubProducts by SubCategory id *********************/

exports.getSubProductById = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the SubProduct by SubCategory ID
    const subProduct = await SubProduct.findOne({ subcategory: id });

    console.log("SubCategory ID:", id);
    console.log("SubProduct:", subProduct);

    if (!subProduct) {
      return res.status(404).json({
        success: false,
        message: "SubProduct not found with the provided SubCategory ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubProduct retrieved successfully!",
      subProduct: subProduct,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

/********************* Get Products by her gentder and catogary in params **************/

exports.getProductByCategoryName = catchAsyncError(async (req, res, next) => {
  try {
    const { gender, category } = req.params;

    // Find all products that match the provided gender and category name
    const products = await Product.find({
      "gender.name": gender,
      "gender.categories.name": category,
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Products not found with the provided gender and category name.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully!",
      products: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


/************************************ Testing ********************************/

exports.getSubProductsByStoreId = catchAsyncError(async (req, res, next) => {
  try {
    // Retrieve user and storeId from the authenticated user
    const user = req.user;

    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { storeId } = user;

    // Now you have the storeId, you can use it in your logic
    const store = await Store.findById(storeId);

    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if productId is provided in the request parameters
    const { productId } = req.params;

    if (!productId) {
      return next(new AppError("productId is required", 400));
    }

    // Check if a SubProduct with the given storeId and productId exists
    const subProduct = await SubProduct.findOne({
      storeId,
      product: productId,
    });

    if (subProduct) {
      // If it exists, filter styles based on the specified storeId
      const filteredStyles = subProduct.styles?.filter(
        (style) => style.storeId?.toString() === storeId
      );

      // Update the subProduct object with the filtered styles
      subProduct.styles = filteredStyles || [];

      // Return the modified SubProduct details
      res.status(200).json({
        message: "SubProduct details retrieved successfully",
        data: [subProduct],
      });
    } else {
      res.status(404).json({
        message: "No SubProduct found for the specified productId and storeId",
      });
    }
  } catch (error) {
    // Inside your error handling middleware
    // console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});


/********************* Main Working Api ***********************/


exports.searchSubProduct = catchAsyncError(async (req, res, next) => {
  try {
    const search = req.query.search;
    const productId = req.params.productId;

    if (!search || !productId) {
      return res
        .status(400)
        .json({ message: "Both search and productId parameters are required" });
    }

    const user = req.user;

    if (!user) {
      return next(new AppError("User not authenticated", 401));
    }

    const { storeId } = user;

    // Now you have the storeId, you can use it in your logic
    const store = await Store.findById(storeId);

    const matchingSubProducts = await SubProduct.aggregate([
      {
        $match: {
          product: mongoose.Types.ObjectId(productId),
          "styles.catStyleName": { $regex: new RegExp(search, "i") },
        },
      },
    ]);

    const filteredSubProducts = matchingSubProducts
      .map((subProduct) => {
        const matchingStyles = subProduct.styles.filter((style) =>
          new RegExp(search, "i").test(style.catStyleName) && (!style.storeId || style.storeId.equals(storeId))
        );

        if (matchingStyles.length > 0) {
          // Filter out styles where storeId is not present in either storeId or storesIdentifier
          const filteredStyles = matchingStyles.filter((style) => {
            return style.storeId || (style.storesIdentifier && style.storesIdentifier.some((identifier) => identifier.storeId.equals(storeId)));
          });

          if (filteredStyles.length > 0) {
            return { ...subProduct, styles: filteredStyles };
          }
        }
        return null;
      })
      .filter(Boolean);

    if (filteredSubProducts.length > 0) {
      res.status(200).json({
        message: "Search successful",
        data: filteredSubProducts,
      });
    } else {
      res.status(404).json({
        message: "No matching subproducts found",
        data: [],
      });
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal server error", 500));
  }
});









/**********************************************************************/
/******************************* Mesurment Sections********************/

exports.addMesurment = async (req, res, next) => {
  try {
    const { name, gender, categories } = req.body;
    const mesurmentImage = req.files["mesurmentImage"][0];
    console.log("Request Files:", req.files);
    console.log("Mesurment Image:", mesurmentImage);

    const mesurmentImageUrl = await uploadToS3(mesurmentImage);

    if (!mesurmentImageUrl) {
      return next(
        new AppError("An error occurred during Mesurment image upload", 400)
      );
    }

    // Find the Mesurment with the same gender
    const existingMesurment = await Mesurment.findOne({
      gender: gender,
    });

    if (existingMesurment) {
      // Find the category with the same name
      const categoryIndex = existingMesurment.categories.findIndex(
        (category) => category.name === categories[0].name
      );

      if (categoryIndex !== -1) {
        // Category exists, add mesurment to the existing category
        existingMesurment.categories[categoryIndex].mesurments.push({
          name: categories[0].mesurments[0].name,
          mesurmentImage: mesurmentImageUrl,
        });

        await existingMesurment.save();

        return res.status(201).json({
          message: "Mesurment categories added successfully",
          data: existingMesurment,
        });
      }
    }

    // If the Mesurment doesn't exist or the category doesn't exist, create a new Mesurment
    const newMesurment = new Mesurment({
      name,
      gender,
      categories: [
        {
          name: categories[0].name,
          mesurments: [
            {
              name: categories[0].mesurments[0].name,
              mesurmentImage: mesurmentImageUrl,
            },
          ],
        },
      ],
    });

    await newMesurment.save();

    return res.status(201).json({
      message: "Mesurment added successfully",
      data: newMesurment,
    });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError("Internal server error", 500));
  }
};

/****************** Get measurment ****************/

exports.getMesurmentByName = async (req, res, next) => {
  try {
    const categoryName = req.query.name;

    if (!categoryName) {
      return res.status(400).json({
        message: "Category name is required in the query parameter",
      });
    }

    // Find the Mesurment with the category name
    const mesurment = await Mesurment.findOne({
      "categories.name": categoryName,
    });

    if (!mesurment) {
      return res.status(404).json({
        message: "Mesurment not found for the given category name",
      });
    }

    // Filter categories based on the category name
    const filteredCategories = mesurment.categories.filter(
      (category) => category.name === categoryName
    );

    const result = {
      _id: mesurment._id,
      name: mesurment.name,
      gender: mesurment.gender,
      categories: filteredCategories,
      createdAt: mesurment.createdAt,
      updatedAt: mesurment.updatedAt,
      __v: mesurment.__v,
    };

    return res.status(200).json({
      message: "Mesurment found successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError("Internal server error", 500));
  }
};







/////////////////BUTTON ADD & GET ADMIN & SUPERADMIN BOTH/////////////////
/********************** Add Button Superadmin  *******************/

exports.createButton = async (req, res) => {
  try {
    const { name, categories } = req.body;
    const buttonImage = req.files["buttonImage"][0];

    // Upload buttonImage to S3
    const buttonImageUrl = await uploadToS3(buttonImage);

    if (!buttonImageUrl) {
      return res
        .status(400)
        .json({ message: "Error uploading buttonImage to S3" });
    }

    // // Check if button with the same name already exists
    // const existingButton = await Button.findOne({ name });
    const existingButton = await Button.findOne({
      "categories.name": categories[0].name,
    });

    if (existingButton) {
      // Find the category with the same name
      const categoryIndex = existingButton.categories.findIndex(
        (category) => category.name === categories[0].name
      );

      if (categoryIndex !== -1) {
        // Category exists, add button to the existing category
        existingButton.categories[categoryIndex].Buttons.push({
          name: categories[0].Buttons[0].name,
          buttonImage: buttonImageUrl,
        });

        await existingButton.save();

        return res.status(201).json({
          message: "Button categories added successfully",
          data: existingButton,
        });
      }
    }

    // If the button doesn't exist or the category doesn't exist, create a new button
    const newButton = new Button({
      name,
      categories: [
        {
          name: categories[0].name,
          Buttons: [
            {
              name: categories[0].Buttons[0].name,
              buttonImage: buttonImageUrl,
            },
          ],
        },
      ],
    });

    await newButton.save();

    res.status(200).json({
      succes: true,
      message: "Button added successfully",
      data: newButton,
    });
  } catch (error) {
    console.error("Error creating button:", error);
    res.status(500).send("Internal Server Error");
  }
};

/************************** Get Button superadmin ****************/

exports.getButtonByName = async (req, res, next) => {
  try {
    const categoryName = req.query.name;

    if (!categoryName) {
      return res.status(400).json({
        message: "Category name is required in the query parameter",
      });
    }

    // Find the Button with the category name
    const button = await Button.findOne({
      "categories.name": categoryName,
    });

    if (!button) {
      return res.status(404).json({
        message: "Button not found for the given category name",
      });
    }

    // Filter categories based on the category name
    const filteredCategories = button.categories.filter(
      (category) => category.name === categoryName
    );

    const result = {
      _id: button._id,
      name: button.name,
      categories: filteredCategories,
      createdAt: button.createdAt,
      updatedAt: button.updatedAt,
    };

    return res.status(200).json({
      succes: true,
      message: "Button found successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError("Internal server error", 500));
  }
};

///////////////////////////////////////////////////////////////////
/*********************** Add Button Admin ************************/

exports.createButtonAdmin = async (req, res) => {
  try {
    const storeId = req.user.storeId; // Add this line to get the storeId from the authenticated user

    const { name, categories } = req.body;
    const buttonImage = req.files["buttonImage"][0];

    // Upload buttonImage to S3
    const buttonImageUrl = await uploadToS3(buttonImage);

    if (!buttonImageUrl) {
      return res
        .status(400)
        .json({ message: "Error uploading buttonImage to S3" });
    }

    // Check if a button with the same storeId already exists
    const existingButton = await Button.findOne({ storeId });

    if (existingButton) {
      // Find the category with the same name
      const categoryIndex = existingButton.categories.findIndex(
        (category) => category.name === categories[0].name
      );

      if (categoryIndex !== -1) {
        // Category exists, add button to the existing category
        existingButton.categories[categoryIndex].Buttons.push({
          name: categories[0].Buttons[0].name,
          buttonImage: buttonImageUrl,
        });

        await existingButton.save();

        return res.status(201).json({
          message: "Button categories added successfully",
          data: existingButton,
        });
      }
    }

    // If the button doesn't exist or the category doesn't exist, create a new button
    const newButton = new Button({
      storeId, // Add the storeId to the new button
      name,
      categories: [
        {
          name: categories[0].name,
          Buttons: [
            {
              name: categories[0].Buttons[0].name,
              buttonImage: buttonImageUrl,
            },
          ],
        },
      ],
    });

    await newButton.save();

    res.status(200).json({
      success: true,
      message: "Button added successfully",
      data: newButton,
    });
  } catch (error) {
    console.error("Error creating button:", error);
    res.status(500).send("Internal Server Error");
  }
};

/*********************** Get Button Admin ************************/

exports.getButtonsAdminByStoreId = async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Retrieve buttons based on storeId
    const buttons = await Button.find({ storeId });

    res.status(200).json({
      message: "Button Find Successfully..",
      success: true,
      data: buttons,
    });
  } catch (error) {
    console.error("Error retrieving buttons:", error);
    res.status(500).send("Internal Server Error");
  }
};

/////////////////BUTTON_HOLE  ADD & GET ADMIN & SUPERADMIN BOTH/////////////////
/******************************* Button Holes  Superadmin******************/

exports.createButtonHole = async (req, res) => {
  try {
    const { name, categories } = req.body;
    const buttonHoleImage = req.files["buttonHoleImage"][0];

    // Upload buttonImage to S3
    const buttonHoleImageUrl = await uploadToS3(buttonHoleImage);

    if (!buttonHoleImageUrl) {
      return res
        .status(400)
        .json({ message: "Error uploading buttonImage to S3" });
    }

    // // Check if button with the same name already exists
    // const existingButton = await ButtonHole.findOne({ name });

    const existingButton = await ButtonHole.findOne({
      "categories.name": categories[0].name,
    });

    if (existingButton) {
      // Check if the category with the same name already exists
      const categoryIndex = existingButton.categories.findIndex(
        (category) => category.name === categories[0].name
      );

      if (categoryIndex !== -1) {
        // Category exists, add button to the existing category
        existingButton.categories[categoryIndex].Buttons.push({
          name: categories[0].Buttons[0].name,
          buttonHoleImage: buttonHoleImageUrl,
        });

        await existingButton.save();

        return res.status(201).json({
          succes: true,
          message: "Button category updated successfully",
          data: existingButton,
        });
      }
    }

    // If the button doesn't exist or the category doesn't exist, create a new button
    const newButton = new ButtonHole({
      name,
      categories: [
        {
          name: categories[0].name,
          Buttons: [
            {
              name: categories[0].Buttons[0].name,
              buttonHoleImage: buttonHoleImageUrl,
            },
          ],
        },
      ],
    });

    await newButton.save();

    res.status(201).json({
      message: "Button added successfully",
      data: newButton,
    });
  } catch (error) {
    console.error("Error creating button:", error);
    res.status(500).send("Internal Server Error");
  }
};

/************************** Get Button Superadmin ****************/

exports.getButtonHoleByName = async (req, res, next) => {
  try {
    const categoryName = req.query.name;

    if (!categoryName) {
      return res.status(400).json({
        message: "Category name is required in the query parameter",
      });
    }

    // Find the Button with the category name
    const button = await ButtonHole.findOne({
      "categories.name": categoryName,
    });

    if (!button) {
      return res.status(404).json({
        message: "Button not found for the given category name",
      });
    }

    // Filter categories based on the category name
    const filteredCategories = button.categories.filter(
      (category) => category.name === categoryName
    );

    const result = {
      _id: button._id,
      name: button.name,
      categories: filteredCategories,
      createdAt: button.createdAt,
      updatedAt: button.updatedAt,
    };

    return res.status(200).json({
      succes: true,
      message: "Button found successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError("Internal server error", 500));
  }
};

/************************** Add ButtonHole Admin ****************/

exports.createButtonHoleAdmin = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const { name, categories } = req.body;
    const buttonHoleImage = req.files["buttonHoleImage"][0];

    // Upload buttonImage to S3
    const buttonHoleImageUrl = await uploadToS3(buttonHoleImage);

    if (!buttonHoleImageUrl) {
      return res
        .status(400)
        .json({ message: "Error uploading buttonImage to S3" });
    }

    // Check if button with the same name already exists
    const existingButton = await ButtonHole.findOne({ storeId });

    if (existingButton) {
      // Check if the category with the same name already exists
      const categoryIndex = existingButton.categories.findIndex(
        (category) => category.name === categories[0].name
      );

      if (categoryIndex !== -1) {
        // Category exists, add button to the existing category
        existingButton.categories[categoryIndex].Buttons.push({
          name: categories[0].Buttons[0].name,
          buttonHoleImage: buttonHoleImageUrl,
        });

        await existingButton.save();

        return res.status(201).json({
          succes: true,
          message: "Button category updated successfully",
          data: existingButton,
        });
      }
    }

    // If the button doesn't exist or the category doesn't exist, create a new button
    const newButton = new ButtonHole({
      storeId,
      name,
      categories: [
        {
          name: categories[0].name,
          Buttons: [
            {
              name: categories[0].Buttons[0].name,
              buttonHoleImage: buttonHoleImageUrl,
            },
          ],
        },
      ],
    });

    await newButton.save();

    res.status(201).json({
      message: "Button added successfully",
      data: newButton,
    });
  } catch (error) {
    console.error("Error creating button:", error);
    res.status(500).send("Internal Server Error");
  }
};

/**************************** Get ButtonHole Admin **************/

exports.getButtonsHoleAdminByStoreId = async (req, res) => {
  try {
    const storeId = req.params.storeId;

    // Retrieve buttons based on storeId
    const buttons = await ButtonHole.find({ storeId });

    res.status(200).json({
      success: true,
      message: "ButtonHole Find Successfully...",
      data: buttons,
    });
  } catch (error) {
    console.error("Error retrieving buttons:", error);
    res.status(500).send("Internal Server Error");
  }
};

/////////////////// FONT & COLOR ADD BY SUPERADMIN ////////////////////////
/*************************  Post  & Get Font Superadmin ******************/

exports.createFonts = async (req, res) => {
  try {
    const { storeId, Fonts } = req.body;

    const newFont = new Font({
      // storeId,
      Fonts,
    });

    const savedFont = await newFont.save();

    res
      .status(200)
      .json({ succes: true, message: "Font added successfully", savedFont });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFonts = async (req, res) => {
  try {
    const fonts = await Font.find();

    res
      .status(200)
      .json({ success: true, message: "Fonts retrieved successfully", fonts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************ Post  & Get Color Superadmin *****************/

exports.createColors = async (req, res) => {
  try {
    const { storeId, Colors } = req.body;

    const newColor = new Color({
      // storeId,
      Colors,
    });

    const savedColor = await newColor.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Colors added successfully",
        savedColor,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getColors = async (req, res) => {
  try {
    const Colors = await Color.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Colors retrieved successfully",
        Colors,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************ Color Threads *******************/

exports.createThreadColors = async (req, res) => {
  try {
    const { storeId, ColorsThread } = req.body;

    const newColor = new ColorThread({
      // storeId,
      ColorsThread,
    });

    const savedColor = await newColor.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Colors Thread added successfully",
        savedColor,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getThreadColors = async (req, res) => {
  try {
    const ColorsThreads = await ColorThread.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Colors Thread retrieved successfully",
        ColorsThreads,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






/************************ Readymade Product Api ************************/

//post api


// exports.createReadymadeProduct = async (req, res) => {
//   try {
//     const newReadymadeProduct = new ReadymadeProduct(req.body);

//     // Check if there are uploaded files
//     if (
//       req.files &&
//       req.files.ReadymadeProductImage &&
//       req.files.ReadymadeProductImage.length > 0
//     ) {
//       const files = req.files.ReadymadeProductImage;
//       const data = await Promise.all(files.map((file) => uploadToS3(file))); // Upload files to S3
//       newReadymadeProduct.ReadymadeProductImage = data; // Update the ReadymadeProductImage field
//     }

//     const savedProduct = await newReadymadeProduct.save();
//     return res.status(200).json({
//       success: true,
//       message: "Readymade product uploaded successfully",
//       savedProduct,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



exports.getReadymadeProducts = async (req, res) => {
  try {
    const readymadeProducts = await ReadymadeProduct.find(); // Assuming you're using MongoDB and Mongoose

    return res.status(200).json({
      success: true,
      message: "Readymade products retrieved successfully",
      readymadeProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//search api

exports.searchReadymadeProducts = async (req, res) => {
  try {
    const { productName, id, productNumber, search } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

    let query = {};

    if (!productName && !id && !productNumber && !search) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide either a productName,productNumber, id, or search term in the query",
      });
    }

    if (productName) {
      query = { ...query, productName: { $regex: productName, $options: "i" } };
    }

    if (id) {
      query = { ...query, _id: id };
    }

    if (productNumber) {
      query = { ...query, productNumber: productNumber };
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productNumber: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await ReadymadeProduct.countDocuments(query);
    const foundProducts = await ReadymadeProduct.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    if (foundProducts.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No matching products found",
      });
    }

    const showingResults = {
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, totalCount),
    };

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      totalCount,
      page,
      showingResults,
      foundProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//update api

exports.updateReadymadeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Check if there are uploaded files
    if (
      req.files &&
      req.files.ReadymadeProductImage &&
      req.files.ReadymadeProductImage.length > 0
    ) {
      const files = req.files.ReadymadeProductImage;
      const data = await Promise.all(files.map((file) => uploadToS3(file))); // Upload files to S3
      updatedData.ReadymadeProductImage = data; // Update the ReadymadeProductImage field
    }

    // If ReadymadeProductImage is not provided in the request, retain the existing value
    if (!updatedData.ReadymadeProductImage) {
      const existingProduct = await ReadymadeProduct.findById(id);
      if (existingProduct) {
        updatedData.ReadymadeProductImage =
          existingProduct.ReadymadeProductImage;
      }
    }

    const updatedProduct = await ReadymadeProduct.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Readymade product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/************************* Readymade Accessories Api **********************/

//post api


// exports.createReadymadeAccessories = async (req, res) => {
//   try {
//     const newReadymadeAccessoriesImage = new ReadymadeAccessories(req.body);

//     // Check if there are uploaded files
//     if (
//       req.files &&
//       req.files.ReadymadeAccessoriesImage &&
//       req.files.ReadymadeAccessoriesImage.length > 0
//     ) {
//       const files = req.files.ReadymadeAccessoriesImage;
//       const data = await Promise.all(files.map((file) => uploadToS3(file))); // Upload files to S3
//       newReadymadeAccessoriesImage.ReadymadeAccessoriesImage = data; // Update the ReadymadeProductImage field
//     }

//     const savedProduct = await newReadymadeAccessoriesImage.save();
//     return res.status(200).json({
//       success: true,
//       message: "Readymade accessories uploaded successfully",
//       savedProduct,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


//get api

exports.getReadymadeAccessories = async (req, res) => {
  try {
    const readymadeAccessories = await ReadymadeAccessories.find(); // Assuming you're using MongoDB and Mongoose

    return res.status(200).json({
      success: true,
      message: "Readymade accessories retrieved successfully",
      readymadeAccessories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//search api

exports.searchReadymadeAccessories = async (req, res) => {
  try {
    const { productName, id, accessoriesNumber, search } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

    let query = {};

    if (!productName && !id && !accessoriesNumber && !search) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide either a productName,accessoriesNumber, id, or search term in the query",
      });
    }

    if (productName) {
      query = { ...query, productName: { $regex: productName, $options: "i" } };
    }

    if (id) {
      query = { ...query, _id: id };
    }

    if (accessoriesNumber) {
      query = { ...query, accessoriesNumber: accessoriesNumber };
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { accessoriesNumber: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await ReadymadeAccessories.countDocuments(query);
    const foundProducts = await ReadymadeAccessories.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    if (foundProducts.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No matching accessories found",
      });
    }

    const showingResults = {
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, totalCount),
    };

    return res.status(200).json({
      success: true,
      message: "Accessories retrieved successfully",
      totalCount,
      page,
      showingResults,
      foundProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//update api

exports.updateReadymadeAccessories = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Check if there are uploaded files
    if (
      req.files &&
      req.files.ReadymadeAccessoriesImage &&
      req.files.ReadymadeAccessoriesImage.length > 0
    ) {
      const files = req.files.ReadymadeAccessoriesImage;
      const data = await Promise.all(files.map((file) => uploadToS3(file))); // Upload files to S3
      updatedData.ReadymadeAccessoriesImage = data; // Update the ReadymadeAccessoriesImage field
    }

    // If ReadymadeAccessoriesImage is not provided in the request, retain the existing value
    if (!updatedData.ReadymadeAccessoriesImage) {
      const existingAccessories = await ReadymadeAccessories.findById(id);
      if (existingAccessories) {
        updatedData.ReadymadeAccessoriesImage =
          existingAccessories.ReadymadeAccessoriesImage;
      }
    }

    const updatedAccessories = await ReadymadeAccessories.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedAccessories) {
      return res.status(404).json({
        success: false,
        message: "Accessories not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Readymade accessories updated successfully",
      updatedAccessories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};