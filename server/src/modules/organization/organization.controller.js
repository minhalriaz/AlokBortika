import userModel from "../../models/user.js";
import problemModel from "../problem/problem.model.js";

export const getOrganizationDashboard = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");

    if (!user || user.role !== "organization") {
      return res.json({ success: false, message: "Organization not found" });
    }

    const problems = await problemModel
      .find()
      .sort({ createdAt: -1 })
      .populate("assignedVolunteer", "name email role");

    const volunteers = await userModel
      .find({ role: "volunteer" })
      .select("name email role");

    const open = problems.filter((p) => p.status === "open");
    const inProgress = problems.filter((p) => p.status === "in-progress");
    const done = problems.filter((p) => p.status === "done");

    return res.json({
      success: true,
      dashboard: {
        organization: user,
        stats: {
          total: problems.length,
          open: open.length,
          inProgress: inProgress.length,
          done: done.length,
        },
        problems,
        volunteers,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const assignVolunteerToProblem = async (req, res) => {
  try {
    const { userId, volunteerId } = req.body;
    const { problemId } = req.params;

    const organization = await userModel.findById(userId);
    if (!organization || organization.role !== "organization") {
      return res.json({ success: false, message: "Organization not found" });
    }

    const volunteer = await userModel.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.json({ success: false, message: "Problem not found" });
    }

    problem.assignedVolunteer = volunteer._id;
    problem.organizationId = organization._id;
    problem.organizationName = organization.name;
    problem.status = "in-progress";

    await problem.save();

    return res.json({
      success: true,
      message: "Volunteer assigned successfully",
      problem,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};