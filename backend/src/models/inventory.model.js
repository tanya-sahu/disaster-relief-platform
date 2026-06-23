import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["food", "water", "medical", "clothing", "rescue", "other"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      default: "items",
    },

    status: {
      type: String,
      enum: ["available", "low-stock", "out-of-stock"],
      default: "available",
    },

    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
