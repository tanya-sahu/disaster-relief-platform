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

    // 🌟 Har resource ka apna hisab-kitab
    requestedItems: [
      {
        itemType: {
          type: String,
          enum: ["food", "water", "medical", "shelter", "rescue", "other"],
          required: true,
        },
        requiredQuantity: {
          type: Number,
          required: true,
          min: [1, "Quantity kam se kam 1 honi chahiye"],
        },
        fulfilledQuantity: {
          type: Number,
          default: 0,
          // Custom validator taaki fulfilled quantity required se zyada na ho jae
          validate: {
            validator: function (value) {
              return value <= this.requiredQuantity;
            },
            message:
              "Fulfilled quantity, required quantity se zyada nahi ho sakti!",
          },
        },
        itemStatus: {
          type: String,
          enum: ["pending", "partially-fulfilled", "fulfilled"],
          default: "pending",
        },
      },
    ],

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

    // 🌟 Streamlined Lifecycle Status
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "partially-fulfilled",
        "fulfilled",
        "rejected",
      ],
      default: "pending",
    },

    isVolunteerAssigned: {
      type: Boolean,
      default: false,
      
    },

    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    allocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allocation",
      },
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Request = mongoose.model("Request", requestSchema);
