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
      unique: true,
    },
    password: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    services: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    establishedYear: {
      type: Number,
      default: null,
    },
    registrationNumber: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended", "deleted"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    selfRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const organizationModel =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default organizationModel;
