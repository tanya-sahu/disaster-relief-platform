import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  assignResources,
  updateDeliveryStatus,
} from "../controllers/allocation.controller.js";

const router = Router();
router.route("/:id").post(verifyJWT, assignResources);
router.route("/deliveries/:id").patch(verifyJWT, updateDeliveryStatus);
export default router;
