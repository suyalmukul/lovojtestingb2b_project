const Store = require("../models/stores");
const SuperadminProduct = require('../models/QuickorderNew_pro_sub');
const AdminProduct = require('../models/QuickorderNew_pro_sub_admin');
const SuperadminMesurment = require('../models/QuickorderNew_Measurment');
const AdminMesurment = require('../models/QuickorderNew_Measurment_Admin');
const SuperadminContrastStyle = require('../models/QuickOrderNew_ContrastStyles');

const { SuperadminButton, SuperadminButtonHole, SuperadminButtonThread, } = require('../models/QuickorderNew_Button');
const { AdminButton, AdminButtonHole, AdminButtonThread, } = require('../models/QuickorderNew_Button_Admin');

const { SuperadminColor, SuperadminFont } = require('../models/QuickorderNew_Color_Font');
const { AdminColor, AdminFont } = require('../models/QuickorderNew_Color_Font_Admin');

const AdminReadymadeProduct = require("../models/Quicksetup_ReadymadeProduct");
const AdminReadymadeAccessories = require('../models/Quicksetup_ReadymadeAccessories');

const AdminManualPayment = require('../models/manualPayment');

const SuperadminPattern = require("../models/QuickorderNew_petterns")
const ProductMakingCharges = require('../models/ProductMakingCharges');
const AppError = require("../utils/errorHandler");
const mongoose = require("mongoose");
const { catchAsyncError } = require("../middleware/catchAsyncError");
const { commonPipelineService, showingResults } = require("../services/common.service");
const uploadToS3 = require("../utils/s3Upload");
const { updateOrAddEntries } = require("../services/customer.service");









/***************************************************************************************/
/********************* Make Again Quickorder setup api from scratch ********************/






/********************************************************************/
/********************** Working SuperadminProduct Add ******************/

// exports.superadminCreateProduct = async (req, res) => {
//   try {
//     const { name, gender } = req.body;

//     // Check if a document with the same gender name and category name already exists
//     const existingProduct = await SuperadminProduct.findOne({
//       'gender.name': gender.name,
//       'gender.categories.name': gender.categories[0].name,
//     });

//     if (existingProduct) {
//       // If the document exists, update the existing document by adding new subcategories
//       existingProduct.gender.categories[0].subcategories.push(...gender.categories[0].subcategories);

//       const updatedProduct = await existingProduct.save();
//       res.status(200).json(updatedProduct);
//     } else {
//       // If the document doesn't exist, create a new SuperadminProduct instance
//       const newSuperadminProduct = new SuperadminProduct(req.body);

//       // Save the new product to the database
//       const savedProduct = await newSuperadminProduct.save();
//       res.status(201).json(savedProduct);
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



exports.superadminCreateProduct = async (req, res) => {
  try {
    const { name, gender } = req.body;

    const genderName = gender.name;
    const newCategory = gender.categories[0];

    // Step 1: Check for existing product by gender and category name
    const existingProduct = await SuperadminProduct.findOne({
      'gender.name': genderName,
      'gender.categories.name': newCategory.name,
    });

    if (existingProduct) {
      // Step 2: Find the existing category
      const categoryIndex = existingProduct.gender.categories.findIndex(
        (cat) => cat.name === newCategory.name
      );

      if (categoryIndex !== -1) {
        const existingSubcategories = existingProduct.gender.categories[categoryIndex].subcategories;

        // Step 3: Merge or replace subcategories
        newCategory.subcategories.forEach((newSub) => {
          const subIndex = existingSubcategories.findIndex(
            (existSub) => existSub.name === newSub.name
          );

          if (subIndex !== -1) {
            // If subcategory name exists, replace it
            existingSubcategories[subIndex] = newSub;
          } else {
            // If subcategory name doesn't exist, push new one
            existingSubcategories.push(newSub);
          }
        });

        // Save the updated product
        const updatedProduct = await existingProduct.save();
        return res.status(200).json({
          message: 'Subcategories updated successfully.',
          updatedProduct,
        });
      }
    } else {
      // If the document doesn't exist, create a new one
      const newSuperadminProduct = new SuperadminProduct(req.body);
      const savedProduct = await newSuperadminProduct.save();

      return res.status(201).json({
        message: 'New product created successfully.',
        savedProduct,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/********************************************************************/
/********************** Working SuperadminProduct Update ******************/
exports.superadminUpdateProductById = async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from the request parameters
    const updateData = req.body; // Get the data to update from the request body

    // Find the product by its ID
    const existingProduct = await SuperadminProduct.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product's data with the provided updateData
    Object.assign(existingProduct, updateData);

    // Save the updated product to the database
    const updatedProduct = await existingProduct.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/********** Working Superadmin Product Images ******/

exports.superadminProductSubproduct_Images = async (req, res) => {
  try {
    // Process file uploads
    let ProductPthotoUrl = [];
    let SubproductPhotoUrl = [];
    let StylePhotoUrl = [];

    if (req.files.SuperadminProductPhoto && req.files.SuperadminProductPhoto.length > 0) {
      const files = req.files.SuperadminProductPhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ProductPthotoUrl.push(data);
    }

    if (req.files.SuperadminSubproductPhoto && req.files.SuperadminSubproductPhoto.length > 0) {
      const files = req.files.SuperadminSubproductPhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      SubproductPhotoUrl.push(data);
    }

    if (req.files.SuperadminStylePhoto && req.files.SuperadminStylePhoto.length > 0) {
      const files = req.files.SuperadminStylePhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      StylePhotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      superadminProductSubproduct: [
        {
          SuperadminProductPhoto: ProductPthotoUrl,
          SuperadminSubproductPhoto: SubproductPhotoUrl,
          SuperadminStylePhoto: StylePhotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};


/*************  Working delete whole product by admin ************/

// exports.superadminDeleteProductById = async (req, res) => {
//   try {
//     const { objectId } = req.params;
//     const { styleIds, subcategorieIds } = req.body;

//     // Validate if at least one of the arrays is provided
//     if (
//       (!styleIds || !Array.isArray(styleIds) || styleIds.length === 0) &&
//       (!subcategorieIds || !Array.isArray(subcategorieIds) || subcategorieIds.length === 0)
//     ) {
//       return res.status(400).json({ error: 'Invalid styleIds or subcategorieIds or documentId provided' });
//     }

//     // Find the product by objectId
//     const product = await SuperadminProduct.findById(objectId);

//     // Check if the product exists
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const errorMessages = [];

//     // Process styleIds if provided
//     if (styleIds && Array.isArray(styleIds)) {
//       styleIds.forEach((styleId) => {
//         let styleFound = false;

//         product.gender.categories.forEach((category) => {
//           category.subcategories.forEach((subcategory) => {
//             subcategory.styles = subcategory.styles.filter((style) => {
//               if (style._id.toString() === styleId) {
//                 styleFound = true;
//                 return false; // Remove this style from the array
//               }
//               return true; // Keep other styles in the array
//             });
//           });
//         });

//         // If styleId not found, accumulate an error message
//         if (!styleFound) {
//           errorMessages.push(`StyleId ${styleId} not found in the product`);
//         }
//       });
//     }

//     // Process subcategorieIds if provided
//     if (subcategorieIds && Array.isArray(subcategorieIds)) {
//       subcategorieIds.forEach((subcategorieId) => {
//         let subcategoryFound = false;

//         product.gender.categories.forEach((category) => {
//           category.subcategories = category.subcategories.filter((subcategory) => {
//             if (subcategory._id.toString() === subcategorieId) {
//               subcategoryFound = true;
//               return false; // Remove this subcategory
//             }
//             return true; // Keep other subcategories in the array
//           });
//         });

//         // If subcategorieId not found, accumulate an error message
//         if (!subcategoryFound) {
//           errorMessages.push(`SubcategorieId ${subcategorieId} not found in the product`);
//         }
//       });
//     }

//     // If there are any error messages, send a single response with all errors
//     if (errorMessages.length > 0) {
//       return res.status(400).json({ error: errorMessages.join(', ') });
//     }

//     // Save the updated product
//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: 'Styles and/or subcategories deleted successfully',
//       product,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


exports.superadminDeleteProductById = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { styleIds, subcategorieIds, documentId } = req.body;

    // Validate if at least one of the arrays is provided
    if (
      (!styleIds || !Array.isArray(styleIds) || styleIds.length === 0) &&
      (!subcategorieIds || !Array.isArray(subcategorieIds) || subcategorieIds.length === 0) &&
      (!documentId || !Array.isArray(documentId) || documentId.length === 0)
    ) {
      return res.status(400).json({ error: 'Invalid styleIds, subcategorieIds, or documentId provided' });
    }

    // If documentId is provided, delete the entire product document
    if (documentId && Array.isArray(documentId)) {
      for (const id of documentId) {
        const product = await SuperadminProduct.findById(id);

        if (!product) {
          return res.status(404).json({ error: `Product with ID ${id} not found` });
        }

        await SuperadminProduct.findByIdAndDelete(id);
      }

      return res.status(200).json({
        success: true,
        message: 'Product(s) deleted successfully',
      });
    }

    // Find the product by objectId
    const product = await SuperadminProduct.findById(objectId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const errorMessages = [];

    // Process styleIds if provided
    if (styleIds && Array.isArray(styleIds)) {
      styleIds.forEach((styleId) => {
        let styleFound = false;

        product.gender.categories.forEach((category) => {
          category.subcategories.forEach((subcategory) => {
            subcategory.styles = subcategory.styles.filter((style) => {
              if (style._id.toString() === styleId) {
                styleFound = true;
                return false; // Remove this style from the array
              }
              return true; // Keep other styles in the array
            });
          });
        });

        // If styleId not found, accumulate an error message
        if (!styleFound) {
          errorMessages.push(`StyleId ${styleId} not found in the product`);
        }
      });
    }

    // Process subcategorieIds if provided
    if (subcategorieIds && Array.isArray(subcategorieIds)) {
      subcategorieIds.forEach((subcategorieId) => {
        let subcategoryFound = false;

        product.gender.categories.forEach((category) => {
          category.subcategories = category.subcategories.filter((subcategory) => {
            if (subcategory._id.toString() === subcategorieId) {
              subcategoryFound = true;
              return false; // Remove this subcategory
            }
            return true; // Keep other subcategories in the array
          });
        });

        // If subcategorieId not found, accumulate an error message
        if (!subcategoryFound) {
          errorMessages.push(`SubcategorieId ${subcategorieId} not found in the product`);
        }
      });
    }

    // If there are any error messages, send a single response with all errors
    if (errorMessages.length > 0) {
      return res.status(400).json({ error: errorMessages.join(', ') });
    }

    // Save the updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Styles and/or subcategories deleted successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


/******************** Superadmin Get Our Own Products **************/


// exports.superadminGetAllProducts = async (req, res) => {
//   try {
//     const { gender, categoryName, id } = req.query;

//     let query = {};

//     // If `id` is provided, prioritize it for finding a specific product.
//     if (id) {
//       query["_id"] = id;
//     } else {
//       if (gender) {
//         query["gender.name"] = gender;
//       }

//       if (categoryName) {
//         query["gender.categories.name"] = categoryName;
//       }
//     }

//     const allProducts = await SuperadminProduct.find(query);

//     res.status(200).json({
//       success: true,
//       message: 'Products retrieved successfully',
//       allProducts,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



exports.superadminGetAllProducts = async (req, res) => {
  try {
    const { gender, categoryName, id, search } = req.query;

    let query = {};

    // If `id` is provided, prioritize it for finding a specific product.
    if (id) {
      query["_id"] = id;
    } else {
      if (gender) {
        query["gender.name"] = gender;
      }

      if (categoryName) {
        query["gender.categories.name"] = categoryName;
      }

      // Add search functionality for category names
      if (search) {
        query["gender.categories.name"] = { $regex: search, $options: "i" }; // Case-insensitive search
      }
    }

    const allProducts = await SuperadminProduct.find(query);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      allProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




/********************************************************************/
/************************* Working Admin Product ********************/

/** remove exesting Product style **/

exports.adminCreateProduct = async (req, res, next) => {
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

    // Check if a document with the same gender name and category name already exists in the specific store
    const existingProduct = await AdminProduct.findOne({
      storeId: storeId,
      'gender.name': gender.name,
      'gender.categories.name': gender.categories[0].name,
    });

    if (existingProduct) {
      // If the document exists, remove previous styles and add new styles
      existingProduct.gender.categories[0].subcategories = gender.categories[0].subcategories;

      const updatedProduct = await existingProduct.save();
      // return res.status(200).json(updatedProduct);
      return res.status(200).json({
        success: true,
        message: 'Product updated Successfully',
        data: updatedProduct,
      });
    } else {
      // If the document doesn't exist, create a new AdminProduct instance with the storeId
      const newAdminProduct = new AdminProduct({ ...req.body, storeId: storeId });

      // Save the new product to the database
      const savedProduct = await newAdminProduct.save();
      // return res.status(201).json(savedProduct);
      return res.status(201).json({
        success: true,
        message: 'Product added Successfully',
        data: savedProduct,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.adminProductSubproduct_Images = async (req, res) => {
  try {
    // Process file uploads
    let ProductPthotoUrl = [];
    let SubproductPhotoUrl = [];
    let StylePhotoUrl = [];

    if (req.files.adminProductPhoto && req.files.adminProductPhoto.length > 0) {
      const files = req.files.adminProductPhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ProductPthotoUrl.push(data);
    }

    if (req.files.adminSubproductPhoto && req.files.adminSubproductPhoto.length > 0) {
      const files = req.files.adminSubproductPhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      SubproductPhotoUrl.push(data);
    }

    if (req.files.adminStylePhoto && req.files.adminStylePhoto.length > 0) {
      const files = req.files.adminStylePhoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      StylePhotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      adminProductSubproduct: [
        {
          adminProductPhoto: ProductPthotoUrl,
          adminSubproductPhoto: SubproductPhotoUrl,
          adminStylePhoto: StylePhotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};





/************ get all data product data subcategory data styles data all in one api *****/


exports.getAdminProductsByStoreId = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { ownFlag, genderName, categoryName, subCategoryName } = req.query;

    // Build the] query based on storeId and optional genderName, categoryName, and subCategoryName
    const query = { 'storeId': storeId };

    if (ownFlag) {
      query['ownFlag'] = ownFlag;
    }
    if (genderName) {
      query['gender.name'] = genderName;
    }

    // if (categoryName) {
    //   // Use case-insensitive regex for partial categoryName match
    //   query['gender.categories.name'] = { $regex: new RegExp(categoryName, 'i') };
    // }

    if (categoryName) {
      // Escape special characters in categoryName for regex
      const escapedCategoryName = categoryName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query['gender.categories.name'] = { $regex: new RegExp(escapedCategoryName, 'i') };
    }
    


    if (subCategoryName) {
      query['gender.categories.subcategories.name'] = { $regex: new RegExp(subCategoryName, 'i') };
    }

    // Find products based on the query
    const products = await AdminProduct.find(query);

    if (products.length > 0) {
      if (subCategoryName) {
        // If subCategoryName is provided, filter the response
        const filteredProducts = products.map(product => {
          const gender = {
            name: product.gender.name,
            categories: product.gender.categories.map(category => {
              const subcategories = category.subcategories
                .filter(subcategory => subcategory.name.toLowerCase().includes(subCategoryName.toLowerCase()))
                .map(subcategory => ({
                  _id: subcategory._id,  // Include _id field
                  name: subcategory.name,
                  subCatImage: subcategory.subCatImage,
                  subCatNumber: subcategory.subCatNumber,
                  styles: subcategory.styles,
                }));

              return {
                _id: category._id,  // Include _id field
                name: category.name,
                subcategories,
              };
            }),
          };

          return {
            _id: product._id,  // Include _id field
            name: product.name,
            productImage: product.productImage,
            gender,
          };
        }).filter(product => product.gender.categories.some(category => category.subcategories.length > 0));

        if (filteredProducts.length > 0) {
          return res.status(200).json({ success: true, data: filteredProducts });
        } else {
          return res.status(404).json({ success: false, message: `No matching subcategories found for subCategoryName: ${subCategoryName}` });
        }
      } else {
        // If no subCategoryName, return the entire response
        const cleanedProducts = products.map(product => ({
          _id: product._id,  // Include _id field
          name: product.name,
          productNumber: product.productNumber,
          productImage: product.productImage,
          gender: {
            _id: product.gender._id,  // Include _id field
            name: product.gender.name,
            categories: product.gender.categories.map(category => ({
              _id: category._id,  // Include _id field
              name: category.name,
              subcategories: category.subcategories.map(subcategory => ({
                _id: subcategory._id,  // Include _id field
                name: subcategory.name,
                subCatImage: subcategory.subCatImage,
                subCatNumber: subcategory.subCatNumber,
                styles: subcategory.styles,
              })),
            })),
          },
        }));
        return res.status(200).json({ success: true, data: cleanedProducts });
      }
    } else {
      // If no products are found, send an appropriate response
      const message = `No products found for the given storeId${genderName ? `, genderName: ${genderName}` : ''}${categoryName ? `, categoryName: ${categoryName}` : ''}${subCategoryName ? `, subCategoryName: ${subCategoryName}` : ''}`;
      return res.status(404).json({ success: false, message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



/************* Toggle styles flag api admin **********/


exports.toggleStyleFlag = async (req, res) => {
  try {
    const { productId, styleId } = req.params;

    // Find the product based on productId
    const product = await AdminProduct.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found for ID: ${productId}` });
    }

    // Find the style based on styleId
    const style = product.gender.categories
      .flatMap(category => category.subcategories.flatMap(subcategory => subcategory.styles))
      .find(style => style._id == styleId);

    if (!style) {
      return res.status(404).json({ success: false, message: `Style not found for ID: ${styleId}` });
    }

    // Toggle the flag value
    style.flag = !style.flag;

    // Save the changes
    await product.save();

    return res.status(200).json({ success: true, message: 'Style flag toggled successfully', data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



/************* Get the data which flag is true by a productId **********/



exports.getStylesWithFlagTrueForProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product based on productId
    const product = await AdminProduct.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found for ID: ${productId}` });
    }

    // Extract styles with flag set to true
    const stylesWithFlagTrue = product.gender.categories
      .flatMap(category => category.subcategories.flatMap(subcategory =>
        subcategory.styles.filter(style => style.flag)
          .map(style => ({
            category: {
              _id: category._id,
              name: category.name,
            },
            subcategory: {
              _id: subcategory._id,
              name: subcategory.name,
            },
            style: {
              _id: style._id,
              catStyleName: style.catStyleName,
              catStyleNumber: style.catStyleNumber,
              styleImage: style.styleImage,
              flag: style.flag,
            },
          }))
      ));

    if (stylesWithFlagTrue.length === 0) {
      return res.status(404).json({ success: false, message: 'No styles found with flag set to true for the specified product' });
    }

    return res.status(200).json({ success: true, data: stylesWithFlagTrue });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


/****** Get Api for Superadmin data admin get this data by gender name and categoryName ******/


exports.getSuperadminProducts_ByAdmin = async (req, res) => {
  try {
    const { genderName, categoryName } = req.query;

    // Build the query based on optional genderName and categoryName
    const query = {};
    if (genderName) {
      query['gender.name'] = genderName;
    }
    if (categoryName) {
      query['gender.categories.name'] = categoryName; // Exact match for categoryName
    }

    // Find products based on the query
    const products = await SuperadminProduct.find(query);

    if (products.length > 0) {
      // If no subCategoryName, return the entire response
      const cleanedProducts = products.map(product => ({
        _id: product._id,
        name: product.name,
        productImage: product.productImage,
        gender: {
          _id: product.gender._id,
          name: product.gender.name,
          categories: product.gender.categories.map(category => ({
            _id: category._id,
            name: category.name,
            subcategories: category.subcategories.map(subcategory => ({
              _id: subcategory._id,
              name: subcategory.name,
              subCatImage: subcategory.subCatImage,
              subCatNumber: subcategory.subCatNumber,
              styles: subcategory.styles,
            })),
          })),
        },
      }));
      return res.status(200).json({ success: true, data: cleanedProducts });
    } else {
      // If no products are found, send an appropriate response
      const message = `No products found for the given criteria${genderName ? `, genderName: ${genderName}` : ''}${categoryName ? `, categoryName: ${categoryName}` : ''}`;
      return res.status(404).json({ success: false, message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



/********************* Delete Api Admin *******************/


exports.adminDeleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const styleIds = req.query.styleIds;

    // Check if a product with the given productId exists
    const existingProduct = await AdminProduct.findById(productId);

    if (!existingProduct) {
      // If the product doesn't exist, return a 404 response
      return res.status(404).json({ success: false, message: `Product not found for ID: ${productId}` });
    }

    if (styleIds) {
      // If styleIds are provided, delete the specific style(s)
      const styleIdsArray = Array.isArray(styleIds) ? styleIds : [styleIds];

      for (const id of styleIdsArray) {
        const categoryIndex = existingProduct.gender.categories.findIndex(category =>
          category.subcategories.some(subcategory =>
            subcategory.styles.some(style => style._id == id)
          )
        );

        if (categoryIndex !== -1) {
          const subcategoryIndex = existingProduct.gender.categories[categoryIndex].subcategories.findIndex(subcategory =>
            subcategory.styles.some(style => style._id == id)
          );

          if (subcategoryIndex !== -1) {
            // Remove the style from the subcategory
            existingProduct.gender.categories[categoryIndex].subcategories[subcategoryIndex].styles =
              existingProduct.gender.categories[categoryIndex].subcategories[subcategoryIndex].styles.filter(style =>
                style._id != id
              );
          }
        }
      }

      // Save the changes to the database
      await existingProduct.save();

      return res.status(200).json({ success: true, message: `Styles deleted successfully with IDs: ${styleIdsArray.join(', ')}` });
    }

    // If no styleIds, remove the entire product
    await existingProduct.remove();

    // Return a success response
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};





/**************************************************************************/
/**************************************************************************/
/**************************************************************************/
/**************************************************************************/
/***************************** Measurment Setup ***************************/


/******************* Post Api Add Measurment ********************/


exports.superadminCreateMesurment = async (req, res) => {
  try {
    const { name, gender, categoriename, measurements } = req.body;

    // Find an existing Mesurment with the same gender and categoriename
    const existingMesurment = await SuperadminMesurment.findOne({
      gender,
      categoriename,
    });

    if (existingMesurment) {
      // Add new measurements to the existing document
      existingMesurment.measurements.push(...measurements);
      await existingMesurment.save();

      return res.status(200).json({
        success: true,
        message: 'Measurements added to existing Mesurment',
        data: existingMesurment,
      });
    } else {
      // Create a new Mesurment instance
      const newMesurment = new SuperadminMesurment({
        name,
        gender,
        categoriename,
        measurements,
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



/******* Post Api Image Picker for superadmin measurment  *********/


exports.superadminMesurment_Images = async (req, res) => {
  try {
    // Process file uploads
    let MeasurmentPhotoUrl = [];

    if (req.files.superadminMeasurmentphoto && req.files.superadminMeasurmentphoto.length > 0) {
      const files = req.files.superadminMeasurmentphoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      MeasurmentPhotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      superadminMeasurmentphotos: [
        {
          superadminMeasurmentphoto: MeasurmentPhotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    return res.status(400).json({ error: error.message });
  }
};


/***************** Superadmin get own mesurments **************/


exports.superadminGetAllMeasurements = async (req, res) => {
  try {
    const allMeasurements = await SuperadminMesurment.find();

    return res.status(200).json({
      success: true,
      message: 'mesurments get successfully',
      data: allMeasurements,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/************************* Delete Measurment *****************/


exports.superadminDeleteMeasurements = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { measurementIds } = req.body;

    const measurementObject = await SuperadminMesurment.findById(objectId);

    if (!measurementObject) {
      return res.status(404).json({
        success: false,
        error: 'Measurement object not found',
      });
    }

    // Remove multiple measurements from the measurements array
    for (const measurementId of measurementIds) {
      const measurementIndex = measurementObject.measurements.findIndex(
        (measurement) => measurement._id.toString() === measurementId
      );

      if (measurementIndex !== -1) {
        measurementObject.measurements.splice(measurementIndex, 1);
      }
    }

    await measurementObject.save();

    return res.status(200).json({
      success: true,
      message: 'Measurements deleted successfully',
      data: measurementObject,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};


/******* Superadmin Get Api For Measurment get data by gender and categoryName for admin *****/


exports.superadminGetMesurmentForAdmin = async (req, res) => {
  try {
    let query = {};
    const { gender, categoriename } = req.query;

    // Check if gender is provided in the query
    if (gender) {
      query.gender = gender;
    }

    // Check if categoriename is provided in the query
    if (categoriename) {
      query.categoriename = categoriename;
    }

    // Find Mesurment based on the constructed query
    const mesurmentData = await SuperadminMesurment.find(query);

    if (mesurmentData.length > 0) {
      return res.status(200).json({
        success: true,
        // message:`Mesurment found for this ${JSON.stringify(query)}`,
        message: ' Mesurment found ',
        data: mesurmentData,
      });

    } else {
      return res.status(404).json({
        success: false,
        error: 'Mesurment not found',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



/********************** Superadmin update measurments *******************/
exports.superadminUpdateMesurment = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the Mesurment to update
    const { name, gender, categoriename, measurements } = req.body;

    // Find the Mesurment document by ID
    const mesurment = await SuperadminMesurment.findById(id);

    if (!mesurment) {
      return res.status(404).json({
        success: false,
        message: 'Mesurment not found',
      });
    }

    // Update fields if provided in the request body
    if (name) mesurment.name = name;
    if (gender) mesurment.gender = gender;
    if (categoriename) mesurment.categoriename = categoriename;

    // Update or replace measurements based on name or _id
    if (measurements && Array.isArray(measurements)) {
      measurements.forEach((newMeasurement) => {
        const index = mesurment.measurements.findIndex(
          (m) => m.name === newMeasurement.name || m._id?.toString() === newMeasurement._id
        );
        if (index !== -1) {
          // Update the existing measurement's name and image
          mesurment.measurements[index].name = newMeasurement.name;
          mesurment.measurements[index].mesurmentImage = newMeasurement.mesurmentImage;
        } else {
          // Add the new measurement if not found
          mesurment.measurements.push(newMeasurement);
        }
      });
    }

    // Save the updated document
    const updatedMesurment = await mesurment.save();

    return res.status(200).json({
      success: true,
      message: 'Mesurment updated successfully',
      data: updatedMesurment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


/****************************************************************************************/
/***************************************************************************************/
/***************************************************************************************/
/*********************************** Admin Own Measurments  ****************************/


/***post api add mesurment**/


exports.AdminCreateMesurment = async (req, res) => {
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

    const { name, gender, categoriename, measurements, ownFlag } = req.body;

    // Find an existing Mesurment with the same gender and categoriename in the specific store
    const existingMesurment = await AdminMesurment.findOne({
      gender,
      categoriename,
      storeId: storeId,
    });

    if (existingMesurment) {
      // If the document exists, remove previous measurements and add new measurements
      existingMesurment.measurements = measurements;
      existingMesurment.ownFlag = ownFlag; // Update ownFlag
      const updatedMesurments = await existingMesurment.save();

      return res.status(200).json({
        success: true,
        message: 'Measurements updated for existing Mesurment',
        data: updatedMesurments,
      });
    } else {
      // Create a new Mesurment instance associated with the specific store
      const newMesurment = new AdminMesurment({
        name,
        gender,
        categoriename,
        measurements,
        ownFlag, // Add ownFlag
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





exports.adminMesurment_Images = async (req, res) => {
  try {
    // Process file uploads
    let MeasurmentPhotoUrl = [];

    if (req.files.adminMeasurmentphoto && req.files.adminMeasurmentphoto.length > 0) {
      const files = req.files.adminMeasurmentphoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      MeasurmentPhotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      adminMeasurmentphotos: [
        {
          adminMeasurmentphoto: MeasurmentPhotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    return res.status(400).json({ error: error.message });
  }
};


//get own mesurments


exports.adminGetMesurment = async (req, res) => {
  try {
    const { storeId } = req.params;
    let query = {};
    const { ownFlag, gender, categoriename } = req.query;

    // Validate that storeId is provided
    if (!storeId) {
      return res.status(400).json({ success: false, error: 'storeId is required' });
    }

    // Add storeId to the query
    query.storeId = storeId;

    // Check if ownFlag is provided in the query
    if (ownFlag) {
      query.ownFlag = ownFlag;
    }

    // Check if gender is provided in the query
    if (gender) {
      query.gender = gender;
    }

    // Check if categoriename is provided in the query
    if (categoriename) {
      query.categoriename = categoriename;
    }

    // Find Mesurment based on the constructed query
    const mesurmentData = await AdminMesurment.find(query);

    if (mesurmentData.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Mesurment found',
        data: mesurmentData,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Mesurment not found',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};








/**************************************************************************/
/********************** Buttons Post APIs Superadmin **********************/

exports.superadminCreateButton = async (req, res) => {
  try {
    const newButton = new SuperadminButton(req.body);

    const savedButton = await newButton.save();

    res.status(201).json(savedButton);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.superadminCreateButtonHole = async (req, res) => {
  try {
    const newButton = new SuperadminButtonHole(req.body);

    const savedButton = await newButton.save();

    res.status(201).json(savedButton);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.superadminCreateButtonThread = async (req, res) => {
  try {
    const newButton = new SuperadminButtonThread(req.body);

    const savedButton = await newButton.save();

    res.status(201).json(savedButton);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/********************** Admin Get Data Superadmin API **********************/


exports.getAllSuperadminButtons = async (req, res) => {
  try {
    const allButtons = await SuperadminButton.find();
    res.status(200).json({
      success: true,
      message: "Button Data Get Successfully..",
      data: allButtons
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllSuperadminButtonHoles = async (req, res) => {
  try {
    const allButtonHoles = await SuperadminButtonHole.find();
    // res.status(200).json(allButtonHoles);
    res.status(200).json({
      success: true,
      message: "Button Holes Data Get Successfully..",
      data: allButtonHoles
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllSuperadminButtonThreads = async (req, res) => {
  try {
    const allButtonThreads = await SuperadminButtonThread.find();
    // res.status(200).json(allButtonThreads);
    res.status(200).json({
      success: true,
      message: "Button Threads Data Get Successfully..",
      data: allButtonThreads
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/********************** Buttons Image Picker Post APIs **********************/
exports.superadminButton_Images = async (req, res) => {
  try {
    // Process file uploads
    let ButtonPthotoUrl = [];
    let ButtonHolePthotoUrl = [];
    let ButtonThreadPthotoUrl = [];

    if (req.files.superadminButtonPthoto && req.files.superadminButtonPthoto.length > 0) {
      const files = req.files.superadminButtonPthoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ButtonPthotoUrl.push(data);
    }

    if (req.files.superadminButtonHolePthoto && req.files.superadminButtonHolePthoto.length > 0) {
      const files = req.files.superadminButtonHolePthoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ButtonHolePthotoUrl.push(data);
    }

    if (req.files.superadminButtonThreadPthoto && req.files.superadminButtonThreadPthoto.length > 0) {
      const files = req.files.superadminButtonThreadPthoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ButtonThreadPthotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      superadminadminButtons: [
        {
          superadminButtonPthoto: ButtonPthotoUrl,
          superadminButtonHolePthoto: ButtonHolePthotoUrl,
          superadminButtonThreadPthoto: ButtonThreadPthotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};




/*********************************************************************/
/********************** Buttons Post APIs Admin **********************/


exports.createAdminButton = async (req, res) => {
  try {
    const { storeId } = req.user;

    // Check if an AdminButton document already exists for the store
    const existingButton = await AdminButton.findOne({ storeId });

    if (existingButton) {
      // If the document exists, update the existing buttons
      existingButton.Buttons = req.body.Buttons;
      const updatedButtons = await existingButton.save();

      return res.status(200).json({
        success: true,
        message: 'Buttons updated for existing store',
        data: updatedButtons,
      });
    } else {
      // If no document exists, create a new one
      const newButton = new AdminButton({
        storeId,
        ...req.body,
      });

      // Save the new button to the database
      const savedButton = await newButton.save();
      return res.status(201).json({
        success: true,
        message: 'Buttons added Successfully',
        data: savedButton,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.createAdminButtonHole = async (req, res) => {
  try {
    const { storeId } = req.user;

    // Check if an AdminButton document already exists for the store
    const existingButtonHole = await AdminButtonHole.findOne({ storeId });

    if (existingButtonHole) {
      // If the document exists, update the existing buttons
      existingButtonHole.ButtonHoles = req.body.ButtonHoles;
      const updatedButtonHoles = await existingButtonHole.save();

      return res.status(200).json({
        success: true,
        message: 'Buttons updated for existing store',
        data: updatedButtonHoles,
      });
    } else {
      // If no document exists, create a new one
      const newButtonHoles = new AdminButtonHole({
        storeId,
        ...req.body,
      });

      // Save the new button to the database
      const savedButtonHoles = await newButtonHoles.save();

      return res.status(201).json({
        success: true,
        message: 'ButtonHoles added Successfully',
        data: savedButtonHoles,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.createAdminButtonThread = async (req, res) => {
  try {
    const { storeId } = req.user;

    console.log("body", req.body)

    // Check if an AdminButtonThreads document already exists for the store
    const existingButtonThread = await AdminButtonThread.findOne({ storeId });

    if (existingButtonThread) {
      // If the document exists, update the existing buttons
      existingButtonThread.ButtonThreads = req.body.ButtonThreads;
      const updatedButtonThreads = await existingButtonThread.save();

      return res.status(200).json({
        success: true,
        message: 'ButtonThreads updated for existing store',
        data: updatedButtonThreads,
      });
    } else {
      // If no document exists, create a new one
      const newButtonThreads = new AdminButtonThread({
        storeId,
        ...req.body,
      });

      // Save the new ButtonThreads to the database
      const savedButtonThreads = await newButtonThreads.save();

      return res.status(201).json({
        success: true,
        message: 'ButtonThreads added Successfully',
        data: savedButtonThreads,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.adminButton_Images = async (req, res) => {
  try {
    // Process file uploads
    let ButtonPthotoUrl = [];
    let ButtonHolePthotoUrl = [];
    let ButtonThreadPthotoUrl = [];

    if (req.files.adminButtonPthoto && req.files.adminButtonPthoto.length > 0) {
      const files = req.files.adminButtonPthoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ButtonPthotoUrl.push(data);
    }

    if (req.files.adminButtonHolePthoto && req.files.adminButtonHolePthoto.length > 0) {
      const files = req.files.adminButtonHolePthoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ButtonHolePthotoUrl.push(data);
    }

    if (req.files.adminButtonThreadPthoto && req.files.adminButtonThreadPthoto.length > 0) {
      const files = req.files.adminButtonThreadPthoto;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      ButtonThreadPthotoUrl.push(data);
    }

    // Send a response without saving in the database
    return res.status(201).send({
      message: 'Files uploaded successfully!',
      superadminadminButtons: [
        {
          adminButtonPthoto: ButtonPthotoUrl,
          adminButtonHolePthoto: ButtonHolePthotoUrl,
          adminButtonThreadPthoto: ButtonThreadPthotoUrl,
        },
      ],
    });
  } catch (error) {
    // console.log("error", error)
    res.status(400).json({ error: error.message });
  }
};


//get admin


exports.getAllAdminButton = async (req, res) => {
  try {
    // const { storeId } = req.user;
    const { storeId } = req.params;

    // Find the AdminButton document for the given storeId
    const adminButton = await AdminButton.findOne({ storeId });

    if (!adminButton) {
      return res.status(404).json({
        success: false,
        message: 'AdminButton not found for the given store',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AdminButton retrieved successfully',
      data: adminButton,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getAllAdminButtonHole = async (req, res) => {
  try {
    // const { storeId } = req.user;
    const { storeId } = req.params;

    // Find the AdminButtonHole document for the given storeId
    const adminButtonHole = await AdminButtonHole.findOne({ storeId });

    if (!adminButtonHole) {
      return res.status(404).json({
        success: false,
        message: 'AdminButtonHole not found for the given store',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AdminButtonHole retrieved successfully',
      data: adminButtonHole,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getAllAdminButtonThread = async (req, res) => {
  try {
    // const { storeId } = req.user;
    const { storeId } = req.params;

    // Find the AdminButtonThread document for the given storeId
    const adminButtonThread = await AdminButtonThread.findOne({ storeId });

    if (!adminButtonThread) {
      return res.status(404).json({
        success: false,
        message: 'AdminButtonThread not found for the given store',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AdminButtonThread retrieved successfully',
      data: adminButtonThread,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



/******************************************************************************/
/********************** Color Post And Font APIs Superadmin *******************/


exports.createSuperadminColors = async (req, res) => {
  try {
    // Create a new SuperadminColor document
    const newColors = new SuperadminColor(req.body);

    // Save the new colors to the database
    const savedColors = await newColors.save();

    return res.status(201).json({
      success: true,
      message: 'Colors added successfully',
      data: savedColors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.createSuperadminFonts = async (req, res) => {
  try {
    // Create a new SuperadminFont document
    const newFonts = new SuperadminFont(req.body);

    // Save the new fonts to the database
    const savedFonts = await newFonts.save();

    return res.status(201).json({
      success: true,
      message: 'Fonts added successfully',
      data: savedFonts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getAllSuperadminColors = async (req, res) => {
  try {
    // Retrieve all SuperadminColor documents from the database
    const allColors = await SuperadminColor.find();

    res.status(200).json({
      success: true,
      message: "Colors Data Get Successfully..",
      data: allColors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllSuperadminFonts = async (req, res) => {
  try {
    // Retrieve all SuperadminFont documents from the database
    const allFonts = await SuperadminFont.find();

    res.status(200).json({
      success: true,
      message: "Fonts Data Get Successfully..",
      data: allFonts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



/******************************************************************************/
/********************** Color Post And Font APIs Admin *******************/


exports.createAdminColor = async (req, res) => {
  try {
    const { storeId } = req.user;

    // Check if an AdminColor document already exists for the store
    const existingAdminColor = await AdminColor.findOne({ storeId });

    if (existingAdminColor) {
      // If the document exists, update the existing colors
      existingAdminColor.Colors = req.body.Colors;
      const updatedColors = await existingAdminColor.save();

      return res.status(200).json({
        success: true,
        message: 'Colors updated successfully',
        data: updatedColors,
      });
    } else {
      // If no document exists, create a new one
      const newAdminColor = new AdminColor({
        storeId,
        ...req.body,
      });

      // Save the new colors to the database
      const savedColors = await newAdminColor.save();

      return res.status(201).json({
        success: true,
        message: 'Colors added successfully',
        data: savedColors,
      });
    }
  } catch (error) {
    // Log any errors that occur
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.createAdminFont = async (req, res) => {
  try {
    const { storeId } = req.user;

    // Check if an AdminFont document already exists for the store
    const existingAdminFont = await AdminFont.findOne({ storeId });

    if (existingAdminFont) {
      // If the document exists, update the existing fonts
      existingAdminFont.Fonts = req.body.Fonts;
      const updatedFonts = await existingAdminFont.save();

      return res.status(200).json({
        success: true,
        message: 'Fonts updated successfully',
        data: updatedFonts,
      });
    } else {
      // If no document exists, create a new one
      const newAdminFont = new AdminFont({
        storeId,
        ...req.body,
      });

      // Save the new fonts to the database
      const savedFonts = await newAdminFont.save();

      return res.status(201).json({
        success: true,
        message: 'Fonts added successfully',
        data: savedFonts,
      });
    }
  } catch (error) {
    // Log any errors that occur
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getAllAdminColor = async (req, res) => {
  try {
    // const { storeId } = req.user;
    const { storeId } = req.params;

    // Find the AdminColor document for the given storeId
    const adminColor = await AdminColor.findOne({ storeId });

    if (!adminColor) {
      return res.status(404).json({
        success: false,
        message: 'AdminColor not found for the given store',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AdminColor retrieved successfully',
      data: adminColor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getAllAdminFont = async (req, res) => {
  try {
    // const { storeId } = req.user;
    const { storeId } = req.params;

    // Find the AdminFont document for the given storeId
    const adminFont = await AdminFont.findOne({ storeId });

    if (!adminFont) {
      return res.status(404).json({
        success: false,
        message: 'AdminFont not found for the given store',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'AdminFont retrieved successfully',
      data: adminFont,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



/******************************************************************************/
/********************** Readymade Products APIs Admin *******************/

exports.AdmincreateReadymadeProduct = catchAsyncError(async (req, res) => {
    const { storeId } = req.user;

    const newReadymadeProduct = new AdminReadymadeProduct({
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
      newReadymadeProduct.AdminReadymadeProductImage = data;
    }

    const savedProduct = await newReadymadeProduct.save();
    return res.status(200).json({
      success: true,
      message: "AdminReadymadeProduct uploaded successfully",
      savedProduct,
    });
});

exports.AdminUpdateReadymadeProduct = catchAsyncError(async (req, res) => {
    const { storeId } = req.user;
    const { productId } = req.params;

    let existingProduct = await AdminReadymadeProduct.findById(productId);
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

exports.AdminDeleteReadymadeProduct = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { productId } = req.params;

  if (!storeId) {
    return next(new AppError("User not authenticated", 401));
  }
  // Find the product by ID
  const existingProduct = await AdminReadymadeProduct.findById(productId);
  if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
  }

  await existingProduct.remove();
  return res.status(200).json({
      success: true,
      message: "AdminReadymadeProduct deleted successfully",
  });
});


exports.AdminsearchReadymadeProducts = catchAsyncError(async (req, res) => {
  const { gender, seen, productName, id, productNumber, search } = req.query;
  const { storeId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 4;


  if (!gender && !seen && !productName && !id && !productNumber && !search) {
    return res.status(400).json({
      success: false,
      message: "Please provide either a gender, productName, productNumber, id, or search term in the query",
    });
  }
  const matchQuery = {
    storeId: mongoose.Types.ObjectId(storeId),
    ...(seen && { seen: seen.toLowerCase() === 'true' }),
    ...(gender && { gender }),
    ...(productName && { productName: { $regex: productName, $options: "i" } }),
    ...(id && { _id: id }),
    ...(productNumber && { productNumber }),
    ...(search && {
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { productNumber: { $regex: search, $options: "i" } },
      ],
    }),
  };


  const { pipeline, countPipeline } = commonPipelineService(matchQuery, req.query);

  const foundProducts = await AdminReadymadeProduct.aggregate(pipeline);
  const countResult = await AdminReadymadeProduct.aggregate(countPipeline);
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

/********************************************************************************/
/********************** Readymade Accessories Post APIs Admin *******************/

exports.AdmincreateReadymadeAccessories = catchAsyncError(async (req, res) => {
    const { storeId } = req.user;
    const newAdminReadymadeAccessories = new AdminReadymadeAccessories({
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
      newAdminReadymadeAccessories.ReadymadeAccessoriesImage = data;
    }

    const savedProduct = await newAdminReadymadeAccessories.save();
    return res.status(200).json({
      success: true,
      message: "AdminReadymadeAccessories uploaded successfully",
      savedProduct,
    });
});

exports.AdminUpdateReadymadeAccessories = catchAsyncError(async (req, res) => {
    const { storeId } = req.user;
    const { accessoriesId } = req.params;

    let existingAccessories = await AdminReadymadeAccessories.findById(accessoriesId);
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

exports.AdminDeleteReadymadeAccessories = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { accessoriesId } = req.params;

  if (!storeId) {
    return next(new AppError("User not authenticated", 401));
  }

  const existingAccessories = await AdminReadymadeAccessories.findById(accessoriesId);
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

exports.AdminsearchReadymadeAccessories = catchAsyncError(async (req, res) => {
  const { gender, seen, productName, id, accessoriesNumber, search } = req.query;
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;
  // const { storeId } = req.user;
  const { storeId } = req.params;


  const matchQuery = {
    storeId: mongoose.Types.ObjectId(storeId),
    ...(seen && { seen: seen.toLowerCase() === 'true' }),
    ...(gender && { gender }),
    ...(productName && { productName: { $regex: productName, $options: "i" } }),
    ...(id && { _id: id }),
    ...(accessoriesNumber && { accessoriesNumber }),
    ...(search && {
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { accessoriesNumber: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const { pipeline, countPipeline } = commonPipelineService(matchQuery, req.query);

  const foundAccessories = await AdminReadymadeAccessories.aggregate(pipeline);
  const countResult = await AdminReadymadeAccessories.aggregate(countPipeline);
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




/**********************************************************************************/
/*********************************** Payment Setup ********************************/



exports.createManualPayment = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const { paypal, iban, account, upi, qrCode } = req.body;


  let existingPayment = await AdminManualPayment.findOne({ storeId });

  if (!existingPayment) {
    // If no existing record, create a new one with the provided payment methods
    const adminManualPayment = new AdminManualPayment({
      storeId,
      paymentMethods: { paypal: paypal || [], iban: iban || [], account: account || [], upi: upi || [], qrCode: qrCode || [] },
    });
    await adminManualPayment.save();

    return res.status(201).json({success: true, message: 'Admin manual payment created successfully', data: adminManualPayment });
  }

  // If an existing record is found, update it with the provided payment methods
  const paymentMethodsToUpdate = ['paypal', 'iban', 'account', 'upi', 'qrCode'];
  for (const method of paymentMethodsToUpdate) {
    if (req.body[method] && req.body[method].length > 0) {
      updateOrAddEntries(existingPayment.paymentMethods[method], req.body[method], `${method}Number`);
    }
  }

  await existingPayment.save();

  return res.status(200).json({success: true, message: 'Admin manual payment updated successfully', data: existingPayment });
});


exports.adminQrCode_Images = async (req, res) => {
  try {
    let QrPthotoUrl = [];

    if (req.files.adminQrImages && req.files.adminQrImages.length > 0) {
      const files = req.files.adminQrImages;
      const data = await Promise.all(files.map((file) => uploadToS3(file)));
      QrPthotoUrl.push(data);
    }

    return res.status(201).send({
    message: 'Files uploaded successfully!',
    AdminQrImages: [
        {
          QrPthotoUrl: QrPthotoUrl
        },
      ],
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getAdminManualPayment = catchAsyncError(async (req, res) => {
  const { storeId } = req.user;
  const existingPayment = await AdminManualPayment.findOne({ storeId });

  if (!existingPayment) {
    return res.status(404).json({success: false, message: 'Admin manual payment not found for the specified store' });
  }

  return res.status(200).json({success: true, message: 'Admin manual payment retrieved successfully', data: existingPayment });
});




/******************************  Superadmin Add Petterns  *************************/


exports.superadminCreatePattern = async (req, res) => {
  try {
    const { name, gender, categoriename, patterns } = req.body;

    const existingPattern = await SuperadminPattern.findOne({
      gender,
      categoriename,
    });

    if (existingPattern) {
      existingPattern.patterns.push(...patterns);
      await existingPattern.save();

      return res.status(200).json({
        success: true,
        message: 'Patterns added to existing Pattern',
        data: existingPattern,
      });
    } else {
      const newPattern = new SuperadminPattern({
        name,
        gender,
        categoriename,
        patterns,
      });

      const savedPattern = await newPattern.save();

      return res.status(201).json({
        success: true,
        message: 'Pattern created successfully',
        data: savedPattern,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

//for admin

exports.superadminGetPatternForAdmin = async (req, res) => {
  try {
    let query = {};
    const { gender, categoriename } = req.query;

    // Check if gender is provided in the query
    if (gender) {
      query.gender = gender;
    }

    // Check if categoriename is provided in the query
    if (categoriename) {
      query.categoriename = categoriename;
    }

    // Find Pattern based on the constructed query
    const patternData = await SuperadminPattern.find(query);

    if (patternData.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Pattern found',
        data: patternData,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Pattern not found',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};






/***********************************************************************************/
/***********************************************************************************/
/************************* Update Api Section Superadmin ***************************/
exports.superadminUpdateStyle = async (req, res) => {
  try {
    const { productId, subcategoryId } = req.params;
    const newStyles = req.body;

    const product = await SuperadminProduct.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the subcategory by subcategoryId
    const subcategory = product.gender.categories.reduce((foundSubcat, category) => {
      const found = category.subcategories.find((subcat) => subcat._id.toString() === subcategoryId);
      return found ? found : foundSubcat;
    }, null);

    console.log('Product:', product);
    console.log('Subcategory:', subcategory);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    subcategory.styles.push(...newStyles);

    console.log('Updated Subcategory:', subcategory);

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Styles added successfully',
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



/*********************** Contrast Style For the Superadmin **************************/


exports.createSuperadminContrastStyle = catchAsyncError(async (req, res, next) => {
  const { genderName, productName, categories } = req.body;

  // Check if a document with the same gender name and productName already exists
  let existingStyle = await SuperadminContrastStyle.findOne({ genderName, productName });

  if (existingStyle) {
    // If the document exists, update the existing document by adding new categories
    categories.forEach(newCategory => {
      const existingCategoryIndex = existingStyle.categories.findIndex(existingCategory => existingCategory.name === newCategory.name);
      if (existingCategoryIndex !== -1) {
        // If the category with the same name exists, replace its styles with new styles
        existingStyle.categories[existingCategoryIndex].styles = newCategory.styles;
      } else {
        // If the category doesn't exist, add it to the existing categories
        existingStyle.categories.push(newCategory);
      }
    });
    await existingStyle.save();
    res.status(200).json({
      success: true,
      message: 'Superadmin contrast style updated successfully',
      style: existingStyle
    });
  } else {
    // If the document doesn't exist, create a new SuperadminContrastStyle instance
    const newStyle = new SuperadminContrastStyle({
      genderName,
      productName,
      categories
    });

    // Save the new product to the database
    const savedStyle = await newStyle.save();

    res.status(201).json({
      success: true,
      message: 'Superadmin contrast style created successfully',
      style: savedStyle
    });
  }
});

/*************************** Get data For Sueradmin and Admin Both ***************/

exports.getSuperadminContrastStyle = catchAsyncError(async (req, res, next) => {
  const { productName } = req.query;

  let styles;
  if (productName) {
    // Find the SuperadminContrastStyle based on the productName
    styles = await SuperadminContrastStyle.findOne({ productName });
  } else {
    // If no productName provided, return all SuperadminContrastStyle documents
    styles = await SuperadminContrastStyle.find();
  }

  if (!styles) {
    return res.status(404).json({ success: false, message: 'Superadmin contrast style not found' });
  }

  res.status(200).json({ success: true, message: 'Superadmin contrast style found successfully', styles });
});




/****************************** Superadmin Product Price Setup ****************/
/******************************************************************************/

// exports.createProductMakingCharges = catchAsyncError(async (req, res, next) => {
//   const { storeId, genderName, productName, productImage, productMakingPrice } = req.body;

//   // Create a new ProductMakingCharges document
//   const newProductMakingCharges = new ProductMakingCharges({
//     // storeId,
//     genderName,
//     productName,
//     productImage,
//     productMakingPrice
//   });

//   // Save the document to the database
//   await newProductMakingCharges.save();

//   res.status(201).json({
//     success: true,
//     message: 'ProductMakingCharges created successfully!',
//     data: newProductMakingCharges,
//   });
// });




exports.createProductMakingCharges = catchAsyncError(async (req, res, next) => {
  const { storeId, genderName, productName, productImage, PlanPriceAndTime } = req.body;

  // Find and update or create a new ProductMakingCharges document
  const updatedProductMakingCharges = await ProductMakingCharges.findOneAndUpdate(
    { genderName, productName }, // Query to find the existing document
    {
      storeId,
      genderName,
      productName,
      productImage,
      PlanPriceAndTime
    },
    {
      new: true, // Return the updated document
      upsert: true, // Create a new document if it doesn't exist
      setDefaultsOnInsert: true // Apply default values if a new document is created
    }
  );

  res.status(201).json({
    success: true,
    message: 'ProductMakingCharges created or updated successfully!',
    data: updatedProductMakingCharges,
  });
});




exports.getProductMakingCharges = catchAsyncError(async (req, res, next) => {
  const { storeId, genderName, productName } = req.query;

  // Build query object based on provided query parameters
  let query = {};
  // if (storeId) query.storeId = storeId;
  if (genderName) query.genderName = genderName;
  if (productName) query.productName = productName;

  // Find documents based on the query object
  const productMakingCharges = await ProductMakingCharges.find(query);

  // Return status 200 and a message even if no documents were found
  res.status(200).json({
    success: true,
    message: productMakingCharges.length === 0 
      ? 'No product found for the given criteria.'
      : 'ProductMakingCharges retrieved successfully!',
    data: productMakingCharges,
  });
});










