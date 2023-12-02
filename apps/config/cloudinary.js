const CONFIG = require("./index")
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: CONFIG.cloudinary_cloud_name,
  api_key: CONFIG.cloudinary_api_key,
  api_secret: CONFIG.cloudinary_api_secret,
});

module.exports = cloudinary;
