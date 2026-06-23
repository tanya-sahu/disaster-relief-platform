import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Resource } from "../models/resource.model.js";
import mongoose from "mongoose";

// ✅ SARE MISSING IMPORTS FIX KIYE
import { Request } from "../models/request.model.js"; 
import { Disaster } from "../models/disaster.model.js";
import { Inventory } from "../models/inventory.model.js";

import {
  validateId,
  ensureApproved,
} from "../middlewares/validate.middleware.js";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
const createResource = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can create resources");
  }

  const {
    requestId,
    resourceName,
    category,
    quantity,
    unit,
    location,
    disasterId,
  } = req.body;

  if (
    !requestId ||
    !resourceName ||
    !category ||
    quantity === undefined ||
    !unit ||
    !location
  ) {
    throw new ApiError(400, "Please fill all required fields");
  }

  if (quantity <= 0) {
    throw new ApiError(400, "Quantity must be greater than 0");
  }

  const cleanRequestId = requestId?.trim();
  validateId(cleanRequestId, "Request");

  // 🌟 MONGOOSE TRANSACTION SESSION START (Bohut zaroori hai data secure rakhne ke liye)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Session ko har query ke sath bind karna hota hai (.session(session))
    const request = await Request.findById(cleanRequestId).session(session);

    if (!request) {
      throw new ApiError(404, "Request not found");
    }

    if (request.approvalStatus !== "approved") {
      throw new ApiError(400, "Request is not approved yet");
    }

    if (!request.approvedBy) {
      throw new ApiError(400, "No NGO has approved this request");
    }

    if (
      req.user.role === "ngo" &&
      request.approvedBy.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, "Only approving NGO can assign resource");
    }

    if (!["assigned", "in-progress"].includes(request.status)) {
      throw new ApiError(400, "Request must be assigned to a volunteer first");
    }

    if (!["food", "water", "medical", "other"].includes(request.requestType)) {
      throw new ApiError(400, "Resources can only be assigned to resource requests");
    }

    if (request.assignedResource) {
      throw new ApiError(400, "Resource already assigned to this request");
    }

    // ====================================
    // Disaster Validation
    // ====================================
    let disaster = null;
    const cleanDisasterId = disasterId?.trim();

    if (cleanDisasterId) {
      validateId(cleanDisasterId, "Disaster");
      disaster = await Disaster.findById(cleanDisasterId).session(session);

      if (!disaster) {
        throw new ApiError(404, "Disaster not found");
      }
    }

    // ====================================
    // Inventory Check
    // ====================================
    const inventory = await Inventory.findOne({
      resourceName,
      category,
      managedBy: req.user._id,
    }).session(session);

    if (!inventory) {
      throw new ApiError(404, "Requested resource not available in inventory");
    }

    if (inventory.quantity < quantity) {
      throw new ApiError(400, `Only ${inventory.quantity} ${inventory.unit} available`);
    }

    // Deduct inventory quantity safely inside session
    inventory.quantity -= quantity;
    if (inventory.quantity === 0) {
      inventory.status = "out-of-stock";
    }
    await inventory.save({ session });

    // ====================================
    // Create Resource
    // ====================================
    const [resource] = await Resource.create(
      [
        {
          request: request._id,
          resourceName,
          category,
          quantity,
          unit,
          location,
          disaster: disaster?._id || null,
          managedBy: req.user._id,
        },
      ],
      { session }
    );

    // ====================================
    // Link Resource To Request
    // ====================================
    request.assignedResource = resource._id;
    await request.save({ session });

    // Agar sab sahi chala toh changes ko commit (save) karo database me
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(
      new ApiResponse(201, resource, "Resource assigned successfully")
    );

  } catch (error) {
    // Agar beech me koi bhi crash hua, toh saara data pehle jaisa roll back ho jayega!
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
const getAllMyAssignedResources = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can view resources");
  }

  const { resourceName, category, status, location, disasterId } = req.query;
  const filter = {};

  if (resourceName) {
    filter.resourceName = { $regex: resourceName, $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }

  const cleanDisasterId = disasterId?.trim();
  if (cleanDisasterId) {
    validateId(cleanDisasterId, "Disaster");
    filter.disaster = cleanDisasterId;
  }

  if (req.user.role === "ngo") {
    filter.managedBy = req.user._id;
  }

  const resources = await Resource.find(filter)
    .populate("request", "requestType location status")
    .populate("assignedVolunteer", "fullName email")
    .populate("disaster", "title")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      resources,
      resources.length ? "Resources fetched successfully" : "No resources found"
    )
  );
});

////////////////////////////////////////////////////////////////////////////////////
const getResourceById = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const cleanId = resourceId?.trim();

  validateId(cleanId, "Resource"); // ✅ SPELLING TYPO FIXED HERE

  const resource = await Resource.findById(cleanId)
    .populate("managedBy", "fullName email role")
    .populate("disaster", "title type location severity status");

  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resource, "Resource found successfully"));
});

////////////////////////////////////////////////////////////////////////////////////
const updateResource = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can update resources");
  }

  const { resourceId } = req.params;
  const cleanId = resourceId?.trim();

  validateId(cleanId, "Resource");

  const resource = await Resource.findById(cleanId);
  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  if (
    req.user.role !== "admin" &&
    resource.managedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can update only your resources");
  }

  const allowedUpdates = ["status", "notes", "location"];
  const updates = Object.keys(req.body);

  const isValidOperation = updates.every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid update fields");
  }

  updates.forEach((field) => {
    resource[field] = req.body[field];
  });

  await resource.save();

  return res.status(200).json(
    new ApiResponse(200, resource, "Resource updated successfully")
  );
});

export {
  createResource,
  getResourceById,
  getAllMyAssignedResources,
  updateResource,
};