import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Allocation } from "../models/allocation.model.js";
import { Request } from "../models/request.model.js";
import { validateId } from "../middlewares/validate.middleware.js";
import { Inventory } from "../models/inventory.model.js";
import mongoose from "mongoose";

export const assignResources = asyncHandler(async (req, res) => {
  // 1. Role Validation
  if (req.user?.role !== "ngo") {
    throw new ApiError(403, "Unauthorized: Only NGOs can accept and allocate victim requests");
  }

  const { id } = req.params;
  const cleanId = id?.trim();
  validateId(cleanId, "Request");

  // Start Mongoose Session for ACID Transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Fetch Victim Request inside session
    const dbRequest = await Request.findById(cleanId).session(session);
    if (!dbRequest) {
      throw new ApiError(404, "Victim request not found");
    }

    if (dbRequest.status === "fulfilled") {
      throw new ApiError(400, "This request is already fully fulfilled");
    }

    // 3. Authorization Check
    const approvedById = dbRequest.approvedBy?._id || dbRequest.approvedBy;
    if (!approvedById || req.user._id.toString() !== approvedById.toString()) {
      throw new ApiError(403, "Unauthorized: You are not assigned to handle this request");
    }

    const createdAllocations = [];

    // 4. Loop through each item
    for (const targetItem of dbRequest.requestedItems) {
      console.log("Processing Type:", targetItem.itemType);
      
      if (targetItem.itemStatus === "fulfilled") continue;

      const remainingNeeded = targetItem.requiredQuantity - targetItem.fulfilledQuantity;

      // 5. Check NGO's Inventory (FIXED: category matches targetItem.itemType)
      const dbInventory = await Inventory.findOne({
        category: targetItem.itemType, 
        managedBy: req.user._id,
        status: { $in: ["available", "low-stock"] }
      }).session(session);

      console.log(`Inventory found for ${targetItem.itemType}:`, dbInventory);

      // Agar stock nahi hai ya quantity 0 hai toh skip karein
      if (!dbInventory || dbInventory.quantity <= 0) {
        console.log(`Skipping: No stock available for ${targetItem.itemType}`);
        continue;
      }

      // Calculate allocation pool
      const quantityToAssign = dbInventory.quantity >= remainingNeeded ? remainingNeeded : dbInventory.quantity;

      // A. Update NGO Inventory Stock
      dbInventory.quantity -= quantityToAssign;

      // Status Logic update
      if (dbInventory.quantity === 0) {
        dbInventory.status = "out-of-stock";
      } else if (dbInventory.quantity <= 50) {
        dbInventory.status = "low-stock";
      } else {
        dbInventory.status = "available";
      }
      await dbInventory.save({ session });

      // B. Update Subdocument Request Progress
      targetItem.fulfilledQuantity += quantityToAssign;
      targetItem.itemStatus = targetItem.fulfilledQuantity >= targetItem.requiredQuantity ? "fulfilled" : "partially-fulfilled";

      // D. Prepare Allocation Logs array
      createdAllocations.push({
        request: cleanId,
        inventory: dbInventory._id,
        quantityAssigned: quantityToAssign,
        allocatedBy: req.user._id,
        status: "Allocated", 
      });
    }

    // 6. Final Validation
    if (createdAllocations.length === 0) {
      throw new ApiError(400, "No resources were allocated. Check inventory stock levels.");
    }

    // Overarching Status Updates for Request
    const allItemsFulfilled = dbRequest.requestedItems.every(item => item.itemStatus === "fulfilled");
    const anyItemStarted = dbRequest.requestedItems.some(item => item.fulfilledQuantity > 0);

    if (allItemsFulfilled) {
      dbRequest.status = "fulfilled";
    } else if (anyItemStarted) {
      dbRequest.status = "partially-fulfilled";
    }

    // 7. Safe Bulk Create using insertMany inside Transaction
    const savedAllocations = await Allocation.insertMany(createdAllocations, { session });

    // 🔥 FIXED: Naye allocations array field ko safely handle karna aur update karna
    if (!dbRequest.allocations) {
      dbRequest.allocations = [];
    }
    
    // Saari generated Allocation IDs ko Request ke allocations array mein push karein
    savedAllocations.forEach(alloc => {
      dbRequest.allocations.push(alloc._id);
    });

    // Saari details map hone ke baad save karein
    await dbRequest.save({ session });

    // Commit all database changes at once
    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, { request: dbRequest, allocations: savedAllocations }, "Resources allocated successfully by NGO."));

  } catch (error) {
    // Error aane par saare changes rollback karein
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});