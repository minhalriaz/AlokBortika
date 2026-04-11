import express from "express";
import {
  createDonation,
  createStripeCheckoutSession,
  getDonationStats,
  verifyStripeCheckoutSession,
} from "./donation.controller.js";

const donationRouter = express.Router();

donationRouter.post("/", createDonation);
donationRouter.post("/checkout-session", createStripeCheckoutSession);
donationRouter.post("/verify-session", verifyStripeCheckoutSession);
donationRouter.get("/stats", getDonationStats);

export default donationRouter;
