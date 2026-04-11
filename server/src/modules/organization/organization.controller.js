import userModel from "../../models/user.js";
import organizationModel from "../../models/Organization.js";
import problemModel from "../problem/problem.model.js";

const getRequestOrganizationId = (req) =>
  req.organizationId || req.body?.organizationId || null;

// ========== GET ORGANIZATION DASHBOARD ==========
export const getOrganizationDashboard = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);

    const organization = await organizationModel
      .findById(organizationId)
      .select("-password");
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    const problems = await problemModel
      .find({ organizationId: organizationId })
      .sort({ createdAt: -1 })
      .populate("assignedVolunteer", "name email role skills profilePicture")
      .populate("submittedBy", "name email");

    const volunteers = await userModel
      .find({ role: "volunteer", organizationId: organizationId })
      .select("name email role skills profilePicture bio");

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
          volunteers: volunteers.length,
        },
        problems,
        volunteers,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== GET AVAILABLE VOLUNTEERS ==========
export const getAvailableVolunteers = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    const availableVolunteers = await userModel
      .find({ role: "volunteer", organizationId: null })
      .select("_id name email skills profilePicture bio");

    const assignedVolunteers = await userModel
      .find({ role: "volunteer", organizationId: organizationId })
      .select("_id name email skills profilePicture bio");

    return res.json({
      success: true,
      availableVolunteers,
      assignedVolunteers,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== ADD VOLUNTEER TO ORGANIZATION ==========
export const addVolunteerToOrganization = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { volunteerId } = req.body;

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    const volunteer = await userModel.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    volunteer.organizationId = organizationId;
    await volunteer.save();

    return res.json({
      success: true,
      message: "Volunteer added to organization successfully",
      volunteer: {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        skills: volunteer.skills,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== REMOVE VOLUNTEER FROM ORGANIZATION ==========
export const removeVolunteerFromOrganization = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { volunteerId } = req.body;

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    const volunteer = await userModel.findById(volunteerId);
    if (!volunteer) {
      return res.json({ success: false, message: "Volunteer not found" });
    }

    if (String(volunteer.organizationId) !== String(organizationId)) {
      return res.json({
        success: false,
        message: "Volunteer does not belong to this organization",
      });
    }

    volunteer.organizationId = null;
    await volunteer.save();

    return res.json({
      success: true,
      message: "Volunteer removed from organization",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== ASSIGN VOLUNTEER TO PROBLEM ==========
export const assignVolunteerToProblem = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { volunteerId } = req.body;
    const { problemId } = req.params;

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

    if (String(problem.organizationId) !== String(organizationId)) {
      return res.json({
        success: false,
        message: "You can only assign volunteers to your own organization's problems",
      });
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

// ========== UNASSIGN VOLUNTEER FROM PROBLEM ==========
export const unassignVolunteerFromProblem = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { problemId } = req.params;

    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.json({ success: false, message: "Problem not found" });
    }

    if (String(problem.organizationId) !== String(organizationId)) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    problem.assignedVolunteer = null;
    problem.status = "open";
    await problem.save();

    return res.json({
      success: true,
      message: "Volunteer unassigned. Problem reopened.",
      problem,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== MARK PROBLEM AS DONE ==========
export const markProblemDone = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { problemId } = req.params;

    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.json({ success: false, message: "Problem not found" });
    }

    if (String(problem.organizationId) !== String(organizationId)) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    problem.status = "done";
    await problem.save();

    // If there's an assigned volunteer, add to their completed tasks
    if (problem.assignedVolunteer) {
      await userModel.findByIdAndUpdate(problem.assignedVolunteer, {
        $push: {
          completedTasks: {
            problemId: problem._id,
            title: problem.title,
            organizationName: problem.organizationName,
            category: problem.category,
            status: "done",
            completedAt: new Date(),
          },
        },
      });
    }

    return res.json({
      success: true,
      message: "Problem marked as done",
      problem,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== UPDATE ORGANIZATION PROFILE ==========
export const updateOrganizationProfile = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const {
      description,
      services,
      focusArea,
      website,
      establishedYear,
      registrationNumber,
      contactPerson,
      phone,
    } = req.body;

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      {
        description,
        services,
        focusArea,
        website,
        establishedYear,
        registrationNumber,
        contactPerson,
        phone,
      },
      { new: true }
    ).select("-password");

    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      organization,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== GET ORGANIZATION PROBLEMS (with filters) ==========
export const getOrganizationProblems = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { status, category } = req.query;

    const filter = { organizationId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const problems = await problemModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("assignedVolunteer", "name email profilePicture skills")
      .populate("submittedBy", "name email");

    return res.json({ success: true, problems });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== CREATE PROBLEM FOR ORGANIZATION ==========
export const createProblemForOrganization = async (req, res) => {
  try {
    const organizationId = getRequestOrganizationId(req);
    const { title, description, category, location } = req.body;

    if (!title || !description) {
      return res.json({
        success: false,
        message: "Title and description are required",
      });
    }

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    const problem = await problemModel.create({
      title,
      description,
      category: category || "General",
      location: location || "",
      organizationId,
      organizationName: organization.name,
    });

    return res.json({
      success: true,
      message: "Problem created successfully",
      problem,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
