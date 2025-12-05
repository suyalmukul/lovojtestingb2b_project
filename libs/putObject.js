const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("./s3Client");
const uuid = require("uuid").v4;
const uploadObject = async (file) => {
  const base_url = process.env.BUCKET_BASE_URL;
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${uuid()}-${file?.originalname}`,
    Body: file.buffer,
  };
  try {
    const results = await s3Client.send(new PutObjectCommand(params));
    return `${base_url}/${params.Bucket}/${params.Key}`;
  } catch (err) {
    console.log("Error", err);
  }
};
module.exports = {
  uploadObject,
};
