
import dns from "node:dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/authRoutes.js";
import volunteerRoutes from "./src/routes/volunteerRoutes.js";
import organizationRoutes from "./src/routes/organizationRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import problemRouter from "./src/modules/problem/problem.routes.js";
import opportunityRouter from "./src/modules/opportunity/opportunity.routes.js";
import donationRouter from "./src/modules/donation/donation.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/problem", problemRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/donations", donationRouter);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

if (!process.env.MONGO_URI) {
  console.warn("MongoDB URI is missing. Running without database connection.");
} else {
  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error(
        "MongoDB connection error. Running in limited mode:",
        err.message
      );
    });
}
