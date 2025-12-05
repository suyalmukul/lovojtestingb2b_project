// /********************************************* */
// const path = require('path');
// const AWS = require('aws-sdk');
// const colors = require("colors");



// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   Bucket: process.env.S3_BUCKET_NAME,
//   BucketUrl: process.env.BUCKET_BASE_URL
// });

// const deleteFromS3 = async (urls) => {
//   const processUrl = async (imageUrl) => {
//     if (typeof imageUrl !== "string") {
//       throw new Error("URL must be a string.");
//     }
  
//     try {
//       const key = new URL(imageUrl).pathname;
//       console.log(colors.blue('Deleting key:', key)); // Log the key being deleted
//       const params = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: key,
//       };

//       console.log('Existing Image URL before deletion:', urls.imageUrl);

//       const deletedFromS3 = await s3.deleteObject(params).promise();

//       console.log('Existing Image URL after deletion:', urls.imageUrl);

//       console.log('Deleted from S3:', deletedFromS3);
//     } catch (error) {
//       console.error("Error deleting from S3:", error);
//       throw error;
//     }
//   };
  

//   if (!Array.isArray(urls)) {
//     urls = [urls];
//   }

//   try {
//     await Promise.all(urls.map((url) => processUrl(url)));
//   } catch (error) {
//     throw error;
//   }
// };

// module.exports = deleteFromS3;






const AWS = require('aws-sdk');
const colors = require('colors');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  Bucket: process.env.S3_BUCKET_NAME,
  BucketUrl: process.env.BUCKET_BASE_URL
});

const deleteFromS3 = async (urls) => {
  const processUrl = async (imageUrl) => {
    if (typeof imageUrl !== 'string') {
      console.error('Invalid URL:', imageUrl);
      throw new Error('URL must be a string.');
    }

    try {
      const key = new URL(imageUrl).pathname;
      console.log(colors.blue('Deleting key:', key)); // Log the key being deleted
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      };

      console.log('Existing Image URL before deletion:', imageUrl);

      const deletedFromS3 = await s3.deleteObject(params).promise();

      // Update imageUrl after deletion if deletedFromS3 has a Location property
      imageUrl = deletedFromS3.Location ? `URL after deletion: ${deletedFromS3.Location}` : imageUrl;

      console.log('Existing Image URL after deletion:', imageUrl);

      console.log('Deleted from S3:', deletedFromS3);
    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw error;
    }
  };

  // If it's a single URL, convert it to an array
  const urlArray = Array.isArray(urls) ? urls : [urls];

  console.log('Received URLs:', urlArray);

  try {
    await Promise.all(urlArray.map((url) => processUrl(url)));
  } catch (error) {
    throw error;
  }
};

module.exports = deleteFromS3;
