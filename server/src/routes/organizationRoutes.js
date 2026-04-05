import express from "express";
import orgAuth from "../modules/organization/organization.auth.middleware.js";
import {
  registerOrganization,
  loginOrganization,
  logoutOrganization,
  getCurrentOrganization,
  isOrgAuthenticated,
} from "../modules/organization/organization.auth.controller.js";
import {
  getOrganizationDashboard,
  assignVolunteerToProblem,
  unassignVolunteerFromProblem,
  addVolunteerToOrganization,
  removeVolunteerFromOrganization,
  getAvailableVolunteers,
  markProblemDone,
  updateOrganizationProfile,
  getOrganizationProblems,
  createProblemForOrganization,
} from "../modules/organization/organization.controller.js";

const router = express.Router();

// ===== PUBLIC AUTH ROUTES =====
router.post("/register", registerOrganization);
router.post("/login", loginOrganization);
router.post("/logout", logoutOrganization);

// ===== PROTECTED ROUTES (require org token) =====
router.get("/is-auth", orgAuth, isOrgAuthenticated);
router.get("/me", orgAuth, getCurrentOrganization);

// Dashboard
router.get("/dashboard", orgAuth, getOrganizationDashboard);

// Problems
router.get("/problems", orgAuth, getOrganizationProblems);
router.post("/problems/create", orgAuth, createProblemForOrganization);
router.post("/assign/:problemId", orgAuth, assignVolunteerToProblem);
router.post("/unassign/:problemId", orgAuth, unassignVolunteerFromProblem);
router.post("/problems/:problemId/done", orgAuth, markProblemDone);

// Volunteers
router.get("/available-volunteers", orgAuth, getAvailableVolunteers);
router.post("/add-volunteer", orgAuth, addVolunteerToOrganization);
router.post("/remove-volunteer", orgAuth, removeVolunteerFromOrganization);

// Profile
router.put("/profile", orgAuth, updateOrganizationProfile);

export default router;
