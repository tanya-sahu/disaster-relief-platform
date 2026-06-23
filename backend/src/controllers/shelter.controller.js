import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Shelter } from "../models/shelter.model.js";
import { Disaster } from "../models/disaster.model.js";
import mongoose from "mongoose";

import {
  validateId,
  ensureApproved,
} from "../middlewares/validate.middleware.js";






//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
const createShelter = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can create shelter");
  }

  const { name, address, capacity, contactPerson, contactNumber, disasterId } =
    req.body;

  if (
    !name?.trim() ||
    !address?.trim() ||
    !contactPerson?.trim() ||
    !contactNumber?.trim()
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (capacity !== undefined) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new ApiError(400, "Capacity must be a positive integer");
    }
  }

  let disaster = null;
  const cleanDisasterId = disasterId?.trim();
  validateId(disasterId, "Disaster");

  if (cleanDisasterId) {
    disaster = await Disaster.findById(cleanDisasterId);

    if (!disaster) {
      throw new ApiError(404, "No disaster found with given ID");
    }
  }

  const existedShelter = await Shelter.findOne({
    name: name.trim(),
    address: address.trim(),
    managedBy: req.user._id,
  });

  // Shelter already exists
  if (existedShelter && !existedShelter.isDeleted) {
    throw new ApiError(409, "Shelter already exists");
  }

  // Restore deleted shelter
  if (existedShelter && existedShelter.isDeleted) {
    existedShelter.isDeleted = false;
    existedShelter.deletedAt = null;
    existedShelter.capacity = capacity;
    existedShelter.contactPerson = contactPerson.trim();
    existedShelter.contactNumber = contactNumber.trim();
    existedShelter.disaster = disaster ? disaster._id : null;
    existedShelter.status = "open";
    existedShelter.currentOccupancy = 0;

    await existedShelter.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, existedShelter, "Shelter restored successfully"),
      );
  }

  // Create new shelter
  const shelter = await Shelter.create({
    name: name.trim(),
    address: address.trim(),
    capacity,
    contactPerson: contactPerson.trim(),
    contactNumber: contactNumber.trim(),
    disaster: disaster ? disaster._id : null,
    managedBy: req.user._id,
    currentOccupancy: 0,
    status: "open",
    isDeleted: false,
    deletedAt: null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, shelter, "Shelter created successfully"));
});




//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

/** getAvailableShelters */
const getAvailableShelters = asyncHandler(async (req, res) => {
  const { locationKeyword, peopleCount } = req.query;

  if (!locationKeyword?.trim()) {
    throw new ApiError(400, "Location keyword is required");
  }

  if (peopleCount !== undefined) {
    const parsed = Number(peopleCount);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new ApiError(400, "People count must be a positive integer");
    }
  }

  const count = Number(peopleCount) || 1;

  const shelters = await Shelter.find({
    address: { $regex: locationKeyword.trim(), $options: "i" },
    status: "open",
    isDeleted: false,
  });

  if (shelters.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No shelters found for given location"));
  }

  const availableShelters = shelters
    .map((shelter) => {
      const availableSpace = shelter.capacity - shelter.currentOccupancy;
      return {
        id: shelter._id,
        name: shelter.name,
        address: shelter.address,
        capacity: shelter.capacity,
        currentOccupancy: shelter.currentOccupancy,
        availableSpace,
      };
    })
    .filter((s) => s.availableSpace >= count);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        availableShelters,
        "Available shelters fetched successfully",
      ),
    );
});

/** assignShelter */
const assignShelterToRequest = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can assign shelters");
  }

  const { shelterId } = req.params;
  const { requestId, peopleCount } = req.body;

  // ==========================
  // Validate IDs
  // ==========================

  const cleanShelterId = shelterId?.trim();
  const cleanRequestId = requestId?.trim();

  validateId(cleanShelterId);
  validateId(cleanRequestId);

  // ==========================
  // Find Shelter
  // ==========================

  const shelter = await Shelter.findById(cleanShelterId);

  if (!shelter) {
    throw new ApiError(404, "Shelter not found");
  }

  // NGO can assign only its own shelter
  if (
    req.user.role === "ngo" &&
    shelter.managedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "You can only assign shelters managed by you"
    );
  }

  if (shelter.status !== "open") {
    throw new ApiError(
      400,
      "Shelter is not available for allocation"
    );
  }

  // ==========================
  // Find Request
  // ==========================

  const request = await Request.findById(cleanRequestId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  // ==========================
  // Request Validations
  // ==========================

  ensureApproved(request);

  if (request.requestType !== "shelter") {
    throw new ApiError(
      400,
      "Shelter can only be assigned to shelter requests"
    );
  }

  if (request.assignedShelter) {
    throw new ApiError(
      400,
      "A shelter has already been assigned to this request"
    );
  }

  if (request.status !== "assigned") {
    throw new ApiError(
      400,
      "Request must be assigned to a volunteer first"
    );
  }

  // ==========================
  // People Count Validation
  // ==========================

  const count = Number(peopleCount);

  if (!Number.isInteger(count) || count < 1) {
    throw new ApiError(
      400,
      "People count must be a positive integer"
    );
  }

  // ==========================
  // Capacity Check
  // ==========================

  if (shelter.currentOccupancy + count > shelter.capacity) {
    throw new ApiError(
      400,
      "Shelter does not have enough capacity"
    );
  }

  // ==========================
  // Update Shelter
  // ==========================

  shelter.currentOccupancy += count;
  shelter.assignedVolunteer = request.assignedVolunteer

  if (shelter.currentOccupancy >= shelter.capacity) {
    shelter.status = "full";
  }

  // ==========================
  // Update Request
  // ==========================

  request.assignedShelter = shelter._id;


  // Optional field if present in schema
  // request.allocatedPeople = count;

  // ==========================
  // Save Changes
  // ==========================

  await shelter.save();
  await request.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        request,
        shelter,
      },
      "Shelter assigned successfully"
    )
  );
});

const getShelterById = asyncHandler(async (req, res) => {
  const { shelterId } = req.params;

  const cleanShelterId = shelterId?.trim();
  validateId(cleanShelterId)

  const shelter = await Shelter.findOne({
    _id: cleanId,
    isDeleted: false,
  })
    .populate("managedBy", "fullName email role")
    .populate("assignedVolunteer", "fullName email role");

  if (!shelter) {
    throw new ApiError(404, "Shelter not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, shelter, "Shelter fetched successfully"));
});


//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

const updateShelter = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Unauthorized access");
  }



  const { shelterId } = req.params;

  const cleanShelterId = shelterId?.trim();
  validateId(cleanShelterId , "Shelter")

  if (
    req.user.role === "ngo" &&
    shelter.managedBy.toString() !== req.user._id.toString() 
  ) {
    throw new ApiError(
      403,
      "You can only update shelters managed by you"
    );
  }


  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  const allowedUpdates = [
    "name",
    "address",
    "capacity",
    "status",
    "contactPerson",
    "contactNumber",
    "disaster",
  ];

  const isValidOperation = updates.every((field) =>
    allowedUpdates.includes(field),
  );

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid update fields");
  }

  const filter = {
    _id: cleanId,
    isDeleted: false,
  };

  if (req.user.role === "ngo") {
    filter.managedBy = req.user._id;
  }

  const shelter = await Shelter.findOne(filter);

  if (!shelter) {
    throw new ApiError(404, "Shelter not found or unauthorized");
  }

  // Capacity validation
  if (updates.includes("capacity")) {
    if (!Number.isInteger(req.body.capacity) || req.body.capacity < 1) {
      throw new ApiError(400, "Capacity must be a positive integer");
    }

    if (req.body.capacity < shelter.currentOccupancy) {
      throw new ApiError(400, "Capacity cannot be less than current occupancy");
    }
  }

  // Auto status update
  if (!updates.includes("status")) {
    const newCapacity = req.body.capacity ?? shelter.capacity;
    req.body.status = shelter.currentOccupancy >= newCapacity ? "full" : "open";
  }

  const updatedShelter = await Shelter.findByIdAndUpdate(
    cleanId,
    { $set: req.body },
    { new: true, runValidators: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedShelter, "Shelter updated successfully"));
});




//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

const deleteShelter = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Unauthorized access");
  }

  const { shelterId } = req.params;

  const cleanShelterId = shelterId?.trim();
  validateId(cleanShelterId , "Shelter")
  const filter = {
    _id: cleanId,
    isDeleted: false,
  };

  if (req.user.role === "ngo") {
    filter.managedBy = req.user._id;
  }

  const shelter = await Shelter.findOne(filter);

  if (!shelter) {
    throw new ApiError(404, "Shelter not found or unauthorized");
  }

  if (shelter.currentOccupancy > 0) {
    throw new ApiError(400, "Cannot delete shelter with active occupants");
  }

  shelter.isDeleted = true;
  shelter.deletedAt = new Date();

  await shelter.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Shelter deleted successfully"));
});




//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

const getAllShelters = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Unauthorized access");
  }

  const { name, address, page = 1, limit = 10 } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    throw new ApiError(400, "Invalid page number");
  }

  if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError(400, "Limit must be between 1 and 50");
  }

  const filter = {
    isDeleted: false,
  };

  if (req.user.role === "ngo") {
    filter.managedBy = req.user._id;
  }

  if (name?.trim()) {
    filter.name = { $regex: name.trim(), $options: "i" };
  }

  if (address?.trim()) {
    filter.address = { $regex: address.trim(), $options: "i" };
  }

  const totalShelters = await Shelter.countDocuments(filter);

  const shelters = await Shelter.find(filter)
    .populate("managedBy", "fullName email role")
    .populate("disaster", "title status")
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shelters,
        pagination: {
          total: totalShelters,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalShelters / limitNum),
        },
      },
      "Shelters fetched successfully",
    ),
  );
});



export {
  createShelter,
  getAllShelters,
  getAvailableShelters,
  assignShelter,
  getShelterById,
  updateShelter,
  deleteShelter,
};
