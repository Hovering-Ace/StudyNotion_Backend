const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth

exports.auth = async (req, res, next) => {
    
    try { 
        const token = req.cookies.token
           
            || req.header("Authorization").replace("Bearer ", "");

        //console.log("innside Auth midlleware 2",token);
        if (!token) {
            return res.status(403).json({
                success: false,
                message: "token is missing"
            });
        }
       // console.log("innside Auth midlleware 3");

        try {
           // console.log("innside Auth midlleware 4");
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            //console.log(decode);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "token is invalid",
                msg:error.message
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "something went wrong while validating token",
            error:error.message,
        });
    }
}

// is student
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(400).json({
                success: false,
                message: "his protected route for Student"
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified"
        });
    }
};

exports.isInstructer = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructer") {
            return res.status(400).json({
                success: false,
                message: "This protected route for Instructer"
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified"
        });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(400).json({
                success: false,
                message: "this protected route for Admin"
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "user role cannot be verified"
        });
    }
};