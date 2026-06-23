import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Disaster } from "../models/disaster.model.js";
import mongoose from "mongoose";

const createDisaster = asyncHandler(async (req, res) => {
  const {
    title,
    type,
    location,
    severity,
    description,
    startDate,
    affectedPeople,
  } = req.body;

  // Required fields validation
  if (
    [title, type, location, startDate].some(
      (field) => !field || field.toString().trim() === "",
    )
  ) {
    throw new ApiError(
      400,
      "Title, type, location and start date are required",
    );
  }

  // Role check
  if (!["admin", "ngo"].includes(req.user.role)) {
    throw new ApiError(403, "Only Admin or NGO can declare a disaster");
  }

  // Duplicate active disaster check
  const existedDisaster = await Disaster.findOne({
    type,
    location,
    startDate,
    status: "active",
  });

  if (existedDisaster) {
    throw new ApiError(
      409,
      "An active disaster with the same details already exists",
    );
  }

  // Create disaster
  const disaster = await Disaster.create({
    title,
    type,
    location,
    severity,
    description,
    startDate,
    affectedPeople,
  });

  if (!disaster) {
    throw new ApiError(500, "Something went wrong while creating disaster");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, disaster, "Disaster declared successfully"));
});

const getDisasterById = asyncHandler(async (req, res) => {
  const { disastersId } = req.params;
  const cleanId = disastersId.trim();

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ApiError(400, "Invalid Disaster ID");
  }

  const disaster = await Disaster.findById(cleanId);

  if (!disaster) {
    throw new ApiError(404, "No disaster found with given ID");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, disaster, "Disaster found successfully"));
});

const resolveDisaster = asyncHandler(async (req, res) => {
  const { disasterId } = req.params;

  const cleanId = disasterId.trim();

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ApiError(400, "Invalid Disaster ID");
  }

  if (!["admin", "ngo"].includes(req.user.role)) {
    throw new ApiError(403, "Only Admin or NGO can resolve disasters");
  }

  const disaster = await Disaster.findById(cleanId);

  if (!disaster) {
    throw new ApiError(404, "No disaster found with given ID");
  }

  if (disaster.status === "resolved") {
    throw new ApiError(400, "Disaster already resolved");
  }

  disaster.status = "resolved";
  disaster.endDate = new Date();

  await disaster.save();

  return res
    .status(200)
    .json(new ApiResponse(200, disaster, "Disaster marked as resolved"));
});

const getAllDisasters = asyncHandler(async (req, res) => {
  const { status, severity, type, location } = req.query;

  const filter = {};

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Filter by severity
  if (severity) {
    filter.severity = severity;
  }

  // Filter by disaster type
  if (type) {
    filter.type = type;
  }

  // Filter by location (case-insensitive)
  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  const disasters = await Disaster.find(filter).sort({ createdAt: -1 }).lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        disasters,
        disasters.length
          ? "Disasters fetched successfully"
          : "No disasters found",
      ),
    );
});

export { createDisaster };
