import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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
import { co2 } from "@tgwf/co2";


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
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

const co2Emission = new co2({ model: "swd" });

app.use((req, res, next) => {
  console.log("Request hit:", req.method, req.originalUrl);

  let requestBytes = 0;
  let responseBytes = 0;

  try {
    if (req.body && Object.keys(req.body).length > 0) {
      requestBytes += Buffer.byteLength(JSON.stringify(req.body), "utf8");
    }
  } catch (err) {
    console.log("Could not measure request body");
  }

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  res.write = (chunk, ...args) => {
    if (chunk) {
      responseBytes += Buffer.byteLength(
        Buffer.isBuffer(chunk) ? chunk : String(chunk)
      );
    }
    return originalWrite(chunk, ...args);
  };

  res.end = (chunk, ...args) => {
    if (chunk) {
      responseBytes += Buffer.byteLength(
        Buffer.isBuffer(chunk) ? chunk : String(chunk)
      );
    }

    const totalBytes = requestBytes + responseBytes;
    const emissions = co2Emission.perByte(totalBytes, false);

    console.log("Data:", totalBytes, "bytes");
    console.log("CO2:", emissions.toFixed(6), "g");

    return originalEnd(chunk, ...args);
  };

  next();
});

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