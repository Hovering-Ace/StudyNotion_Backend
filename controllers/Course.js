const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

exports.createCourse = async (req, res) => {
    try {
        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category, status, } = req.body;
        const tag = JSON.parse(req.body.tag);
        const instruction = JSON.parse(req.body.instruction);

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category ||
            !thumbnail) {
            return res.status(404).json({
                success: false,
                message: "All fields required",

            });
        }

        //console.log("thumbnail in controller :", thumbnail)        

        //check for instructer
        const userId = req.user.id;
        const instructerDetails = await User.findById(userId);
        //console.log("Instructer detail: ", instructerDetails);

        // verify instructer id and user id are same
        if (!instructerDetails) {
            return res.status(404).json({
                success: false,
                message: "No instructer found",
            });
        }
        //check given category is valid
        const categoryDetails = await Category.findById(category);

        if (!categoryDetails) {
            return res.status(401).json({
                success: false,
                message: "category details not found",
            });
        }
        //upload to cloudinary
        const thumbnailImage = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);
        //create db entry
        const newCourse = await Course.create({
            courseName,
            courseDescription: courseDescription,
            instructer: instructerDetails._id,
            whatYouWillLearn,
            price,
            tag,
            status,
            instruction,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });
        //updte instructer courselist
        await User.findByIdAndUpdate({ _id: instructerDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        )
        //updatecategory Schema verify it
        await Category.findByIdAndUpdate({ _id: categoryDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        )
        return res.status(200).json({
            success: true,
            message: "course created successfully",
            data: newCourse
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error,failed to create course",
            error: error.message
        });
    }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const previousStatus = course.status; // <- track previous status

    // Update thumbnail if present
    if (req.files?.thumbnailImage) {
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update fields
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (key === "tag" || key === "instructions") {
          try {
            course[key] = JSON.parse(updates[key]);
          } catch (err) {
            console.warn(`Invalid JSON for key ${key}:`, updates[key]);
            course[key] = [];
          }
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    // 🔥 If course is now "Published" and was not published before
    
    if (course.status === "Published" && (previousStatus !== "Published")) {
      await Category.findByIdAndUpdate(
        course.category,
        {
          $addToSet: { courses: course._id }, // ensures no duplicates
        },
        { new: true }
      );
    }

    const updatedCourse = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructer",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Edit course error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.getAllCourses = async (req, res) => {
    try {
        // const allCourses = await Course.find({},{courseName:true,
        //     price:true,
        //     thumbnail:true,
        //     instructer:true,
        //     ratingAndReviews:true,
        //     studentsEnrolled:true
        // }).populate("instructer").exec();
        const allCourses = await Course.find();
        return res.status(200).json({
            success: true,
            message: "data for all courses fetched succcessfully",
            allCourses
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, cannot feth course data",
            error: error.message
        });
    }
};

//getCourseDetails

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const courseDetails = await Course.findOne({ _id: courseId }).populate({
            path: "instructer",
            populate: {
                path: "additionalDetails"
            },
        }).populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection"
                },
            }).exec();
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `could not found course with ${courseId}`,
            });
        }
        return res.status(200).json({
            success: true,
            message: "course details fetched successfully",
            courseDetails,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, could not get course details",
            error: error.message
        });
    }
};

exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructer",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        //console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructerCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructerId = req.user.id;
        console.log("instructer: ",instructerId);
        

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructer: instructerId,
        }).sort({ createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}
