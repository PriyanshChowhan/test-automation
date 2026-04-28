import { Router } from "express";
import {
  getAllPreviousLoans,
  applyLoan,
} from "../controllers/applicant.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/loans").get(verifyJWT, getAllPreviousLoans);
router.route("/apply").post(verifyJWT, applyLoan);

export default router;
