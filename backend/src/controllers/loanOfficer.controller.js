import { LoanApplication } from "../models/loanApplication.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import flow from "../helpers/rinflow.js";

const getAllLoans = async (req, res, next) => {
  try {
    if (req.user.role !== "loanOfficer") {
      throw new ApiError(400, "Invalid access");
    }

    const loans = await LoanApplication.find();

    if (!loans || loans.length === 0) {
      return next(new ApiError(404, "No loans found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { loans }, "Loans retrieved successfully"));
  } catch (error) {
    console.error("Error fetching loans:", error);
    next(new ApiError(500, "Server Error", error));
  }
};

const getLoanById = async (req, res) => {
  try {
    if (req.user.role !== "loanOfficer") {
      throw new ApiError(400, "Invalid access");
    }

    const loan = await LoanApplication.findById(req.params.loanId);

    if (!loan) {
      throw new ApiError(404, "Loan not found");
    }

    // If AI analysis is missing (failed at submission), retry once and persist
    if (!loan.ai_analysis) {
      try {
        const applicationData = {
          dependents: loan.number_of_dependents,
          education: loan.education,
          selfEmployed: loan.self_employed,
          incomeAnnum: loan.income_annum,
          loanAmount: loan.loan_amount,
          loanTerm: loan.loan_term,
          cibilScore: loan.cibil_score,
          resedentialAssetValue: loan.residential_assets_value,
          commercialAssetValue: loan.commercial_assets_value,
          luxuryAssetValue: loan.luxury_assets_value,
          bankAssetValue: loan.bank_asset_value,
          debt: loan.debt,
        };
        loan.ai_analysis = await flow.analyzeRisk({ applicationData });
        await loan.save();
      } catch (aiError) {
        console.error("Retry AI analysis failed:", aiError.message);
      }
    }

    res.status(200).json({ loan, aiResponse: loan.ai_analysis ?? null });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(error.statusCode || 500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const rejectLoan = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== "loanOfficer") {
      throw new ApiError(403, "Access denied: Only loan officers can reject loans");
    }

    const { loanId } = req.params;

    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      throw new ApiError(404, "Loan application not found");
    }

    if (loan.loan_status === "Rejected") {
      throw new ApiError(400, "Loan is already rejected");
    }

    loan.loan_status = "Rejected";
    await loan.save();

    return res
      .status(200)
      .json(new ApiResponse(200, loan, "Loan application rejected successfully"));
  } catch (error) {
    next(error);
  }
});

// accept Loan

const acceptLoan = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== "loanOfficer") {
      throw new ApiError(403, "Access denied: Only loan officers can accept loans");
    }

    const { loanId } = req.params;

    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      throw new ApiError(404, "Loan application not found");
    }

    if (loan.loan_status === "Approved") {
      throw new ApiError(400, "Loan is already accepted");
    }

    loan.loan_status = "Approved";
    await loan.save();

    return res
      .status(200)
      .json(new ApiResponse(200, loan, "Loan application accepted successfully"));
  } catch (error) {
    next(error);
  }
});

const resetLoan = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== "loanOfficer") {
      throw new ApiError(403, "Access denied: Only loan officers can reset loans");
    }

    const { loanId } = req.params;

    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      throw new ApiError(404, "Loan application not found");
    }

    if (loan.loan_status === "Pending") {
      throw new ApiError(400, "Loan is already pending");
    }

    loan.loan_status = "Pending";
    await loan.save();

    return res
      .status(200)
      .json(new ApiResponse(200, loan, "Loan status reset to Pending"));
  } catch (error) {
    next(error);
  }
});

export { getAllLoans, getLoanById, rejectLoan, acceptLoan, resetLoan };
