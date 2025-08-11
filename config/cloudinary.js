const cloudinary = require ("cloudinary").v2;
require("dotenv").config();

exports.cloudanaryConnect = ()=>{
    try {
       // console.log("starting cloud ..");
        
        cloudinary.config({
           cloud_name: process.env.CLOUD_NAME,
           api_key: process.env.API_KEY,
           api_secret: process.env.API_SECRET,
        })
        console.log('✅ cloud connection successful');
    } catch (error) {
        console.error(error);
    }
}