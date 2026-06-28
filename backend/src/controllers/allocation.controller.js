import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Allocation } from "../models/allocation.model.js";
import { Request } from "../models/request.model.js";
import { validateId } from "../middlewares/validate.middleware.js";
import { Inventory } from "../models/inventory.model.js";
import mongoose from "mongoose";

export const assignResources = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ngo") {
    throw new ApiError(
      403,
      "Unauthorized: Only NGOs can accept and allocate victim requests",
    );
  }

  const { id } = req.params;
  const cleanId = id?.trim();
  validateId(cleanId, "Request");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dbRequest = await Request.findById(cleanId).session(session);
    if (!dbRequest) {
      throw new ApiError(404, "Victim request not found");
    }

    if (dbRequest.status === "fulfilled") {
      throw new ApiError(400, "This request is already fully fulfilled");
    }

    const approvedById = dbRequest.approvedBy?._id || dbRequest.approvedBy;
    if (!approvedById || req.user._id.toString() !== approvedById.toString()) {
      throw new ApiError(
        403,
        "Unauthorized: You are not assigned to handle this request",
      );
    }

    const createdAllocations = [];

    for (const targetItem of dbRequest.requestedItems) {
      console.log("Processing Type:", targetItem.itemType);

      if (targetItem.itemStatus === "fulfilled") continue;

      const remainingNeeded =
        targetItem.requiredQuantity - targetItem.fulfilledQuantity;

      const dbInventory = await Inventory.findOne({
        category: targetItem.itemType,
        managedBy: req.user._id,
        status: { $in: ["available", "low-stock"] },
      }).session(session);

      console.log(`Inventory found for ${targetItem.itemType}:`, dbInventory);

      if (!dbInventory || dbInventory.quantity <= 0) {
        console.log(`Skipping: No stock available for ${targetItem.itemType}`);
        continue;
      }

      const quantityToAssign =
        dbInventory.quantity >= remainingNeeded
          ? remainingNeeded
          : dbInventory.quantity;

      dbInventory.quantity -= quantityToAssign;

      if (dbInventory.quantity === 0) {
        dbInventory.status = "out-of-stock";
      } else if (dbInventory.quantity <= 50) {
        dbInventory.status = "low-stock";
      } else {
        dbInventory.status = "available";
      }
      await dbInventory.save({ session });

      targetItem.fulfilledQuantity += quantityToAssign;
      targetItem.itemStatus =
        targetItem.fulfilledQuantity >= targetItem.requiredQuantity
          ? "fulfilled"
          : "partially-fulfilled";

      createdAllocations.push({
        request: cleanId,
        inventory: dbInventory._id,
        quantityAssigned: quantityToAssign,
        allocatedBy: req.user._id,
        status: "Allocated",
      });
    }

    if (createdAllocations.length === 0) {
      throw new ApiError(
        400,
        "No resources were allocated. Check inventory stock levels.",
      );
    }

    const allItemsFulfilled = dbRequest.requestedItems.every(
      (item) => item.itemStatus === "fulfilled",
    );
    const anyItemStarted = dbRequest.requestedItems.some(
      (item) => item.fulfilledQuantity > 0,
    );

    if (allItemsFulfilled) {
      dbRequest.status = "fulfilled";
    } else if (anyItemStarted) {
      dbRequest.status = "partially-fulfilled";
    }

    const savedAllocations = await Allocation.insertMany(createdAllocations, {
      session,
    });

    if (!dbRequest.allocations) {
      dbRequest.allocations = [];
    }

    savedAllocations.forEach((alloc) => {
      dbRequest.allocations.push(alloc._id);
    });

    dbRequest.deliveryStatus = "Allocated";

    await dbRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { request: dbRequest, allocations: savedAllocations },
          "Resources allocated successfully by NGO.",
        ),
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  if (req.user?.role !== "volunteer") {
    throw new ApiError(
      403,
      "Unauthorized: Only assigned volunteers can update the delivery status.",
    );
  }

  const { id } = req.params;
  const { deliveryStatus } = req.body;

  const cleanId = id?.trim();
  validateId(cleanId, "Request");

  const allowedStatuses = [
    "Assigned",
    "Dispatched",
    "Out for delivery",
    "Delivered",
  ];
  if (!allowedStatuses.includes(deliveryStatus)) {
    throw new ApiError(
      400,
      `Invalid delivery status. Allowed statuses are: ${allowedStatuses.join(", ")}`,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dbRequest = await Request.findById(cleanId).session(session);
    if (!dbRequest) {
      throw new ApiError(404, "Victim request not found");
    }

    const assignedVolunteerId =
      dbRequest.assignedVolunteer?._id || dbRequest.assignedVolunteer;
    if (
      !assignedVolunteerId ||
      req.user._id.toString() !== assignedVolunteerId.toString()
    ) {
      throw new ApiError(
        403,
        "Unauthorized: You are not the assigned volunteer for this delivery request.",
      );
    }

    // ---------------------------------------------------------------------------
    // ⚡ CORE CONDITIONAL LOGIC ENGINE
    // ---------------------------------------------------------------------------

    if (dbRequest.status === "fulfilled") {
      dbRequest.deliveryStatus = deliveryStatus;

      let matchingAllocationStatus = "Allocated";
      if (deliveryStatus === "Dispatched")
        matchingAllocationStatus = "Dispatched";
      if (deliveryStatus === "Delivered")
        matchingAllocationStatus = "Delivered";

      if (dbRequest.allocations && dbRequest.allocations.length > 0) {
        await Allocation.updateMany(
          { _id: { $in: dbRequest.allocations } },
          { $set: { status: matchingAllocationStatus } },
          { session },
        );
      }
    } else if (dbRequest.status === "partially-fulfilled") {
      dbRequest.deliveryStatus = deliveryStatus;

      let partialAllocationStatus = "Allocated";
      if (deliveryStatus === "Dispatched")
        partialAllocationStatus = "Dispatched";
      if (deliveryStatus === "Delivered") partialAllocationStatus = "Delivered";

      if (dbRequest.allocations && dbRequest.allocations.length > 0) {
        await Allocation.updateMany(
          { _id: { $in: dbRequest.allocations } },
          { $set: { status: partialAllocationStatus } },
          { session },
        );
      }
    } else {
      throw new ApiError(
        400,
        "Cannot change delivery status. Request must be approved and allocated first.",
      );
    }

    await dbRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { request: dbRequest },
          `Status successfully processed according to requested execution rules.`,
        ),
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
