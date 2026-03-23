import express from "express";
import {
  getOrganizationDashboard,
  assignVolunteerToProblem,
} from "../modules/organization/organization.controller.js";

const router = express.Router();

router.post("/dashboard", getOrganizationDashboard);
router.post("/assign/:problemId", assignVolunteerToProblem);

export default router;