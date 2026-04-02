import express from "express";
import {
  getAllOrganizations,
  getOrganizationsAdmin,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationById,
} from "../modules/admin/admin.controller.js";

const adminRouter = express.Router();

// Public - Get all active organizations
adminRouter.get("/organizations", getAllOrganizations);

// Admin only - Get all organizations with details
adminRouter.post("/organizations-list", getOrganizationsAdmin);

// Admin only - Create organization
adminRouter.post("/create-organization", createOrganization);

// Admin only - Update organization
adminRouter.put("/organization/:organizationId", updateOrganization);

// Admin only - Delete organization (mark as inactive)
adminRouter.delete("/organization/:organizationId", deleteOrganization);

// Get organization by ID
adminRouter.get("/organization/:organizationId", getOrganizationById);

export default adminRouter;
