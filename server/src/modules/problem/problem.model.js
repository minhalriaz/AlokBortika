import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
    },
    organizationName: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "done"],
      default: "open",
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const problemModel =
  mongoose.models.problem || mongoose.model("problem", problemSchema);

export default problemModel;