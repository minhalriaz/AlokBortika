import express from "express";
import upload from "../middlewares/upload.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";
import {
  getVolunteerDashboard,
  getVolunteerProfile,
  updateVolunteerProfile,
  uploadProfilePicture,
  assignProblemToVolunteer,
  markProblemDone,
} from "../modules/volunteer/volunteer.controller.js";

const router = express.Router();

router.post("/dashboard", verifyToken, getVolunteerDashboard);
router.post("/profile", verifyToken, getVolunteerProfile);
router.put("/profile", verifyToken, updateVolunteerProfile);
router.post("/profile-picture", verifyToken, upload.single("image"), uploadProfilePicture);
router.post("/assign/:problemId", verifyToken, assignProblemToVolunteer);
router.post("/done/:problemId", verifyToken, markProblemDone);

export default router;
