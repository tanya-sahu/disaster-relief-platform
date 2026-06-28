import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Inventory } from "../models/inventory.model.js";
import mongoose from "mongoose";

import { validateId } from "../middlewares/validate.middleware.js";

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

const createInventory = asyncHandler(async (req, res) => {
  const { resourceName, category, quantity, unit, status, notes } = req.body;

  if (!resourceName || !category || quantity === undefined) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (quantity < 0) {
    throw new ApiError(400, "Quantity cannot be negative");
  }

  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can create inventory");
  }

  const existedInventory = await Inventory.findOne({
    resourceName,
    category,
    managedBy: req.user._id,
  });

  if (existedInventory) {
    throw new ApiError(409, "Inventory  already exists");
  }

  const inventory = await Inventory.create({
    resourceName,
    category,
    quantity,
    unit,
    status,
    notes,
    managedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, inventory, "Inventory created successfully"));
});

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

const getAllMyInventory = asyncHandler(async (req, res) => {
  if (req.user.role !== "ngo") {
    throw new ApiError(403, "Only NGO can access this");
  }

  const { resourceName, category, status } = req.query;

  const filter = {};

  if (resourceName) {
    filter.resourceName = {
      $regex: resourceName,
      $options: "i",
    };
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  filter.managedBy = req.user._id;

  const inventory = await Inventory.find(filter).sort({ createdAt: -1 }).lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, inventory, "Your inventory fetched successfully"),
    );
});

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

const getInventoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cleanId = id?.trim();

  validateId(cleanId, "Inventory");
  const inventory = await Inventory.findById(cleanId).populate(
    "managedBy",
    "fullName email role",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, inventory, "Inventory found successfully"));
});

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

const updateInventory = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can update inventory");
  }
  const { id } = req.params;
  console.log("Inventory ID:", id);
  const cleanId = id?.trim();

  console.log("CleanId: ", cleanId);

  validateId(cleanId, "Inventory");
  const existingInventory = await Inventory.findById(cleanId);

  if (!existingInventory) {
    throw new ApiError(404, "Inventory not found");
  }

  if (
    req.user.role !== "admin" &&
    existingInventory.managedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can update only your inventory");
  }

  const allowedUpdates = [
    "resourceName",
    "category",
    "quantity",
    "unit",
    "status",
    "notes",
  ];
  const updates = Object.keys(req.body);

  if (updates.includes("quantity") && req.body.quantity < 0) {
    throw new ApiError(400, "Quantity cannot be negative");
  }

  const isValidOperation = updates.every((field) =>
    allowedUpdates.includes(field),
  );

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid update fields");
  }

  const inventory = await Inventory.findByIdAndUpdate(
    cleanId,
    { $set: req.body },
    { new: true, runValidators: true },
  );

  if (inventory.quantity == 0) {
    inventory.status = "out-of-stock";
  }

  if (inventory.quantity <= 50) {
    inventory.status = "low-stock";
  } else inventory.status = "available";

  await inventory.save();

  return res
    .status(200)
    .json(new ApiResponse(200, inventory, "Inventory updated successfully"));
});

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

const deleteInventory = asyncHandler(async (req, res) => {
  if (!["ngo", "admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only NGO and Admin can delete inventory");
  }

  const { id } = req.params;
  console.log("InventoryId:", id);
  const cleanId = id?.trim();

  validateId(cleanId, "Inventory");

  console.log("CleanId:", cleanId);

  const inventory = await Inventory.findById(cleanId);

  if (!inventory) {
    throw new ApiError(404, "Inventory not found");
  }

  if (
    req.user.role !== "admin" &&
    inventory.managedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can delete only your inventory");
  }

  await inventory.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, inventory, "Inventory deleted successfully"));
});

// File ke end mein yeh kar
export {
  createInventory,
  getAllMyInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
};
