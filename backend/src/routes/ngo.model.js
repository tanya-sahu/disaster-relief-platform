import mongoose, { Schema } from "mongoose";

const ngoProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngoName: {
      type: String,
      required: [true, "NGO Name is required"],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, "Govt Registration Number is required"],
      unique: true,
    },
    ngoLocation: {
      type: String,
      required: [true, "Operating location/city is required"],
    },
    specializedFor: {
      type: [String], // Array: ['Food Supplies', 'Medical Aid', 'Rescue']
      required: true,
    },
    emergencyContact: {
      type: String,
      required: [true, "Emergency contact number is required"],
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin verify karega baad me
    },
  },
  { timestamps: true }
);

export const NGOProfile = mongoose.model("NGOProfile", ngoProfileSchema);