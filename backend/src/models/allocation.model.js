import mongoose, { Schema } from "mongoose";

const allocationSchema = new Schema(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: "Request", 
      required: true,
    },
    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Inventory", 
      required: true,
    },
    quantityAssigned: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    allocatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    status: {
      type: String,
      enum: ["Allocated", "Dispatched", "Delivered", "Cancelled"],
      default: "Allocated",
    },
  },
  { timestamps: true }
);

export const Allocation = mongoose.model("Allocation", allocationSchema);