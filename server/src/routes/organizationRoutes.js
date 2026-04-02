import express from "express";
import {
  getOrganizationDashboard,
  assignVolunteerToProblem,
  addVolunteerToOrganization,
  getAvailableVolunteers,
} from "../modules/organization/organization.controller.js";

const router = express.Router();

router.post("/dashboard", getOrganizationDashboard);
router.post("/assign/:problemId", assignVolunteerToProblem);
router.post("/add-volunteer", addVolunteerToOrganization);
router.post("/available-volunteers", getAvailableVolunteers);

export default router;