const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All feilds required",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    return res.status(200).json({
      success: true,
      message: "category created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error, category cannot be created"
    });
  }
};

exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({}, { name: true, description: true }).populate("courses").exec();

    return res.status(200).json({
      success: true,
      message: "all categorys returned successfully",
      allCategory
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      msg: error.message
    });
  }
};

// exports.categoryPageDetails = async (req, res) => {
//   try {
//     const { categoryId } = req.body;

//     // 1. Fetch selected category
//     const selectedCategory = await Category.findById(categoryId)
//       .populate("courses")
//       .exec();

//     if (!selectedCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     // 2. Handle empty courses
//     if (selectedCategory.courses.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No courses found for the selected category",
//       });
//     }

//     const selectedCourses = selectedCategory.courses;

//     // 3. Fetch other categories and their courses
//     const categoriesExceptSelected = await Category.find({
//       _id: { $ne: categoryId },
//     }).populate("courses");

//     let differentCourses = [];
//     for (const category of categoriesExceptSelected) {
//       differentCourses.push(...category.courses);
//     }

//     // 4. Find top-selling courses
//     // const mostSellingCourses = await Course.find()
//     //   .sort({ sold: -1 })
//     //   .limit(10);
//     const allCategories = await Category.find().populate("courses");
//     const allCourses = allCategories.flatMap((category) => category.courses);
//     const mostSellingCourses = allCourses
//       .sort((a, b) => b.sold - a.sold)
//       .slice(0, 10);

//     // 5. Return response
//     return res.status(200).json({
//       success: true,
//       selectedCourses,
//       differentCourses,
//       mostSellingCourses,
//     });

//   } catch (error) {
//     console.error("Error in categoryPageDetails:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };


exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

   // console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }
   // console.log("SELECTED COURSE")
    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
    // let differentCategory = await Category.findOne(
    //   categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
    //     ._id
    // )
    //   .populate({
    //     path: "courses",
    //     match: { status: "Published" },
    //   })
    //   .exec()
    const randomIndex = Math.floor(Math.random() * categoriesExceptSelected.length);
    const randomCategoryId = categoriesExceptSelected[randomIndex]._id;

    let differentCategory = await Category.findOne({ _id: randomCategoryId })
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

   // console.log("differentCategory : ",differentCategory);
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()


   // console.log("differentCategory: ", differentCategory)

    const allCourses = allCategories.flatMap((category) => category.courses)

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    // console.log("allCourses : ", allCourses);
    // console.log("mostSellingCourses: ", mostSellingCourses);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
