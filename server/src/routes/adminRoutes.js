import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  getAllOrganizations,
  getOrganizationsAdmin,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationById,
  approveOrganization,
  getPendingOrganizations,
  updateOrganizationStatus,
  getUsersAdmin,
  getOrganizationOptions,
  updateUserAdmin,
  deleteUserAdmin,
} from "../modules/admin/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/public-organizations", getAllOrganizations);
adminRouter.get("/organizations", verifyToken, getOrganizationsAdmin);
adminRouter.post("/organizations-list", verifyToken, getOrganizationsAdmin);
adminRouter.get("/organizations/pending", verifyToken, getPendingOrganizations);
adminRouter.post("/organizations-pending", verifyToken, getPendingOrganizations);
adminRouter.post("/organizations", verifyToken, createOrganization);
adminRouter.post("/create-organization", verifyToken, createOrganization);
adminRouter.put("/organizations/:organizationId", verifyToken, updateOrganization);
adminRouter.put("/organization/:organizationId", verifyToken, updateOrganization);
adminRouter.patch("/organizations/:organizationId/status", verifyToken, updateOrganizationStatus);
adminRouter.patch("/organization/:organizationId/status", verifyToken, updateOrganizationStatus);
adminRouter.post("/organizations/:organizationId/approve", verifyToken, approveOrganization);
adminRouter.post("/organization/:organizationId/approve", verifyToken, approveOrganization);
adminRouter.delete("/organizations/:organizationId", verifyToken, deleteOrganization);
adminRouter.delete("/organization/:organizationId", verifyToken, deleteOrganization);
adminRouter.get("/organizations/:organizationId", verifyToken, getOrganizationById);
adminRouter.get("/organization/:organizationId", verifyToken, getOrganizationById);

adminRouter.get("/users", verifyToken, getUsersAdmin);
adminRouter.get("/user-options/organizations", verifyToken, getOrganizationOptions);
adminRouter.get("/organization-options", verifyToken, getOrganizationOptions);
adminRouter.patch("/users/:userId", verifyToken, updateUserAdmin);
adminRouter.delete("/users/:userId", verifyToken, deleteUserAdmin);

export default adminRouter;
