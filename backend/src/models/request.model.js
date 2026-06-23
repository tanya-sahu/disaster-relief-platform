import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    disaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disaster",
    },

    requestType: {
      type: [String],
      enum: ["food", "water", "medical", "shelter", "rescue , other"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "in-progress", "resolved"],
      default: "pending",
    },

    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    assignedShelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true },
);

export const Request = mongoose.model("Request", requestSchema);
