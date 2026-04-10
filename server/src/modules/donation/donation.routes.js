import express from "express";
import {
  createDonation,
  getDonationStats,
  initSSLCommerzPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from "./donation.controller.js";

const donationRouter = express.Router();

donationRouter.post("/", createDonation);
donationRouter.post("/init-payment", initSSLCommerzPayment);
donationRouter.post("/success", paymentSuccess);
donationRouter.post("/fail", paymentFail);
donationRouter.post("/cancel", paymentCancel);
donationRouter.get("/stats", getDonationStats);

export default donationRouter;