import userModel from "../../models/user.js";
import problemModel from "../problem/problem.model.js";
import cloudinary from "../../config/cloudinary.js";

export const getVolunteerDashboard = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    const availableProblems = await problemModel
      .find({ status: "open" })
      .sort({ createdAt: -1 });

    const assignedProblems = await problemModel
      .find({ assignedVolunteer: user._id, status: "in-progress" })
      .sort({ createdAt: -1 });

    const completedCount = user.completedTasks.length;
    const inProgressCount = assignedProblems.length;
    const availableCount = availableProblems.length;

    const categoryMap = {};

    [...availableProblems, ...assignedProblems].forEach((problem) => {
      const key = problem.category || "General";
      categoryMap[key] = (categoryMap[key] || 0) + 1;
    });

    const chartData = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));

    return res.json({
      success: true,
      dashboard: {
        volunteer: user,
        stats: {
          completedCount,
          inProgressCount,
          availableCount,
          impactScore: completedCount * 10,
        },
        charts: {
          categoryData: chartData,
          progressData: [
            { name: "Completed", value: completedCount },
            { name: "In Progress", value: inProgressCount },
            { name: "Available", value: availableCount },
          ],
        },
        availableProblems,
        assignedProblems,
        completedTasks: user.completedTasks,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getVolunteerProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const updateVolunteerProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;

    const updateData = {
      name,
      bio,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string" && skills.trim() !== ""
        ? skills.split(",").map((item) => item.trim())
        : [],
    };

    const user = await userModel
      .findByIdAndUpdate(req.body.userId, updateData, { new: true })
      .select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No image uploaded" });
    }

    console.log("Uploading to cloudinary...");

    const result = await cloudinary.uploader.upload(req.file.path);

    console.log("Cloudinary result:", result.secure_url);

    const user = await userModel.findByIdAndUpdate(
      req.body.userId,
      { profilePicture: result.secure_url },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return res.json({ success: false, message: error.message });
  }
};
export const assignProblemToVolunteer = async (req, res) => {
  try {
    const { problemId } = req.params;

    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.json({ success: false, message: "Problem not found" });
    }

    if (problem.status !== "open") {
      return res.json({ success: false, message: "Problem already assigned" });
    }

    problem.assignedVolunteer = user._id;
    problem.status = "in-progress";
    await problem.save();

    return res.json({
      success: true,
      message: "Problem assigned successfully",
      problem,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const markProblemDone = async (req, res) => {
  try {
    const { problemId } = req.params;

    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.json({ success: false, message: "Problem not found" });
    }

    if (!problem.assignedVolunteer) {
      return res.json({
        success: false,
        message: "Problem is not assigned yet",
      });
    }

    if (String(problem.assignedVolunteer) !== String(user._id)) {
      return res.json({
        success: false,
        message: "You are not assigned to this problem",
      });
    }

    problem.status = "done";
    await problem.save();

    user.completedTasks.push({
      problemId: problem._id,
      title: problem.title,
      organizationName: problem.organizationName,
      category: problem.category,
      status: "done",
      completedAt: new Date(),
    });

    await user.save();

    return res.json({
      success: true,
      message: "Problem marked as done",
      problem,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};