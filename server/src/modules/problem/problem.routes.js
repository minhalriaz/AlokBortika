import express from "express";
import problemModel from "./problem.model.js";

const problemRouter = express.Router();

// Create a new problem
problemRouter.post("/create", async (req, res) => {
  try {
    const { title, description, category, location, organizationName } = req.body;

    if (!title || !description) {
      return res.json({
        success: false,
        message: "Title and description are required",
      });
    }

    const problem = await problemModel.create({
      title,
      description,
      category: category || "General",
      location: location || "",
      organizationName: organizationName || "",
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

// Get all problems
problemRouter.get("/all", async (req, res) => {
  try {
    const problems = await problemModel.find().sort({ createdAt: -1 });

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