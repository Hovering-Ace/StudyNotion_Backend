const express = require("express")
const router = express.Router()

const{createCourse,getAllCourses,getCourseDetails,editCourse,getFullCourseDetails,getInstructerCourses,deleteCourse,}=require("../controllers/Course");
//   getFullCourseDetails,
//   
//   getInstructorCourses,
//   deleteCourse,

const {
  createCategory,
  categoryPageDetails,
  showAllCategory,
} = require("../controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/SubSection");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

const {
  updateCourseProgress,
  getProgressPercentage,
} = require("../controllers/courseProgress");

const { auth, isInstructer, isStudent, isAdmin } = require("../middlewares/auth");


/***************Routes Mapping*********************/

//instructer routes
router.post("/createCourse",auth,isInstructer,createCourse);
// Edit Course routes
router.post("/editCourse", auth, isInstructer, editCourse)
router.post("/addSubSection",auth,isInstructer,createSubSection);
router.post("/addSection",auth,isInstructer,createSection);
// Update a Section
router.post("/updateSection", auth, isInstructer, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructer, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructer, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructer, deleteSubSection)
// Get all Courses Under a Specific Instructor
router.get("/getInstructerCourses", auth, isInstructer, getInstructerCourses)
router.get("/getAllCourses", getAllCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
// for all routes
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses

// admin routes

router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategory)
router.post("/getCategoryPageDetails", categoryPageDetails)

// for students
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports=router;