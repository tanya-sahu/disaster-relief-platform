import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request } from "../models/request.model.js";
import { Shelter } from "../models/shelter.model.js";
import mongoose from "mongoose";

import {
  validateId,
  ensureApproved,
} from "../middlewares/validate.middleware.js";

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

const createRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== "victim" && req.user.role !== "ngo") {
    throw new ApiError(403, "Only victims and NGOs can create requests");
  }

  const { items, description, location, priority } = req.body;

  const hasEmptyStrings = [description, location].some(
    (field) => !field || field.trim() === "",
  );

  const hasNoItems = !items || !Array.isArray(items) || items.length === 0;

  if (hasEmptyStrings || hasNoItems) {
    throw new ApiError(
      400,
      "Requested items (at least one), description, and location are required",
    );
  }

  const isInvalidItems = items.some(
    (item) =>
      !item.itemType || !item.requiredQuantity || item.requiredQuantity <= 0,
  );

  if (isInvalidItems) {
    throw new ApiError(
      400,
      "Invalid items format or negative quantity provided",
    );
  }

  const itemTypesArray = items.map((i) => i.itemType);

  const existedRequest = await Request.findOne({
    createdBy: req.user._id,
    location: location.trim(),
    description: description.trim(),
    "requestedItems.itemType": { $all: itemTypesArray },
    status: "pending", 
  });

  if (existedRequest) {
    throw new ApiError(400, "An identical pending request already exists");
  }

  const requestedItems = items.map((item) => ({
    itemType: item.itemType,
    requiredQuantity: Number(item.requiredQuantity),
    fulfilledQuantity: 0,
    itemStatus: "pending",
  }));

  const createdRequest = await Request.create({
    requestedItems,
    description: description.trim(),
    location: location.trim(),
    priority: priority || "medium",
    createdBy: req.user._id,
    status: "pending",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdRequest,
        "Emergency request broadcasted successfully",
      ),
    );
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

const approveRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== "ngo") {
    throw new ApiError(403, "Only NGOs can approve requests");
  }

  const { requestId } = req.params;
  const cleanId = requestId?.trim();

  validateId(cleanId, "Request");

  const request = await Request.findById(cleanId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Request already processed");
  }

  request.status = "approved";
  request.approvedBy = req.user._id;
  request.approvedAt = new Date();

  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request approved by NGO"));
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


const rejectRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== "ngo") {
    throw new ApiError(403, "Only NGOs can reject requests");
  }

  const { requestId } = req.params;
  const cleanId = requestId?.trim();

  validateId(cleanId, "Request");

  const request = await Request.findById(cleanId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Request already processed");
  }

  request.status = "rejected";
  request.approvedBy = req.user._id;

  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request rejected by NGO"));
});

//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const getAllRequest = asyncHandler(async (req, res) => {
  const {
    requestType,
    status,
    priority,
    location,
    disasterId,
    isVolunteerAssigned,
  } = req.query;

  const filter = {};

  if (requestType) filter.requestType = requestType;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (isVolunteerAssigned) filter.isVolunteerAssigned = isVolunteerAssigned;

  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (disasterId && disasterId.trim() !== "") {
    const cleanDisasterId = disasterId.trim();
    validateId(cleanDisasterId, "Disaster");
    filter.disaster = cleanDisasterId;
  }

  const requests = await Request.find(filter)
    .populate("createdBy", "fullName email role")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "All requests fetched successfully"));
});
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

const getRequestById = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const cleanId = requestId?.trim();

  validateId(cleanId, "Request");

  const request = await Request.findById(cleanId).populate(
    "createdBy",
    "fullName email role",
  );

  if (!request) {
    throw new ApiError(404, "No request found with given ID");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request found successfully"));
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

const assignRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== "volunteer") {
    throw new ApiError(403, "Only volunteers can accept requests");
  }
  const { requestId } = req.params;
  const cleanId = requestId?.trim();

  validateId(cleanId, "Request");

  const request = await Request.findById(cleanId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  ensureApproved(request);

  if (request.assignedVolunteer) {
    throw new ApiError(400, "Request already assigned to a volunteer");
  }

  if (request.deliveryStatus !== "Allocated") {
    throw new ApiError(403, "Request has to be allocated");
  }

  request.deliveryStatus = "Assigned";

  request.isVolunteerAssigned = true;

  request.assignedVolunteer = req.user._id;

  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request assigned successfully"));
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const getMyRequests = asyncHandler(async (req, res) => {
  const myRequests = await Request.find({
    createdBy: req.user._id,
  })
    .populate("assignedVolunteer", "fullName phone")
    .populate("approvedBy", "fullName phone")
    // 👈 Volunteer ka naam aur phone fetch karne ke liye

    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, myRequests, "Your requests fetched successfully"),
    );
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const getMyAssignedRequests = asyncHandler(async (req, res) => {
  if (req.user?.role !== "volunteer") {
    throw new ApiError(403, "Only volunteers can view assigned requests");
  }

  const { status, priority, requestType } = req.query;

  const filter = {

    assignedVolunteer: req.user._id,
    isVolunteerAssigned: true,
  };

 
  if (
    status &&
    status.trim() !== "" &&
    status.toLowerCase() !== "all" &&
    status.toLowerCase() !== "all statuses"
  ) {
    filter.status = status.toLowerCase();
  }

  if (
    priority &&
    priority.trim() !== "" &&
    priority.toLowerCase() !== "all" &&
    priority.toLowerCase() !== "all categories"
  ) {
    const priorityClean = priority.split(" ")[0].toLowerCase();
    filter.priority = priorityClean;
  }

  if (
    requestType &&
    requestType.trim() !== "" &&
    requestType.toLowerCase() !== "all" &&
    requestType.toLowerCase() !== "all categories"
  ) {
    filter["requestedItems.itemType"] = {
      $regex: new RegExp(`^${requestType}$`, "i"),
    };
  }

  const myAssignedRequests = await Request.find(filter)
    .populate("createdBy", "fullName phone")
    .populate("approvedBy", "fullName phone")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        myAssignedRequests,
        `Requests fetched successfully. Found: ${myAssignedRequests.length} matching grid bounds.`,
      ),
    );
});
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

export {
  createRequest,
  getAllRequest,
  approveRequest,
  rejectRequest,
  getRequestById,
  assignRequest,
  getMyRequests,
  getMyAssignedRequests,
};
