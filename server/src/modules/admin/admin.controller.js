import bcrypt from "bcryptjs";
import organizationModel from "../../models/Organization.js";
import userModel from "../../models/user.js";

const ADMIN_SAFE_USER_SELECT = "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt";
const getRequestUserId = (req) => req.userId || req.body?.userId || req.user?.id || null;
const ORGANIZATION_STATUSES = ["pending", "active", "inactive", "suspended", "deleted"];
const ORGANIZATION_MUTABLE_STATUSES = ["pending", "active", "inactive", "suspended"];
const ORGANIZATION_OPTION_STATUSES = ["active"];

const ensureAdmin = async (userId) => {
  if (!userId) return null;
  const user = await userModel.findById(userId);
  if (!user || user.role !== "admin") return null;
  return user;
};

const trimOrEmpty = (value) => (typeof value === "string" ? value.trim() : "");

const buildOrganizationPayload = (payload = {}, { includeStatus = true } = {}) => {
  const nextPayload = {
    name: trimOrEmpty(payload.name),
    type: trimOrEmpty(payload.type),
    focusArea: Array.isArray(payload.focusArea)
      ? payload.focusArea.map((item) => trimOrEmpty(item)).filter(Boolean)
      : [],
    location: {
      village: trimOrEmpty(payload.location?.village),
      union: trimOrEmpty(payload.location?.union),
      upazila: trimOrEmpty(payload.location?.upazila),
      district: trimOrEmpty(payload.location?.district),
    },
    contactPerson: trimOrEmpty(payload.contactPerson),
    phone: trimOrEmpty(payload.phone),
    email: trimOrEmpty(payload.email).toLowerCase(),
    description: trimOrEmpty(payload.description),
    services: Array.isArray(payload.services)
      ? payload.services.map((item) => trimOrEmpty(item)).filter(Boolean)
      : [],
  };

  if (includeStatus && payload.status) {
    nextPayload.status = trimOrEmpty(payload.status);
  }

  return nextPayload;
};

const ensureUniqueOrganizationFields = async ({ name, email, excludeId = null }) => {
  const duplicateQuery = { $or: [{ name }, { email }] };

  if (excludeId) {
    duplicateQuery._id = { $ne: excludeId };
  }

  const existingOrganization = await organizationModel.findOne(duplicateQuery).select("name email");
  if (!existingOrganization) return null;

  if (existingOrganization.name === name) {
    return "Organization name already exists.";
  }

  if (existingOrganization.email === email) {
    return "An organization with this email already exists.";
  }

  return "Organization already exists.";
};

const getOrganizationStatusMessage = (status) => {
  if (status === "active") return "Organization approved and activated.";
  if (status === "inactive") return "Organization deactivated successfully.";
  if (status === "suspended") return "Organization suspended successfully.";
  if (status === "pending") return "Organization moved back to pending review.";
  if (status === "deleted") return "Organization deleted successfully.";
  return "Organization status updated successfully.";
};
// Get all organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await organizationModel
      .find({ status: "active" })
      .select("-createdBy")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      organizations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all organizations (with detail for admin)
export const getOrganizationsAdmin = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const organizations = await organizationModel
      .find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const counts = {
      total: organizations.length,
      pending: organizations.filter((organization) => organization.status === "pending").length,
      active: organizations.filter((organization) => organization.status === "active").length,
      inactive: organizations.filter((organization) => organization.status === "inactive").length,
      suspended: organizations.filter((organization) => organization.status === "suspended").length,
      deleted: organizations.filter((organization) => organization.status === "deleted").length,
    };

    return res.json({
      success: true,
      organizations,
      counts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create organization (admin only)
export const createOrganization = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    const adminUser = await ensureAdmin(userId);
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    const organizationPayload = buildOrganizationPayload(req.body);
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
    } = organizationPayload;
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || !type || !contactPerson || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters.",
      });
    }

    if (status && !ORGANIZATION_MUTABLE_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid organization status." });
    }

    const duplicateMessage = await ensureUniqueOrganizationFields({ name, email });
    if (duplicateMessage) {
      return res.status(409).json({
        success: false,
        message: duplicateMessage,
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
      password: await bcrypt.hash(password, 10),
      description,
      services: services || [],
      status: status || "active",
      createdBy: userId,
      selfRegistered: false,
    });

    await organization.save();

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update organization (admin only)
export const updateOrganization = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;
    const existingOrganization = await organizationModel.findById(organizationId);

    if (!existingOrganization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    if (existingOrganization.status === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Deleted organizations cannot be edited.",
      });
    }

    const organizationPayload = buildOrganizationPayload(req.body);
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
    } = organizationPayload;
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || !type || !contactPerson || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (status && !ORGANIZATION_MUTABLE_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid organization status." });
    }

    const duplicateMessage = await ensureUniqueOrganizationFields({
      name,
      email,
      excludeId: organizationId,
    });
    if (duplicateMessage) {
      return res.status(409).json({
        success: false,
        message: duplicateMessage,
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

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
        status: status || existingOrganization.status,
        ...(password
          ? {
              password:
                password.length >= 6
                  ? await bcrypt.hash(password, 10)
                  : existingOrganization.password,
            }
          : {}),
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete organization (admin only)
export const deleteOrganization = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      { status: "deleted" },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    await userModel.updateMany(
      { organizationId: organization._id },
      { $set: { organizationId: null } }
    );

    return res.json({
      success: true,
      message: getOrganizationStatusMessage("deleted"),
      organization,
    });
  } catch (error) {
    return res.status(500).json({
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
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    return res.json({
      success: true,
      organization,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve organization (admin only)
export const approveOrganization = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;
    const existingOrganization = await organizationModel.findById(organizationId);

    if (!existingOrganization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (existingOrganization.status === "deleted") {
      return res.status(400).json({ success: false, message: "Deleted organizations cannot be approved." });
    }

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      { status: "active" },
      { new: true }
    );

    return res.json({
      success: true,
      message: getOrganizationStatusMessage("active"),
      organization,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrganizationStatus = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;
    const status = trimOrEmpty(req.body?.status);

    if (!ORGANIZATION_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid organization status." });
    }

    const existingOrganization = await organizationModel.findById(organizationId);
    if (!existingOrganization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (existingOrganization.status === "deleted") {
      return res.status(400).json({ success: false, message: "Deleted organizations cannot be updated." });
    }

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      { status },
      { new: true }
    );

    if (status === "deleted") {
      await userModel.updateMany(
        { organizationId: organization._id },
        { $set: { organizationId: null } }
      );
    }

    return res.json({
      success: true,
      message: getOrganizationStatusMessage(status),
      organization,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending organizations (admin only)
export const getPendingOrganizations = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    const organizations = await organizationModel
      .find({ status: "pending" })
      .sort({ createdAt: -1 });

    return res.json({ success: true, organizations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Get all users (admin only)
export const getUsersAdmin = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { role = "all", status = "all", search = "" } = req.query;
    const query = {};

    if (role !== "all") query.role = role;
    if (status !== "all") query.status = status;

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const users = await userModel
      .find(query)
      .select(ADMIN_SAFE_USER_SELECT)
      .populate("organizationId", "name type status")
      .sort({ createdAt: -1 });

    const counts = {
      total: await userModel.countDocuments(),
      admins: await userModel.countDocuments({ role: "admin" }),
      volunteers: await userModel.countDocuments({ role: "volunteer" }),
      active: await userModel.countDocuments({ status: "active" }),
      suspended: await userModel.countDocuments({ status: "suspended" }),
    };

    return res.json({ success: true, users, counts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get organizations to assign to users (admin only)
export const getOrganizationOptions = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const organizations = await organizationModel
      .find({ status: { $in: ORGANIZATION_OPTION_STATUSES } })
      .select("name type status")
      .sort({ name: 1 });

    return res.json({ success: true, organizations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role/status/organization (admin only)
export const updateUserAdmin = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { userId } = req.params;
    const { role, status, organizationId, clearOrganization } = req.body;

    const targetUser = await userModel.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(targetUser._id) === String(adminUser._id) && role && role !== "admin") {
      return res.status(400).json({ success: false, message: "You cannot remove your own admin role." });
    }

    if (role) {
      if (!["admin", "volunteer"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
      targetUser.role = role;
    }

    if (status) {
      if (!["active", "inactive", "suspended"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
      }
      targetUser.status = status;
    }

    if (clearOrganization) {
      targetUser.organizationId = null;
    } else if (organizationId) {
      const organization = await organizationModel.findOne({
        _id: organizationId,
        status: { $in: ORGANIZATION_OPTION_STATUSES },
      });
      if (!organization) {
        return res.status(404).json({ success: false, message: "Active organization not found" });
      }
      targetUser.organizationId = organization._id;
    }

    await targetUser.save();

    const updatedUser = await userModel
      .findById(targetUser._id)
      .select(ADMIN_SAFE_USER_SELECT)
      .populate("organizationId", "name type status");

    return res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (admin only)
export const deleteUserAdmin = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(getRequestUserId(req));
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { userId } = req.params;

    if (String(userId) === String(adminUser._id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    }

    const deletedUser = await userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
