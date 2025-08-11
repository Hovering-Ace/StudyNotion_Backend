const mongoose = require("mongoose");
const { type } = require("os");
const { ref } = require("process");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        trim: true,
        required: true,

    },
    courseDescription: {
        type: String,
        trim: true,
        required: true,
    },
    instructer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    whatYouWillLearn: {
        type: String,
        trim: true,
        required: true,

    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview"
        }
    ],
    price:{
        type:Number,
    },
    thumbnail:{
        type:String,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Category"
    },
    tag: {
        type: [String],
        trim: true,
        required: true,

    },
    instruction: {
        type: [String],
        trim: true,
        required: true,

    },
    status:{
        type:String,
        enum:["Draft","Published"]
    },
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);