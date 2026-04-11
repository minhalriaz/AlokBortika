import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, required: true, trim: true, lowercase: true },
    donorPhone: { type: String, default: "", trim: true },
    campaignId: { type: String, default: "", trim: true },
    campaignTitle: { type: String, default: "", trim: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "BDT", trim: true, uppercase: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Card", "bKash", "Nagad", "Rocket", "Bank Transfer", "Cash"],
    },
    paymentGateway: { type: String, default: "Manual", trim: true },
    transactionId: { type: String, default: "", trim: true },
    stripeSessionId: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    isAnonymous: { type: Boolean, default: false },
    status: {
      type: String,
      default: "Pending Verification",
      enum: ["Pending Verification", "Received"],
    },
    donatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const donationModel =
  mongoose.models.donation || mongoose.model("donation", donationSchema);

export default donationModel;
