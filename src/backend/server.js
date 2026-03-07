const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("DB name from mongoose:", mongoose.connection?.name);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log("DB name:", mongoose.connection.name);
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });