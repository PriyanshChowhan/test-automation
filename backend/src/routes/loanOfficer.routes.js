import { Router } from "express";
import { getAllLoans, getLoanById, rejectLoan, acceptLoan, resetLoan } from "../controllers/loanOfficer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getAllLoans").get(verifyJWT, getAllLoans);
router.route("/:loanId").get(verifyJWT, getLoanById);
router.route("/reject/:loanId").post(verifyJWT, rejectLoan);
router.route("/accept/:loanId").post(verifyJWT, acceptLoan);
router.route("/reset/:loanId").post(verifyJWT, resetLoan);

export default router;