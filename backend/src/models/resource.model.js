import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["food", "water", "medical", "clothing", "rescue" , "other"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["items", "packets", "bottles", "kg", "liters", "boxes"],
      default: "items",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      // volunteer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    disaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disaster",
    },
  },
  { timestamps: true },
);

export const Resource = mongoose.model("Resource", resourceSchema);
