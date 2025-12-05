const { catchAsyncError } = require("../middleware/catchAsyncError");
const fabricdropdowns = require("../models/fabricdropdowns");

/********************************************************* Old Post Api ***************************************/

exports.addfabricdropdownitem = catchAsyncError(async (req, res, next) => {
  let fabricDropdown = await fabricdropdowns.findOne();

  if (!fabricDropdown) {
    fabricDropdown = new fabricdropdowns();
  }

  const {
    category,
    brands,
    fabricCategoryBrands,
    fabricColor,
    fabricQuantity,
    fabricComposition,
    fabricSubCategory,
    fabricPattern,
    fabricMaterial,
    fabricCharacteristics,
    fabricTypes,
    fabricSeason,
  } = req.body;

  // Define a generic function to update an array field
  const updateArrayField = (field, newValue) => {
    if (newValue) {
      if (!fabricDropdown[field]) {
        fabricDropdown[field] = [];
      }
      if (Array.isArray(newValue)) {
        fabricDropdown[field] = [...fabricDropdown[field], ...newValue];
      } else {
        fabricDropdown[field].push(newValue);
      }
    }
  };

  // Update for fabricCategoryBrands
  if (fabricCategoryBrands) {
    const categoryIndex = fabricDropdown.fabricCategoryBrands.findIndex(
      (cat) => cat.category === category
    );

    if (categoryIndex !== -1) {
      const existingBrands =
        fabricDropdown.fabricCategoryBrands[categoryIndex].brands;
      const uniqueBrands = new Set(existingBrands);
      brands.forEach((brand) => {
        uniqueBrands.add(brand);
      });
      fabricDropdown.fabricCategoryBrands[categoryIndex].brands =
        Array.from(uniqueBrands);
    } else {
      fabricDropdown.fabricCategoryBrands.push({
        category,
        brands,
      });
    }
  }

  // Update other array fields using the generic function
  updateArrayField("fabricComposition", fabricComposition);
  updateArrayField("fabricSubCategory", fabricSubCategory);
  updateArrayField("fabricPattern", fabricPattern);
  updateArrayField("fabricMaterial", fabricMaterial);
  updateArrayField("fabricCharacteristics", fabricCharacteristics);
  updateArrayField("fabricTypes", fabricTypes);
  updateArrayField("fabricColor", fabricColor);
  updateArrayField("fabricQuantity", fabricQuantity);
  updateArrayField("fabricSeason", fabricSeason);

  const savedFabricDropdown = await fabricDropdown.save();

  res.status(201).json({
    success: true,
    message: "Data added successfully.",
    fabricDropdown: savedFabricDropdown,
  });
});

/*********************************************** Old Update Api **********************************************/

exports.updateFabricCategoryById = catchAsyncError(async (req, res, next) => {
  const id = req.params.id; // Assuming the ID is in the URL.
  const arrayToUpdate = req.body.arrayToUpdate; // Specify the name of the array to update.
  const indexToUpdate = req.params.indexToUpdate; // Index of the element within fabricCategoryBrands to update
  const newFabricCat = req.body.newFabricCat; // New updated fabric category name (for fabricColor and fabricComposition).
  const categoryToUpdate = req.body.categoryToUpdate; // Name of the category to update.
  const newBrand = req.body.newBrand;

  try {
    // Find the document by ID
    const findCategories = await fabricdropdowns.findById(id);

    if (!findCategories) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (
      arrayToUpdate !== "fabricCategoryBrands" &&
      arrayToUpdate !== "fabricColor" &&
      arrayToUpdate !== "fabricQuantity" &&
      arrayToUpdate !== "fabricComposition" &&
      arrayToUpdate !== "fabricSubCategory" &&
      arrayToUpdate !== "fabricMaterial" &&
      arrayToUpdate !== "fabricPattern" &&
      arrayToUpdate !== "fabricTypes" &&
      arrayToUpdate !== "fabricCharacteristics" &&
      arrayToUpdate !== "fabricSeason"
    ) {
      return res.status(400).json({ message: "Invalid array name." });
    }

    // Handle updates for fabricColor or fabricComposition arrays
    if (
      arrayToUpdate === "fabricColor" ||
      arrayToUpdate === "fabricQuantity" ||
      arrayToUpdate === "fabricComposition" ||
      arrayToUpdate === "fabricSubCategory" ||
      arrayToUpdate === "fabricMaterial" ||
      arrayToUpdate === "fabricPattern" ||
      arrayToUpdate === "fabricTypes" ||
      arrayToUpdate === "fabricCharacteristics" ||
      arrayToUpdate === "fabricSeason"
    ) {
      const fabricArray = findCategories[arrayToUpdate];

      if (!Array.isArray(fabricArray)) {
        return res
          .status(400)
          .json({ message: `'${arrayToUpdate}' is not an array` });
      }

      // Check if indexToUpdate is provided to update a specific element within the array
      if (indexToUpdate >= 0 && indexToUpdate < fabricArray.length) {
        // Update the element at the specified index
        fabricArray[indexToUpdate] = newFabricCat;

        // Save the updated document
        const updatedDocument = await findCategories.save();

        res.status(200).json({
          message: `${arrayToUpdate} updated successfully`,
          updatedDocument,
        });
      } else {
        return res.status(400).json({ message: "Invalid indexToUpdate" });
      }
    }

    // Handle updates for the fabricCategoryBrands array
    if (arrayToUpdate === "fabricCategoryBrands") {
      const fabricCategoryBrands = findCategories.fabricCategoryBrands;

      if (!Array.isArray(fabricCategoryBrands)) {
        return res
          .status(400)
          .json({ message: "'fabricCategoryBrands' is not an array" });
      }

      // Find the category to update
      const categoryIndex = fabricCategoryBrands.findIndex(
        (item) => item.category === categoryToUpdate
      );

      if (categoryIndex === -1) {
        return res.status(400).json({ message: "Category not found" });
      }

      // Check if indexToUpdate is within bounds of the brands array for the category
      if (
        indexToUpdate >= 0 &&
        indexToUpdate < fabricCategoryBrands[categoryIndex].brands.length
      ) {
        // Update the brand within the category
        fabricCategoryBrands[categoryIndex].brands[indexToUpdate] = newBrand;

        // Save the updated document
        const updatedDocument = await findCategories.save();

        res.status(200).json({
          message: "fabricCategoryBrands updated successfully",
          updatedDocument,
        });
      } else {
        return res.status(400).json({ message: "New brand name is required" });
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
















/********************************************* Working  New Apis ******************************************************************/
/******************************** Post APi ************************/

// Create a new FabricDropdown entry
exports.createFabricDropdown = catchAsyncError(async (req, res) => {
  const { fabricCategory } = req.body;

  // Check if the fabricCategory already exists in the database
  const existingCategory = await fabricdropdowns.findOne({ fabricCategory });

  if (existingCategory) {
    return res
      .status(400)
      .json({ success: false,message: "This fabricCategory already exists." });
  }

  const fabricDropdown = new fabricdropdowns(req.body);
  const savedFabricDropdown = await fabricDropdown.save();
  return res.status(200).json({ success: true,message: "Add fabric data Successfully." , data:savedFabricDropdown});
});


/******************************** Update APi ************************/

// Update a FabricDropdown entry by fabricCategory
exports.updateFabricDropdown = catchAsyncError(async (req, res) => {
  const { fabricCategory } = req.body;

  try {
    // Check if the fabricCategory exists in the database
    const existingCategory = await fabricdropdowns.findOne({ fabricCategory });

    if (!existingCategory) {
      return res.status(404).json({ success: false,message: "FabricCategory not found." });
    }

    // Function to check and add unique values to an array
    const addUniqueValuesToArray = (existingArray, valuesToAdd) => {
      return [...new Set([...existingArray, ...valuesToAdd])];
    };

    // Update the fields individually without overwriting the existing data
    if (req.body.fabricBrand) {
      existingCategory.fabricBrand = addUniqueValuesToArray(
        existingCategory.fabricBrand,
        req.body.fabricBrand
      );
    }
    if (req.body.fabricColor) {
      existingCategory.fabricColor = addUniqueValuesToArray(
        existingCategory.fabricColor,
        req.body.fabricColor
      );
    }
    if (req.body.fabricComposition) {
      existingCategory.fabricComposition = addUniqueValuesToArray(
        existingCategory.fabricComposition,
        req.body.fabricComposition
      );
    }
    if (req.body.fabricSubCategory) {
      existingCategory.fabricSubCategory = addUniqueValuesToArray(
        existingCategory.fabricSubCategory,
        req.body.fabricSubCategory
      );
    }
    if (req.body.fabricMaterial) {
      existingCategory.fabricMaterial = addUniqueValuesToArray(
        existingCategory.fabricMaterial,
        req.body.fabricMaterial
      );
    }
    if (req.body.fabricPattern) {
      existingCategory.fabricPattern = addUniqueValuesToArray(
        existingCategory.fabricPattern,
        req.body.fabricPattern
      );
    }
    if (req.body.fabricTypes) {
      existingCategory.fabricTypes = addUniqueValuesToArray(
        existingCategory.fabricTypes,
        req.body.fabricTypes
      );
    }
    if (req.body.fabricCharacteristics) {
      existingCategory.fabricCharacteristics = addUniqueValuesToArray(
        existingCategory.fabricCharacteristics,
        req.body.fabricCharacteristics
      );
    }
    if (req.body.fabricSeason) {
      existingCategory.fabricSeason = addUniqueValuesToArray(
        existingCategory.fabricSeason,
        req.body.fabricSeason
      );
    }

    if (req.body.fabricGsm) {
      existingCategory.fabricGsm = addUniqueValuesToArray(
        existingCategory.fabricGsm,
        req.body.fabricGsm
      );
    }

    // Save the updated FabricDropdown entry
    const updatedFabricDropdown = await existingCategory.save();
   return res.status(200).json({ success: true,message: "Update Fabic Data Successfully.",data:updatedFabricDropdown});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


/******************************** Delete Api ************************/

// Delete values from a FabricDropdown entry by fabricCategory
exports.deleteValuesFromFabricDropdown = catchAsyncError(async (req, res) => {
  const { fabricCategory } = req.body;

  try {
    // Check if the fabricCategory exists in the database
    const existingCategory = await fabricdropdowns.findOne({ fabricCategory });

    if (!existingCategory) {
      return res.status(404).json({ message: "FabricCategory not found." });
    }

    // Function to remove values from an array
    const removeValuesFromArray = (existingArray, valuesToRemove) => {
      return existingArray.filter((value) => !valuesToRemove.includes(value));
    };

    // Remove the specified values from the fields
    if (req.body.fabricBrand) {
      existingCategory.fabricBrand = removeValuesFromArray(
        existingCategory.fabricBrand,
        req.body.fabricBrand
      );
    }
    if (req.body.fabricColor) {
      existingCategory.fabricColor = removeValuesFromArray(
        existingCategory.fabricColor,
        req.body.fabricColor
      );
    }
    if (req.body.fabricComposition) {
      existingCategory.fabricComposition = removeValuesFromArray(
        existingCategory.fabricComposition,
        req.body.fabricComposition
      );
    }
    if (req.body.fabricSubCategory) {
      existingCategory.fabricSubCategory = removeValuesFromArray(
        existingCategory.fabricSubCategory,
        req.body.fabricSubCategory
      );
    }
    if (req.body.fabricMaterial) {
      existingCategory.fabricMaterial = removeValuesFromArray(
        existingCategory.fabricMaterial,
        req.body.fabricMaterial
      );
    }
    if (req.body.fabricPattern) {
      existingCategory.fabricPattern = removeValuesFromArray(
        existingCategory.fabricPattern,
        req.body.fabricPattern
      );
    }
    if (req.body.fabricTypes) {
      existingCategory.fabricTypes = removeValuesFromArray(
        existingCategory.fabricTypes,
        req.body.fabricTypes
      );
    }
    if (req.body.fabricCharacteristics) {
      existingCategory.fabricCharacteristics = removeValuesFromArray(
        existingCategory.fabricCharacteristics,
        req.body.fabricCharacteristics
      );
    }
    if (req.body.fabricSeason) {
      existingCategory.fabricSeason = removeValuesFromArray(
        existingCategory.fabricSeason,
        req.body.fabricSeason
      );
    }

    if (req.body.fabricGsm) {
      existingCategory.fabricGsm = removeValuesFromArray(
        existingCategory.fabricGsm,
        req.body.fabricGsm
      );
    }

    // Save the updated FabricDropdown entry
    const updatedFabricDropdown = await existingCategory.save();
   return res.status(200).json( {success:true,message: "delete fabric data Successfully.",data:updatedFabricDropdown});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


/******************************** Get Apis ************************/

// Get values from a FabricDropdown 
exports.getfabricdropdownitem = catchAsyncError(async (req, res, next) => {
  const gettingFabItems = await fabricdropdowns.find();
  // res.send(gettingFabItems);
  return res.status(200).json({
    success: true,
    message: "FabricDropdown data list",
    data:gettingFabItems,
  });
});


// // Get a FabricDropdown item by ID
// exports.getFabricDropdownItemById = catchAsyncError(async (req, res, next) => {
//   const { id } = req.params; // Assuming you pass the ID in the URL params

//   try {
//     const fabricDropdownItem = await fabricdropdowns.findById(id);

//     if (!fabricDropdownItem) {
//       return res.status(404).json({  success: false,message: "FabricDropdown item not found." });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "FabricDropdown item retrieved successfully",
//       data:fabricDropdownItem,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });




// Get a FabricDropdown item by ID
exports.getFabricDropdownItemById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params; // Assuming you pass the ID in the URL params

  try {
    const fabricDropdownItem = await fabricdropdowns.findById(id);

    if (!fabricDropdownItem) {
      return res.status(404).json({  success: false,message: "FabricDropdown item not found." });
    }

    return res.status(200).json({
      success: true,
      message: "FabricDropdown item retrieved successfully",
      data:fabricDropdownItem,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
