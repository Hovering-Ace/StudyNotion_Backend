// // 
// const express = require("express");
// const app = express();

// const userRoutes = require("./routes/User");
// const profileRoutes = require("./routes/Profile");
// const paymentRoutes = require("./routes/Payment");
// const courseRoutes = require("./routes/Course");
// const contactUsRoute = require("./routes/Contact");
// const database = require("./config/database");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const { cloudanaryConnect } = require("./config/cloudinary");
// const fileUpload = require("express-fileupload");
// require("dotenv").config();

// const port = process.env.PORT || 4000;

// database.connect();
// cloudanaryConnect();

// app.use(express.json());
// app.use(cookieParser()); // ✅ fixed
// app.use(
//   cors({
//     origin: "https://study-notion-frontend-ace.vercel.app",
//     credentials: true,
//   })
// );
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );

// // Route Mounting
// app.use("/api/v1/auth", userRoutes);
// app.use("/api/v1/profile", profileRoutes);
// app.use("/api/v1/course", courseRoutes);
// app.use("/api/v1/payment", paymentRoutes);
// app.use("/api/v1/reach", contactUsRoute);

// // Root Route
// app.get("/", (req, res) => {
//   return res.json({
//     success: true,
//     message: "Your server is up and running!",
//   });
// });

// // Server Start
// app.listen(port, () => {
//   console.log(`✅ Server is listening on port ${port}`);
// });


const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payment");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudanaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const port = process.env.PORT || 4000;

// Connect to DB & Cloudinary
database.connect();
cloudanaryConnect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://study-notion-frontend-ace.vercel.app",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Your server is up and running!",
  });
});

// Server Start
app.listen(port, () => {
  console.log(`✅ Server is listening on port ${port}`);
});
