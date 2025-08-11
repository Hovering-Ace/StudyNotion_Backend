const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

// create Rating
exports.createRating = async (req, res) => {
    try {
        const { courseId, rating, review } = req.body;

        const userId = req.user.id;
        //console.log(courseId, rating, review, userId);


        if (!courseId || !rating || !review) {
            return res.status(404).json({
                success: false,
                message: "All fields required",
            });
        }
        const courseDetails = await Course.findById(courseId);
        if (!courseDetails) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (!courseDetails.studentsEnrolled.some(id => id.toString() === userId)) {
            return res.status(401).json({ success: false, message: "Student is not enrolled in course" });
        }

        // const courseDetails = await Course.findOne({ _id: courseId, studentsEnrolled: { $elemMatch: { $eq: userId } } });

        if (!courseDetails.studentsEnrolled.includes(userId)) {
            return res.status(401).json({
                success: false,
                message: "student is not enrolled in course",
            });
        }
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if (alreadyReviewed) {
            return res.status(401).json({
                success: false,
                message: "Student has already given rating and reviews to course",
            });
        }

        const ratingAndReview = await RatingAndReview.create({
            course: courseId,
            user: userId,
            rating: rating,
            review: review
        })

        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            { $push: { ratingAndReviews: ratingAndReview._id }, },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "rating and review created successfully",
            ratingAndReview
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


//create avg rating
exports.getAverageRating = async (req, res) => {
    try {
        const courseId = req.body.courseId;
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseID),
                },
            },
            {
                $group: {
                    id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ]);

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Average rating found",
                averageRating: result[0].averageRating,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no rating given till now",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// get All rating
exports.getAllRating = async (req, res) => {
    try {
        // const courseId = req.body;
        const allReviews = await RatingAndReview.find({}).sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image"
            })
            .populate({
                path: "course"
            }).exec();
        console.log("allReviews :",allReviews );
        
        return res.status(200).json({
            success: true,
            message: "all reviews fetched successfully",
            allReviews,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};