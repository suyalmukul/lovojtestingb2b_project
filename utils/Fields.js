const mongoose = require('mongoose');

const transformPopulatedFields = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => transformPopulatedFields(item)); // Recursively transform arrays
    }

    if (typeof data !== "object" || data === null) return data;
    let transformedData = Object.assign({}, data); // Ensure a proper clone
    for (let key in data) {
        const value = transformedData[key];

        if (value === undefined || value === null) continue;  // Skip undefined or null values

        // Convert ObjectId to string
        if (value instanceof mongoose.Types.ObjectId) {
            transformedData[key] = value.toString();
        }
        // Recursively transform arrays
        if (Array.isArray(value)) {
            transformedData[key] = value.map(item => transformPopulatedFields(item));
        }
        // If the key ends with _id and is an object, rename it to *_data
        if (key.endsWith("_id") && key !== "_id" && typeof value === "object"&&!(value instanceof mongoose.Types.ObjectId)) {
            let newKey = key.replace("_id", "_data");
            transformedData[newKey] = transformPopulatedFields(value); // Ensure deep transformation
            delete transformedData[key]; // Remove original _id key
        }
        if (typeof value == 'object'&& key !== "_id"&&!key.endsWith("_id")&&!(value instanceof Date)) {
            transformedData[key] = transformPopulatedFields(value);
        }

    }

    return transformedData;
};

module.exports = { transformPopulatedFields };

