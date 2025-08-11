const User = require("../models/User");
const Profile = require("../models/Profile")
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const mailSender = require("../utils/mailSender");

require("dotenv").config();

//send otp
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(401).json({
                success: false,
                message: 'user already exist'
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        // console.log('otp : ', otp);

        const result = await OTP.findOne({ otp: otp });
        //check for unique otp
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            const result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = {
            email, otp
        };

        //create entry in db 
        const otpBody = await OTP.create(otpPayload);
        // console.log(otpBody);

        return res.status(200).json({
            sucess: true,
            message: 'OTP sent successfully',
            otpBody
        });

    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            sucess: false,
            message: error.message,
        })

    }
}

//signUp
exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, contactNumber, accountType, otp } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp||!accountType) {
            return res.status(400).json({
                sucess: false,
                message: 'All fields are required'
            });
        }

        if (confirmPassword !== password) {
            return res.status(401).json({
                sucess: false,
                message: 'password and confirm password does not match try Again!'
            });
        }
        
        
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(401).json({
                sucess: false,
                message: 'User Already exist'
            });
        }

        const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });

        // console.log(recentOTP);

        if (recentOTP.length == 0) {
            return res.status(401).json({
                sucess: false,
                message: 'NO OTP found'
            });
        } else if (otp != recentOTP.otp) {
            return res.status(401).json({
                sucess: false,
                message: 'invalid otp'
            });
        }
       
        const hashPass = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            contactNumber: contactNumber,
            password: hashPass,
            accountType: accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        }
        const result = await User.create(user);
        return res.status(200).json({
            success: true,
            message: 'user registered successfully',
            result,
        })
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            sucess: false,
            error: error.message,
            message: 'user cannot be registered try Again!'
        })
    }
}



//login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).jso({
                sucess: false,
                message: 'incomplete detail, all fields required '
            });
        }

        if (!email.includes('@')) {
            return res.status(401).json({
                sucess: false,
                message: 'invalid Email'
            });
        }

        const user = await User.findOne({ email }).populate("additionalDetails").exec();

        if (!user) {
            return res.status(401).json({
                sucess: false,
                message: 'User does not exist, Please SignUP first'
            });
        }

        const hash = user.password;

        if (await bcrypt.compare(password, hash)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            // create jwt token
            let token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "12h" },);

            // const newuser = existUser.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'user logged in successfully',
            })
        } else {
            return res.status(403).json({
                success: false,
                message: "incorrect password"
            });
        }

    } catch (error) {
        // console.log(error);

        return res.status(500).json({
            success: false,
            message: "login filed try again!",
            msg:error.message
        });
    }
}

//change Password
exports.changePassword = async (req, res) => {
    try {
        //get dat from req  //get oldpass,new pass,confnew pass
        const { password, newPassword, confirmPassword } = req.body;

        if (!password || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        //validate old pass
        const userId = req.user.id;
        const email = req.user.email;
        const user = await User.findById({ _id: userId });
        if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
        const hash = user.password;

        if (await bcrypt.compare(password, hash)) {
            if (confirmPassword !== newPassword) {
                return res.status(401).json({
                    success: false,
                    message: "old and new password are not matching",
                });
            }
            const hashPass = await bcrypt.hash(newPassword, 10);
            //update pass in db
            const updatedUser = await User.findByIdAndUpdate({ _id: userId },
                { password: hashPass },
                { new: true },
            );
            //send mail for pwd update
            await mailSender(email,
                "Password is changed", `You Password for StudyNotion Has been changed successfully.`
            );
            //return res 
            return res.status(200).json({
                success: true,
                message: "password reset Successfully",
            });
        } else {
            return res.status(403).json({
                success: false,
                message: "wrong passord entered, please enter correct pasword",
            });
        }
    } catch (error) {
       return res.status(500).json({
           success: false,
           message: "password cannot be changed successfully ",
       });
    }
}