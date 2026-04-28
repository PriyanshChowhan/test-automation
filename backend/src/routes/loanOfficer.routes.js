import { Router } from "express";
import {getAllLoans, getLoanById, rejectLoan, acceptLoan} from "../controllers/loanOfficer.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

// secured routes applicant
router.route("/getAllLoans").get(verifyJWT, getAllLoans)
router.route("/:loanId").get(verifyJWT, getLoanById);
router.route("/reject/:loanId").post(verifyJWT, rejectLoan);
router.route("/accept/:loanId").post(verifyJWT, acceptLoan);

export default router