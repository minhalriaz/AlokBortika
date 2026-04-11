import express from "express";
import problemModel from "./problem.model.js";
import organizationModel from "../../models/Organization.js";
import userModel from "../../models/user.js";
import verifyToken from "../../middlewares/verifyToken.js";

const problemRouter = express.Router();

const ensureAdmin = async (userId) => {
  if (!userId) return null;

  const user = await userModel.findById(userId);
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase();

  if (
    !user ||
    user.role !== "admin" ||
    user.email?.toLowerCase() !== ADMIN_EMAIL
  ) {
    return null;
  }

  return user;
};

// Create a new problem
problemRouter.post("/create", async (req, res) => {
  try {
    const { title, description, category, location, organizationId } = req.body;

    if (!title || !description || !organizationId) {
      return res.json({
        success: false,
        message: "Title, description, and organization are required",
      });
    }

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({
        success: false,
        message: "Invalid organization selected",
      });
    }

    const problem = await problemModel.create({
      title,
      description,
      category: category || "General",
      location: location || "",
      organizationId: organizationId,
      organizationName: organization.name,
    });

    res.json({
      success: true,
      message: "Problem submitted successfully",
      problem,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// Get all organizations for dropdown
problemRouter.get("/organizations", async (req, res) => {
  try {
    const organizations = await organizationModel
      .find({ status: "active" })
      .select("_id name type");

    res.json({
      success: true,
      organizations,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// Get all problems
problemRouter.get("/all", verifyToken, async (req, res) => {
  try {
    const adminUser = await ensureAdmin(req.userId);

    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const problems = await problemModel
      .find()
      .sort({ createdAt: -1 })
      .populate("organizationId", "name type");

    res.json({
      success: true,
      problems,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// Update problem status (admin only)
problemRouter.put("/update-status/:problemId", verifyToken, async (req, res) => {
  try {
    const adminUser = await ensureAdmin(req.userId);

    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    const { problemId } = req.params;
    const { status } = req.body;

    if (!["open", "in-progress", "done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const problem = await problemModel.findByIdAndUpdate(
      problemId,
      { status },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.json({
      success: true,
      message: "Problem status updated successfully",
      problem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default problemRouter;