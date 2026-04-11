import jwt from "jsonwebtoken";
import organizationModel from "../../models/Organization.js";

const getOrganizationStatusMessage = (status) => {
  if (status === "pending") {
    return "Your organization is awaiting admin approval.";
  }

  if (status === "inactive") {
    return "Your organization account is deactivated.";
  }

  if (status === "suspended") {
    return "Your organization account has been suspended.";
  }

  if (status === "deleted") {
    return "This organization account has been removed.";
  }

  return "Your organization account is not active.";
};

const orgAuth = async (req, res, next) => {
  const authHeader =
    req.headers["org-authorization"] ||
    req.headers.authorization ||
    req.headers.Authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const token = req.cookies.orgToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please login as organization.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || decoded.type !== "organization") {
      return res.status(401).json({
        success: false,
        message: "Invalid organization token.",
      });
    }

    const organization = await organizationModel
      .findById(decoded.id)
      .select("_id status");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    if (organization.status !== "active") {
      return res.status(403).json({
        success: false,
        message: getOrganizationStatusMessage(organization.status),
      });
    }

    req.organizationId = String(organization._id);
    req.organization = organization;
    req.body = { ...(req.body || {}), organizationId: String(organization._id) };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid.",
    });
  }
};

export default orgAuth;
