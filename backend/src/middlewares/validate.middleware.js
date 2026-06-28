
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validateId = (id, name) => {
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${name} ID`);
  }
};

const ensureApproved = (request) => {
  if (!request || request.status === "pending") {
    throw new ApiError(400, "Request is not approved by NGO");
  }
};

export { validateId  , ensureApproved};
