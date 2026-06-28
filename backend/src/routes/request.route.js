import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Aapka auth middleware path
import {
  createRequest,
  getAllRequest,
  getMyRequests,
  getMyAssignedRequests,
  approveRequest,
  rejectRequest,
  getRequestById,
  assignRequest,
  
  
  
} from "../controllers/request.controller.js"; // Aapka controller path
import { updateDeliveryStatus } from "../controllers/allocation.controller.js";

const router = Router();

// =========================================================================
// 1. STATIC POST ROUTES (Pehle execute hone chahiye)
// =========================================================================
router.post("/create-request", verifyJWT, createRequest);


// =========================================================================
// 2. STATIC GET ROUTES (Exact String Matches)
// =========================================================================
router.get("/get-all-request", verifyJWT, getAllRequest);
router.get("/my-requests", verifyJWT, getMyRequests);
router.get("/my-assigned", verifyJWT, getMyAssignedRequests);


// =========================================================================
// 3. SPECIFIC DYNAMIC PATCH ACTIONS (Specific Action Sub-paths)
// =========================================================================
// NGO Actions Pipeline
router.patch("/approve/:requestId", verifyJWT, approveRequest);
router.patch("/reject/:requestId", verifyJWT, rejectRequest);

// Volunteer Lifecycle Actions Pipeline
router.patch("/assign/:requestId", verifyJWT, assignRequest);
router.route("/:id/status").patch(verifyJWT, updateDeliveryStatus);



// =========================================================================
// 4. GENERAL DYNAMIC WILDCARD ROUTES (Hamesha Sabse Aakhiri Mein!)
// =========================================================================
router.get("//:requestId", verifyJWT, getRequestById);


export default router;