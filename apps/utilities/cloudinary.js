const cloudinary = require("../config/cloudinary")

module.exports.upload = async (files, foldername) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(files, {
          folder: foldername,
          resource_type: "image"
        }, (error, result) => {
          if (error) {
            reject(error); 
          } else {
            resolve(result); 
          }
        });
      });
}

module.exports.destroy = async (url) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    console.log(fileName)
    const publicId = fileName.substring(0, fileName.lastIndexOf('.'))
    const res = await cloudinary.uploader.destroy(publicId, {resource_type: "image"});
    console.log(res);
    return res
}