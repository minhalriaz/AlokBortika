import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  getVolunteerDashboard,
  getVolunteerProfile,
  updateVolunteerProfile,
  uploadProfilePicture,
  assignProblemToVolunteer,
  markProblemDone,
} from "../modules/volunteer/volunteer.controller.js";

const router = express.Router();

router.post("/dashboard", getVolunteerDashboard);
router.post("/profile", getVolunteerProfile);
router.put("/profile", updateVolunteerProfile);

router.post(
  "/profile-picture",
  upload.single("image"),   // 🔥 required for file upload
  uploadProfilePicture
);

router.post("/assign/:problemId", assignProblemToVolunteer);
router.post("/done/:problemId", markProblemDone);

export default router;