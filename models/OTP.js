const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender"); 
const body = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:60*60*10,
    }
});

//send verification email
 
async function sendVerificationEmail(email,otp){
    try {
       const emailBody = body({otp});
       const mailResponse = await mailSender(email,"Verification Email from StudyNotion",emailBody);
       //console.log("mail sent successfully",mailResponse);
        
    } catch (error) {
        console.log("error during mail verification->",error);
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
    this.otp = "222"+this.otp
    // await sendVerificationEmail(this.email,this.otp);
    // console.alert("otp saved success");
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);