// function findCombinations(numbers, targetSum) {
//   numbers = numbers.filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
//   numbers.sort((a, b) => a - b); // Sort the numbers array in ascending order
//   const result = [];

//   function backtrack(index, currentSum, combination, usedNumbers) {
//     if (currentSum === targetSum) {
//       result.push([...combination]);
//       return;
//     }

//     for (let i = index; i < numbers.length; i++) {
//       if (currentSum + numbers[i] <= targetSum && !usedNumbers.has(numbers[i])) {
//         combination.push(numbers[i]);
//         usedNumbers.add(numbers[i]);
//         backtrack(i + 1, currentSum + numbers[i], combination, usedNumbers);
//         combination.pop();
//         usedNumbers.delete(numbers[i]);
//       }
//     }
//   }

//   backtrack(0, 0, [], new Set());
//   return result;
// }

// // Example usage:
// const numbers = [1, 2, 1, 3, 4, 1, 4, 7, 9, 3, 1, 3, 5, 2];
// const target = 9;
// const combinations = findCombinations(numbers, target);

// if (combinations.length > 0) {
//   console.log(combinations);
// } else {
//   console.log("No combination found.");
// }

// //result above
// [ [ 1, 1, 1, 1, 2, 3 ], [ 1, 2, 3, 3 ], [ 1, 3, 5 ], [ 4, 5 ], [ 9 ] ]



// // replace numbers as a fabricRole they allready in const Fabrics = require("../models/fabric");  and target replace fabricQuantity and if user select any 
// // fabricQuantity then also pull the data in db and also pull fabricRole in db i






exports.getRatingOfStores = async (stores) => {
    // Fetch fabImages for each store
    const storeId = stores.map((store) => store.storeId);
    const storeRatingPipeline = [
      { $match: { storeId: { $in: storeId } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$storeId",
          rating: { $push: "$rating" },
        },
      },
      {
        $project: {
          _id: 0,
          storeId: "$_id",
          rating: { $reverseArray: "$rating" },
        },
      },
    ];
  
    const storeRatings = await StoreRating.aggregate(storeRatingPipeline);
  
    return stores.map((store) => {
      const storeRating = storeRatings.find(
        (rating) => rating.storeId.toString() === store.storeId.toString()
      );
      return {
        ...store,
        rating: storeRating ? storeRating.rating : [],
      };
    });
  };
  
  
  





exports.getStoreWithFabImages = catchAsyncError(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
  
    let { pipeline, countPipeline, totalCount } =
      await fabricService.getStoreFabricPipeline(req.query, page, limit);
  
    let stores = [];
  
    stores = await Store.aggregate(pipeline);
  
    const countResult = await Store.aggregate(countPipeline);
  
    totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  
    const showingResults = {
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, totalCount),
    };
  
    // Fetch the ratings for the stores
    stores = await fabricService.getRatingOfStores(stores);
  
    stores = await fabricService.getFabricImagesOfStores(stores);
  
    return res.status(200).json({
      success: true,
      message: "Store with fabricImages",
      totalCount,
      page,
      showingResults,
      stores,
    });
  });
  




  if (minRating && maxRating) {
    matchQuery.fabricPrice = {
      $gte: parseInt(minRating),
      $lte: parseInt(maxRating),
    };
  } else if (minRating) {
    matchQuery.fabricPrice = { $gte: parseInt(minRating) };
  } else if (maxPrice) {
    matchQuery.fabricPrice = { $lte: parseInt(maxRating) };
  }