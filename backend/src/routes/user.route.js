import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { registerUser , loginUser , getCurrentUser , logoutUser} from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.get("/current-user" , verifyJWT , getCurrentUser)
router.post("/logout" , verifyJWT , logoutUser)

export default router;
