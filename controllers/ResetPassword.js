const nodemailer = require("nodemailer");
const mailSender = require("../utils/mailSender")
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


//reset password token
exports.resetPasswordToken = async (req, res) => {
    try {
      const email = req.body.email;
      const user =await User.findOne({email});
      if(!user){
        return res.status(404).json({
            success: false,
            message: "your email is not registered",
        });
      } 
      
      const token = crypto.randomBytes(20).toString("hex");

      const updateDetails = await User.findOneAndUpdate({email:email},
        {
           token:token,
           resetPasswordExpires:Date.now()+5*60*1000,
      },{new:true});
    //console.log("Details: ", updateDetails);
    
    const url = `http://localhost:3000/update-password/${token}` 

    await mailSender(email,
        "Password reset Link",`Password reset Link: ${url}. Please click url to reset password.`
    );
    return res.status(200).json({
        success: true,
        message: "Email sent successfully, please check mail and change your password",
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error mail can't be sent"
        });
    }
};

//reset password
exports.resetPassword = async (req, res) => {
    try {
       const{token,confirmPassword,password} = req.body;

       if(confirmPassword!==password){
          return res.status(401).json({
              success: false,
              message: "password not matching",
          });
       } 
       
       const userDetails = await User.findOne({token:token});

       if(!userDetails){
        return res.status(404).json({
            success: false,
            message: "token is invalid",
        });
       }
       
       if(userDetails.resetPasswordExpires<Date.now()){
        return res.status(401).json({
            success: false,
            message: "token is expired, regenerate it",
           
        });
       }

       const hashPwd = await bcrypt.hash(password,10);
       
       await User.findOneAndUpdate({token:token},{password:hashPwd},
        {new:true});

       return res.status(200).json({
           success: true,
           message: "password reset Successfully"
       });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, password cannot be updated.",
            msg:error.message,
        });
    }
};