import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["CBO", "NGO", "CSO", "Local Organization", "Government", "Municipal", "Disaster Committee", "Clinic", "Legal Aid"],
      required: true,
    },
    focusArea: {
      type: [String],
      default: [],
      description: "Areas of focus (e.g., sanitation, education, health)",
    },
    location: {
      village: String,
      union: String,
      upazila: String,
      district: String,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    services: {
      type: [String],
      default: [],
      description: "Services or projects they handle",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      description: "Admin who created this organization",
    },
  },
  { timestamps: true }
);

const organizationModel =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default organizationModel;
