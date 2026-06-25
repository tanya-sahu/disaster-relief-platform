import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createInventory , getAllMyInventory , getInventoryById , updateInventory , deleteInventory} from "../controllers/inventory.controller.js";

const router = Router();

router.route("/create").post(verifyJWT , createInventory);
router.route("/my-inventory").get(verifyJWT , getAllMyInventory);
router.route("/inventory/:id").get(verifyJWT , getInventoryById);
router.route("/update/:id").patch(verifyJWT , updateInventory);
router.route("/delete/:id").delete(verifyJWT , deleteInventory);


export default router;