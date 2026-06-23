import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  createDisaster,
  
} from "../controllers/disaster.controller.js";

const router = Router();

router.post("/create", verifyJWT, createDisaster);

/*router.get("/get-all-disaster", verifyJWT, getAllDisaster);

router.get("/:disasterId", verifyJWT, getDisasterById);

router.patch("/:disasterId/resolved", verifyJWT, resolveDisaster);*/

export default router;
