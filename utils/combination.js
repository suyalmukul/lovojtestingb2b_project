// function findCombinations(arr, target) {
//   const result = [];

//   function backtrack(start, target, path) {
//     if (target === 0) {
//       result.push([...path]);
//       return;
//     }

//     for (let i = start; i < arr.length; i++) {
//       if (target - arr[i] >= 0) {
//         path.push(arr[i]);
//         backtrack(i + 1, target - arr[i], path); // Use i + 1 as the new start index
//         path.pop();
//       }
//     }
//   }

//   backtrack(0, target, []);

//   // Filter out duplicate combinations
//   const uniqueCombinations = [];
//   const seen = new Set();

//   for (const combination of result) {
//     // Sort the combination for consistent representation
//     const sortedCombination = [...combination].sort((a, b) => a - b);

//     // Convert the sorted combination to a string
//     const combinationString = sortedCombination.join(',');

//     if (!seen.has(combinationString)) {
//       uniqueCombinations.push(sortedCombination);
//       seen.add(combinationString);
//     }
//   }

//   return uniqueCombinations;
// }

// module.exports = findCombinations;







function findCombinations(arr, target) {
  const result = [];

  function backtrack(start, target, path) {
    if (target === 0) {
      result.push([...path]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      if (target - arr[i] >= 0) {
        path.push(arr[i]);
        backtrack(i + 1, target - arr[i], path); // Use i + 1 as the new start index
        path.pop();
      }
    }
  }

  backtrack(0, target, []);

  // Filter out duplicate combinations
  const uniqueCombinations = [];
  const seen = new Set();

  for (const combination of result) {
    // Sort the combination for consistent representation
    const sortedCombination = [...combination].sort((a, b) => a - b);

    // Convert the sorted combination to a string
    const combinationString = sortedCombination.join(',');

    if (!seen.has(combinationString)) {
      uniqueCombinations.push(sortedCombination);
      seen.add(combinationString);
    }
  }

  return uniqueCombinations;
}

module.exports = findCombinations;
