import userModel from "../../models/user.js";
import organizationModel from "../../models/Organization.js";
import problemModel from "../problem/problem.model.js";

export const getOrganizationDashboard = async (req, res) => {
  try {
    const { userId, organizationId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    // Get problems for this specific organization
    const problems = await problemModel
      .find({ organizationId: organizationId })
      .sort({ createdAt: -1 })
      .populate("assignedVolunteer", "name email role");

    // Get only volunteers for this organization
    const volunteers = await userModel
      .find({ role: "volunteer", organizationId: organizationId })
      .select("name email role skills");

    const open = problems.filter((p) => p.status === "open");
    const inProgress = problems.filter((p) => p.status === "in-progress");
    const done = problems.filter((p) => p.status === "done");

    return res.json({
      success: true,
      dashboard: {
        organization,
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

export const getAvailableVolunteers = async (req, res) => {
  try {
    const { organizationId } = req.body;

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    // Get all volunteers that are not yet assigned to any organization
    const availableVolunteers = await userModel
      .find({ role: "volunteer", organizationId: null })
      .select("_id name email skills");

    // Get volunteers already in this organization
    const assignedVolunteers = await userModel
      .find({ role: "volunteer", organizationId: organizationId })
      .select("_id name email skills");

    return res.json({
      success: true,
      availableVolunteers,
      assignedVolunteers,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const addVolunteerToOrganization = async (req, res) => {
  try {
    const { organizationId, volunteerId } = req.body;

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    const volunteer = await userModel.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    // Update volunteer with organization
    volunteer.organizationId = organizationId;
    await volunteer.save();

    return res.json({
      success: true,
      message: "Volunteer added to organization successfully",
      volunteer,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const assignVolunteerToProblem = async (req, res) => {
  try {
    const { userId, volunteerId, organizationId } = req.body;
    const { problemId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const volunteer = await userModel.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.json({ success: false, message: "Problem not found" });
    }

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    problem.assignedVolunteer = volunteer._id;
    problem.organizationId = organizationId;
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