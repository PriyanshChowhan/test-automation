import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {login, logout, register, getUserDetails} from "../controllers/common.controllers.js"

const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(verifyJWT, logout)
router.route("/getUser").get(verifyJWT, getUserDetails)

export default router