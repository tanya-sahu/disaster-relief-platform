import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createInventory} from "../controllers/inventory.controller.js";

const router = Router();

router.route("/create").post(verifyJWT , createInventory);


export default router;