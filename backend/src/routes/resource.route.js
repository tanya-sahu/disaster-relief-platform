import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// ✅ Controller ke exact exported names import kiye hain
import {
  createResource,
  getAllMyAssignedResources, // 🌟 Function name controller se match kar diya
  getResourceById,
  updateResource,
} from "../controllers/resource.controller.js";

const router = Router();

// 📌 Route: Resource Create karna
// Full URL: http://localhost:5000/api/v1/resources/create
router.post("/create", verifyJWT, createResource);

// 📌 Route: Saare assigned resources ki list dekhna
// Full URL: http://localhost:5000/api/v1/resources/get-all-resources
router.get("/get-all-resources", verifyJWT, getAllMyAssignedResources);

// 📌 Route: Specific Resource ID se fetch karna (Prefix laga diya taaki clash na ho)
// Full URL: http://localhost:5000/api/v1/resources/get/:resourceId
router.get("/get/:resourceId", verifyJWT, getResourceById);

// 📌 Route: Resource Status/Notes update karna
// Full URL: http://localhost:5000/api/v1/resources/update/:resourceId
router.patch("/update/:resourceId", verifyJWT, updateResource);

export default router;