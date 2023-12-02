const cloudinary = require("../config/cloudinary")

module.exports.upload = async (files, foldername) => {
    const res = await cloudinary.uploader.upload(files, {
        folder: foldername,
        resource_type: "auto"}
    );
    console.log(res);
    return res
}