const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, timeDuration
            , description } = req.body;

        const video = req.files.video;


        if (!sectionId || !title
            || !description || !video) {
            return res.status(404).json({
                success: false,
                message: "All fields are not required",
            });
        }
        const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER_NAME);

        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        const data = await Section.findByIdAndUpdate(sectionId, {
            $push: {
                subSection: SubSectionDetails._id,
            }
        },
            { new: true }
        ).populate('subSection');
        //log updated section with populate
        return res.status(200).json({
            success: true,
            message: "subsection created successfully",
            data,
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, subSection cannot be created",
            error: error.message
        });
    }
};

//update 
exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, timeDuration, description } = req.body;

        // console.log("BODY:", req.body);
        // console.log("FILES:", req.files);

        // || !description
        if (!subSectionId || !title ) {
            return res.status(400).json({
                success: false,
                message: "subSectionId, title and description are required",
            });
        }

        // Prepare update object
        const updateFields = {
            title,
            timeDuration,
            description,
        };

        // If video is uploaded, process it
        if (req.files && req.files.video) {
            const uploadDetails = await uploadToCloudinary(
                req.files.video,
                process.env.FOLDER_NAME
            );
            updateFields.videoUrl = uploadDetails.secure_url;
        }

        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            updateFields,
            { new: true }
        );

        // ✅ Optionally return the full updated section
        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSection, // or return just updatedSubSection
        });
    } catch (error) {
        console.error("Error updating subsection:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error, subsection couldn't be updated",
            error: error.message,
        });
    }
};


//delete SubSection
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId });

        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
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