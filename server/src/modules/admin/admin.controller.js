import organizationModel from "../../models/Organization.js";
import userModel from "../../models/user.js";

// Get all organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await organizationModel
      .find({ status: "active" })
      .select("-createdBy")
      .sort({ createdAt: -1 });

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
};

// Get all organizations (with detail for admin)
export const getOrganizationsAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const organizations = await organizationModel
      .find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

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
};

// Create organization (admin only)
export const createOrganization = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized - Admin only" });
    }

    const {
      name,
      type,
      focusArea,
      location,
      contactPerson,
      phone,
      email,
      description,
      services,
    } = req.body;

    if (!name || !type || !contactPerson || !phone || !email) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existingOrg = await organizationModel.findOne({ name });
    if (existingOrg) {
      return res.json({
        success: false,
        message: "Organization already exists",
      });
    }

    const organization = new organizationModel({
      name,
      type,
      focusArea: focusArea || [],
      location: location || {},
      contactPerson,
      phone,
      email,
      description,
      services: services || [],
      createdBy: userId,
    });

    await organization.save();

    res.json({
      success: true,
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Update organization (admin only)
export const updateOrganization = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;
    const {
      name,
      type,
      focusArea,
      location,
      contactPerson,
      phone,
      email,
      description,
      services,
      status,
    } = req.body;

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      {
        name,
        type,
        focusArea,
        location,
        contactPerson,
        phone,
        email,
        description,
        services,
        status,
      },
      { new: true }
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Delete organization (admin only)
export const deleteOrganization = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      { status: "inactive" },
      { new: true }
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await organizationModel.findById(organizationId);

    if (!organization) {
      return res.json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      organization,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
