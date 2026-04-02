import express from "express";
import problemModel from "./problem.model.js";
import organizationModel from "../../models/Organization.js";

const problemRouter = express.Router();

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

    // Verify organization exists
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
problemRouter.get("/all", async (req, res) => {
  try {
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

export default problemRouter;