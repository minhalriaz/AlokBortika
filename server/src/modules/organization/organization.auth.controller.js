import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import organizationModel from "../../models/Organization.js";

// ========== ORGANIZATION REGISTER ==========
export const registerOrganization = async (req, res) => {
  try {
    const {
      name,
      type,
      focusArea,
      location,
      contactPerson,
      phone,
      email,
      password,
      description,
      services,
    } = req.body;

    if (!name || !type || !contactPerson || !phone || !email || !password) {
      return res.json({
        success: false,
        message: "Missing required fields: name, type, contactPerson, phone, email, password",
      });
    }

    // Check if organization already exists with this email
    const existingOrg = await organizationModel.findOne({ email });
    if (existingOrg) {
      return res.json({
        success: false,
        message: "An organization with this email already exists",
      });
    }

    // Check if organization name is taken
    const existingName = await organizationModel.findOne({ name });
    if (existingName) {
      return res.json({
        success: false,
        message: "Organization name already taken. Please choose a different name.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = new organizationModel({
      name,
      type,
      focusArea: focusArea || [],
      location: location || {},
      contactPerson,
      phone,
      email,
      password: hashedPassword,
      description: description || "",
      services: services || [],
      status: "pending", // new orgs start as pending until admin approves
    });

    await organization.save();

    const token = jwt.sign(
      { id: organization._id, type: "organization" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("orgToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Organization registered successfully. Awaiting admin approval.",
      token,
      organization: {
        id: organization._id,
        name: organization.name,
        type: organization.type,
        email: organization.email,
        contactPerson: organization.contactPerson,
        phone: organization.phone,
        status: organization.status,
        focusArea: organization.focusArea,
        location: organization.location,
        description: organization.description,
        services: organization.services,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== ORGANIZATION LOGIN ==========
export const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const organization = await organizationModel.findOne({ email });
    if (!organization) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If no password set (old orgs created by admin), let them set one
    if (!organization.password) {
      return res.json({
        success: false,
        message: "No password set. Please contact admin to set your password.",
      });
    }

    const isMatch = await bcrypt.compare(password, organization.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: organization._id, type: "organization" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("orgToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      organization: {
        id: organization._id,
        name: organization.name,
        type: organization.type,
        email: organization.email,
        contactPerson: organization.contactPerson,
        phone: organization.phone,
        status: organization.status,
        focusArea: organization.focusArea,
        location: organization.location,
        description: organization.description,
        services: organization.services,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== ORGANIZATION LOGOUT ==========
export const logoutOrganization = (req, res) => {
  res.cookie("orgToken", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out successfully" });
};

// ========== GET CURRENT ORGANIZATION ==========
export const getCurrentOrganization = async (req, res) => {
  try {
    const organization = await organizationModel
      .findById(req.organizationId)
      .select("-password");

    if (!organization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    return res.json({ success: true, organization });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ========== CHECK AUTH ==========
export const isOrgAuthenticated = async (req, res) => {
  return res.json({ success: true });
};
