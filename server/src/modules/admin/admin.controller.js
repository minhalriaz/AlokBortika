import organizationModel from "../../models/Organization.js";
import userModel from "../../models/user.js";

const ADMIN_SAFE_USER_SELECT = "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt";

const ensureAdmin = async (userId) => {
  if (!userId) return null;
  const user = await userModel.findById(userId);
  if (!user || user.role !== "admin") return null;
  return user;
};
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

// Approve organization (admin only)
export const approveOrganization = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized - Admin only" });
    }

    const { organizationId } = req.params;

    const organization = await organizationModel.findByIdAndUpdate(
      organizationId,
      { status: "active" },
      { new: true }
    );

    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    res.json({
      success: true,
      message: "Organization approved and activated",
      organization,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get pending organizations (admin only)
export const getPendingOrganizations = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized - Admin only" });
    }

    const organizations = await organizationModel
      .find({ status: "pending" })
      .sort({ createdAt: -1 });

    res.json({ success: true, organizations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Get all users (admin only)
export const getUsersAdmin = async (req, res) => {
  try {
    const adminUser = await ensureAdmin(req.body.userId);
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
    const adminUser = await ensureAdmin(req.body.userId);
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const organizations = await organizationModel
      .find({ status: { $in: ["active", "pending"] } })
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
    const adminUser = await ensureAdmin(req.body.userId);
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
      const organization = await organizationModel.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ success: false, message: "Organization not found" });
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
    const adminUser = await ensureAdmin(req.body.userId);
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
