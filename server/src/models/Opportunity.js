import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
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
      enum: [
        "Education",
        "Healthcare",
        "Environment",
        "Food Relief",
        "Elderly Care",
        "Animal Rescue",
        "Community",
        "Disaster Relief",
        "Tech",
        "Other",
      ],
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    spots: {
      type: Number,
      required: true,
      min: 1,
    },
    themeColor: {
      type: String,
      default: "#266d5e",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Opportunity", opportunitySchema);
