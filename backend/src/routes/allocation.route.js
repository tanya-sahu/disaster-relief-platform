import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { assignResources } from "../controllers/allocation.controller.js";

const router = Router();
router.route("/:id").post(verifyJWT, assignResources);
export default router
