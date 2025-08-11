const Profile = require("../models/Profile");
const User = require("../models/../models/User");
const {uploadToCloudinary} = require("../utils/imageUploader");
const schedule = require('node-schedule');
mongoose = require("mongoose");
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course");

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const id = req.user.id;

        if (!contactNumber || !gender || !id) {
            return res.status(403).json({
                success: false,
                message: "All fields required",
            });
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();


        return res.status(200).json({
            success: true,
            message: "profile Updated Successfully",
            profileDetails,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, profile cannot be Updated",
            error: error.message
        });
    }
};

//delete Account
// how to schedule this request of delete account
exports.deleteAccount = async (req, res) => {

    try {
        // const job = schedule.scheduleJob('10 * * * * *', function () {
            console.log("⏰ Job triggered: deleting account logic runs here");
        // });
        const id = req.user.id;
        // console.log(id);
        
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "user not found",
            });
        }
        //  console.log("profile: ",userDetails.additionalDetails);
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        //un enroll user from all enrolled courses
        // 1. Get all courses user is enrolled in
        // const enrolledCourses = userDetails.enrolledCourses;

        // if (enrolledCourses.length > 0) {
        //     for (const courseId of enrolledCourses) {
        //         await Course.findByIdAndUpdate(courseId, {
        //             $pull: { studentsEnrolled: userDetails._id }
        //         });
        //     }
        // }


        await User.findByIdAndDelete({ _id: id });

        return res.status(200).json({
            success: true,
            message: "Response message, account deleted successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, Account cannot be deleted",
            error: error.message
        });
    }
};

//update profile picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    // console.log(image);

    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );

    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// get all user details
exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        // console.log(userDetails);

        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails
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

exports.instructerDashboard = async (req, res) => {
  try {
    const id =  req.user.id ;
    // console.log("instrcter id: ",id);
    const courseDetails = await Course.find({ instructer:id});
    // console.log("courseDetails:", courseDetails);

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      return {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      };
    });

    res.status(200).json({
      success: true,
      courses: courseData, // ✅ Correct variable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length;
      // console.log(courseProgressCount);
      
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
