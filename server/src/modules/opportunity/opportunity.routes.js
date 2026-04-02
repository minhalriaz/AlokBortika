import express from "express";
import upload from "../../middlewares/upload.middleware.js";
import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from "../../modules/opportunity/opportunity.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);

// Admin routes (controller handles auth check)
router.post("/", upload.single("image"), createOpportunity);
router.put("/:id", upload.single("image"), updateOpportunity);
router.delete("/:id", deleteOpportunity);

export default router;
