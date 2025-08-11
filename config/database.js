const { error } = require("console");
const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ DB connected"))
    .catch((err) => {
      console.error("❌ DB connection error:", err);
      process.exit(1);
    });
};