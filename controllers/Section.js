const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(404).json({
        success: false,
        message: "all feilds are required",
      });
    }
    const newSection = await Section.create({
      sectionName,
    })

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    return res.status(200).json({
      success: true,
      message: "Response message section created successfully",
      updatedCourse
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error Section cannot be created",
      error: error.message
    });
  }
};


exports.updateSection = async (req, res) => {
  try {
    const { sectionId, sectionName, courseId } = req.body;

    if (!sectionId || !sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields (sectionId, sectionName, courseId) are required",
      });
    }

    // Update the section name
    await Section.findByIdAndUpdate(sectionId, { sectionName });

    // Fetch and return the updated course with populated subsections
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data:updatedCourse,
    });

  } catch (error) {
    console.error("Update Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, cannot update section",
      error: error.message,
    });
  }
};




exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Both sectionId and courseId are required",
      });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Delete all subSections
    if (section.subSection && section.subSection.length > 0) {
      await SubSection.deleteMany({ _id: { $in: section.subSection } });
    }

    // Delete the section itself
    await Section.findByIdAndDelete(sectionId);

    // ✅ Remove the section from the course's courseContent
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { courseContent: sectionId } },
      { new: true }
    );

    // ✅ Fetch and return the updated course
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section and all its SubSections deleted successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("Delete Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, cannot delete Section",
      error: error.message,
    });
  }
};

