const cloudinary = require("cloudinary").v2

exports.uploadToCloudinary = async (file, folder, height, quality) => {
  const options = { folder }
  if (height) {
    options.height = height
  }
  if (quality) {
    options.quality = quality
  }
  options.resource_type = "auto"
  console.log("OPTIONS", options)
  return await cloudinary.uploader.upload(file.tempFilePath, options)
}

// const cloudinary = require("cloudinary").v2;

// exports.uploadToCloudinary = async (file,folder,height,quality) => {
//   try {
//     const options = {folder};
//     if(quality){
//         options.quality;
//     }
//     if(height){
//         options.height;
//     }
//     options.resource_type = "auto";
//     return await cloudinaryuploader.upload(file.tempFilePath,options);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error, cannot upload to cloudinary",
//       error: error.message
//     });
//   }
// };