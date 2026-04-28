import { Applicant } from "../models/applicant.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { LoanApplication } from "../models/loanApplication.model.js";
import flow from "../helpers/rinflow.js";
import fs from "fs";
import crypto from "crypto";
import path from "path";

const getAllPreviousLoans = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    // Find all loans for this user
    const loans = await LoanApplication.find({ Applicant_Id: userId });

    res.status(200).json({ loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const applyLoan = async (req, res, next) => {
  console.log("applying loan");

  try {
    const applicantId = req.user._id;
    if (!applicantId) throw new ApiError(401, "Login is required");

    const {
      dependents,
      education,
      selfEmployed,
      incomeAnnum,
      loanAmount,
      loanTerm,
      cibilScore,
      resedentialAssetValue,
      commercialAssetValue,
      luxuryAssetValue,
      bankAssetValue,
      debt,
    } = req.body;

    console.log(req.body);
    
    console.log({
      dependents,
      education,
      selfEmployed,
      incomeAnnum,
      loanAmount,
      loanTerm,
      cibilScore,
      resedentialAssetValue,
      commercialAssetValue,
      luxuryAssetValue,
      bankAssetValue,
      debt,
    });
    

    if (
      dependents === undefined ||
      !education ||
      selfEmployed === undefined ||
      incomeAnnum === undefined ||
      loanAmount === undefined ||
      loanTerm === undefined ||
      cibilScore === undefined ||
      resedentialAssetValue === undefined ||
      commercialAssetValue === undefined ||
      luxuryAssetValue === undefined ||
      bankAssetValue === undefined ||
      debt === undefined
    ) {
      throw new ApiError(400, "All fields are required.");
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      throw new ApiError(404, "Applicant not found.");
    }

    const newLoanApplication = await LoanApplication.create({
      Applicant_Id: applicantId,
      Applicant_name: applicant.name,
      number_of_dependents: dependents,
      education,
      self_employed: selfEmployed,
      income_annum: incomeAnnum,
      loan_amount: loanAmount,
      loan_term: loanTerm,
      cibil_score: cibilScore,
      residential_assets_value: resedentialAssetValue,
      commercial_assets_value: commercialAssetValue,
      luxury_assets_value: luxuryAssetValue,
      bank_asset_value: bankAssetValue,
      debt,
      loan_status: "Pending",
    });

    await Applicant.findByIdAndUpdate(
      applicantId,
      {
        $push: { prev_loans: newLoanApplication._id },
        $inc: { number_of_prev_loans: 1 },
      },
      { new: true }
    );

    // Respond immediately — AI analysis runs in the background
    res.status(201).json(
      new ApiResponse(201, newLoanApplication, "Loan application submitted successfully.")
    );

    // Fire-and-forget: run Gemini once and store result
    const applicationData = {
      dependents: newLoanApplication.number_of_dependents,
      education: newLoanApplication.education,
      selfEmployed: newLoanApplication.self_employed,
      incomeAnnum: newLoanApplication.income_annum,
      loanAmount: newLoanApplication.loan_amount,
      loanTerm: newLoanApplication.loan_term,
      cibilScore: newLoanApplication.cibil_score,
      resedentialAssetValue: newLoanApplication.residential_assets_value,
      commercialAssetValue: newLoanApplication.commercial_assets_value,
      luxuryAssetValue: newLoanApplication.luxury_assets_value,
      bankAssetValue: newLoanApplication.bank_asset_value,
      debt: newLoanApplication.debt,
    };

    flow.analyzeRisk({ applicationData })
      .then((aiAnalysis) => {
        newLoanApplication.ai_analysis = aiAnalysis;
        return newLoanApplication.save();
      })
      .catch((err) => console.error("Background AI analysis failed:", err.message));

  } catch (error) {
    next(error);
  }
};

export { applyLoan, getAllPreviousLoans };
