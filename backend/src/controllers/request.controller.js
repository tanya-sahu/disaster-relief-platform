import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request } from "../models/request.model.js";
import { Resource } from "../models/resource.model.js";
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
  // 1. Authorization
  if (req.user.role !== "victim" && req.user.role !== "ngo") {
    throw new ApiError(403, "Only victims and NGOs can create requests");
  }

  const { requestType, description, location, priority } = req.body;

  // 2. Validation
  // Check karo ki location aur description khali string toh nahi hain
  const hasEmptyStrings = [description, location].some(
    (field) => !field || field.trim() === "",
  );

  // Check karo ki requestType sahi se array hai aur usme kam se kam ek item hai
  const hasNoRequestType =
    !requestType || !Array.isArray(requestType) || requestType.length === 0;

  if (hasEmptyStrings || hasNoRequestType) {
    throw new ApiError(
      400,
      "Request type (at least one), description, and location are required",
    );
  }

  // 3. Robust Duplicate Check (For Arrays)
  // Yeh check karega ki kya is user ne isi location par same description ke sath pehle se request dali hui hai
  // Aur kya us request ke saare types matches hote hain ($all operator se order ka farq nahi padta)
  const existedRequest = await Request.findOne({
    createdBy: req.user._id,
    location: location.trim(),
    description: description.trim(),
    requestType: { $all: requestType }, // 👈 $all operator check karta hai ki saare selected types pehle se hain ya nahi
  });

  if (existedRequest) {
    throw new ApiError(400, "An identical request already exists");
  }

  // 4. Create Request in Database
  const createdRequest = await Request.create({
    requestType, // 👈 Model mein type: [String] hone par yeh array smoothly save ho jayega
    description: description.trim(),
    location: location.trim(),
    priority: priority || "medium",
    createdBy: req.user._id,
  });

  // 5. Response Return
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

// Step - 2 Approval from NGO
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

  if (request.approvalStatus !== "pending") {
    throw new ApiError(400, "Request already processed");
  }

  request.approvalStatus = "approved";
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

// Step - 3 Reject from NGO

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

  if (request.approvalStatus !== "pending") {
    throw new ApiError(400, "Request already processed");
  }

  request.approvalStatus = "rejected";
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
    approvedStatus,
  } = req.query;

  const filter = {};

  if (requestType) filter.requestType = requestType;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

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

  if (approvedStatus) {
    filter.approvalStatus = approvedStatus;

 
    if (
      (approvedStatus === "approved" || approvedStatus === "rejected") &&
      req.user?.role === "ngo"
    ) {
      filter.approvedBy = req.user._id;
    }
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

  if (request.status !== "pending") {
    throw new ApiError(400, "Request cannot be assigned again");
  }

  if (request.assignedVolunteer) {
    throw new ApiError(400, "Request already assigned to a volunteer");
  }

  request.status = "assigned";
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

const startInProgress = asyncHandler(async (req, res) => {
  if (req.user.role !== "volunteer") {
    throw new ApiError(403, "Only volunteers can update status");
  }
  const { requestId } = req.params;

  const cleanId = requestId?.trim();

  validateId(cleanId, "Request");

  // 1. request find
  const request = await Request.findById(cleanId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  ensureApproved(request);

  // 3. must be assigned first
  if (request.status !== "assigned") {
    throw new ApiError(400, "Request must be assigned first");
  }

  // 5. optional safety: only assigned volunteer can update
  if (
    !request.assignedVolunteer ||
    request.assignedVolunteer.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not your assigned request");
  }

  // 6. update status
  request.status = "in-progress";

  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request marked as in-progress"));
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const resolvedRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== "volunteer") {
    throw new ApiError(403, "Only volunteers can update status");
  }
  const { requestId } = req.params;

  const cleanId = requestId?.trim();

  validateId(cleanId, "Request");

  const request = await Request.findById(cleanId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  ensureApproved(request);

  if (!["assigned", "in-progress"].includes(request.status)) {
    throw new ApiError(
      400,
      "Request must be assigned or in-progress before resolving",
    );
  }

  if (request.status === "resolved") {
    throw new ApiError(400, "Request is already resolved");
  }

  // 5. optional safety: only assigned volunteer can update
  if (
    !request.assignedVolunteer ||
    request.assignedVolunteer.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not your assigned request");
  }

  // 6. update status
  request.status = "resolved";

  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Request marked as resolved"));
});

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const getMyRequests = asyncHandler(async (req, res) => {
  const myRequests = await Request.find({
    createdBy: req.user._id,
  })
    .populate("assignedVolunteer", "fullName phone") // 👈 Volunteer ka naam aur phone fetch karne ke liye
    .populate("assignedShelter", "name location") // 👈 Shelter ka naam aur location fetch karne ke liye
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

  const myAssignedRequests = await Request.find({
    assignedVolunteer: req.user._id,
  })
    .populate("createdBy", "fullName email phone")
    .populate("approvedBy", "fullName email phone")

    // 🌟 ARRAYS POPULATION FIX: Pass an object instead of a string projection
    .populate({
      path: "assignedResources", // Aapke schema ki array field ka naam
      select: "resourceName category quantity location status", // Jo fields aapko chahiye
    })

    .populate({
      path: "assignedShelter", // Single object ho ya array, object syntax hamesha safe rehta h
      select: "name location capacity status contactPerson contactNumber",
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        myAssignedRequests,
        "Your assigned requests fetched successfully",
      ),
    );
});
export {
  createRequest,
  getAllRequest,
  approveRequest,
  rejectRequest,
  getRequestById,
  assignRequest,
  startInProgress,
  resolvedRequest,
  getMyRequests,
  getMyAssignedRequests,
};
