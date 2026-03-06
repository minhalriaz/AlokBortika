import express from "express";
import { createDonation, getDonationStats } from "./donation.controller.js";

const donationRouter = express.Router();

donationRouter.post("/", createDonation);
donationRouter.get("/stats", getDonationStats);

export default donationRouter;
