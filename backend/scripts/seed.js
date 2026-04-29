/**
 * Seed script — adds 5 loan applications with Indian applicants.
 * 3 are financially strong (AI should approve), 2 are weak (AI should reject).
 * A 15-second delay between each Gemini call avoids quota errors.
 *
 * Run from the backend directory:
 *   node scripts/seed.js
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Applicant } from "../src/models/applicant.model.js";
import { LoanApplication } from "../src/models/loanApplication.model.js";
import { riskAssessment } from "../src/services/gemini-api/risk.js";
import computeLoanMetrics from "../src/services/summarize/loanMetrics.js";

const GEMINI_CONFIG = { geminiApi: process.env.GEMINI_API };

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// Seed data — 3 strong profiles (approve), 2 weak profiles (reject)
// ---------------------------------------------------------------------------
const APPLICANTS = [
  // ── APPROVE ──────────────────────────────────────────────────────────────
  {
    applicant: {
      name: "Arjun Sharma",
      email: "arjun.sharma.seed@rinflow.dev",
      password: "Seed@1234",
    },
    loan: {
      education: "Graduate",
      self_employed: false,
      number_of_dependents: 2,
      income_annum: 1_200_000,
      loan_amount: 2_500_000,
      loan_term: 240,
      cibil_score: 780,
      residential_assets_value: 5_000_000,
      commercial_assets_value: 2_000_000,
      luxury_assets_value: 500_000,
      bank_asset_value: 1_000_000,
      debt: 100_000,
    },
  },
  {
    applicant: {
      name: "Priya Nair",
      email: "priya.nair.seed@rinflow.dev",
      password: "Seed@1234",
    },
    loan: {
      education: "Graduate",
      self_employed: false,
      number_of_dependents: 1,
      income_annum: 900_000,
      loan_amount: 1_500_000,
      loan_term: 180,
      cibil_score: 760,
      residential_assets_value: 3_500_000,
      commercial_assets_value: 0,
      luxury_assets_value: 200_000,
      bank_asset_value: 800_000,
      debt: 50_000,
    },
  },
  {
    applicant: {
      name: "Vikram Mehta",
      email: "vikram.mehta.seed@rinflow.dev",
      password: "Seed@1234",
    },
    loan: {
      education: "Graduate",
      self_employed: true,
      number_of_dependents: 3,
      income_annum: 2_000_000,
      loan_amount: 3_000_000,
      loan_term: 240,
      cibil_score: 790,
      residential_assets_value: 8_000_000,
      commercial_assets_value: 3_000_000,
      luxury_assets_value: 1_000_000,
      bank_asset_value: 2_000_000,
      debt: 200_000,
    },
  },
  // ── REJECT ───────────────────────────────────────────────────────────────
  {
    applicant: {
      name: "Suresh Kumar",
      email: "suresh.kumar.seed@rinflow.dev",
      password: "Seed@1234",
    },
    loan: {
      education: "Not Graduate",
      self_employed: true,
      number_of_dependents: 4,
      income_annum: 300_000,
      loan_amount: 2_000_000,
      loan_term: 120,
      cibil_score: 520,
      residential_assets_value: 500_000,
      commercial_assets_value: 0,
      luxury_assets_value: 100_000,
      bank_asset_value: 50_000,
      debt: 200_000,
    },
  },
  {
    applicant: {
      name: "Meena Devi",
      email: "meena.devi.seed@rinflow.dev",
      password: "Seed@1234",
    },
    loan: {
      education: "Not Graduate",
      self_employed: true,
      number_of_dependents: 5,
      income_annum: 240_000,
      loan_amount: 1_500_000,
      loan_term: 84,
      cibil_score: 555,
      residential_assets_value: 300_000,
      commercial_assets_value: 0,
      luxury_assets_value: 0,
      bank_asset_value: 30_000,
      debt: 150_000,
    },
  },
];

// ---------------------------------------------------------------------------

async function seed() {
  await mongoose.connect(`${process.env.MONGODB_URI}/rinflow`);
  console.log("Connected to MongoDB\n");

  for (let i = 0; i < APPLICANTS.length; i++) {
    const { applicant: applicantData, loan: loanData } = APPLICANTS[i];

    // 1. Upsert applicant (skip if email already exists)
    let applicant = await Applicant.findOne({ email: applicantData.email });
    if (!applicant) {
      applicant = await Applicant.create(applicantData);
      console.log(`[${i + 1}] Created applicant: ${applicant.name}`);
    } else {
      console.log(`[${i + 1}] Applicant already exists: ${applicant.name}`);
    }

    // 2. Create loan application
    const loan = await LoanApplication.create({
      Applicant_Id: applicant._id,
      Applicant_name: applicant.name,
      number_of_dependents: loanData.number_of_dependents,
      education: loanData.education,
      self_employed: loanData.self_employed,
      income_annum: loanData.income_annum,
      loan_amount: loanData.loan_amount,
      loan_term: loanData.loan_term,
      cibil_score: loanData.cibil_score,
      residential_assets_value: loanData.residential_assets_value,
      commercial_assets_value: loanData.commercial_assets_value,
      luxury_assets_value: loanData.luxury_assets_value,
      bank_asset_value: loanData.bank_asset_value,
      debt: loanData.debt,
      loan_status: "Pending",
    });
    console.log(`   Loan created: ${loan._id}`);

    // 3. Call Gemini and store result
    const applicationData = {
      dependents: loanData.number_of_dependents,
      education: loanData.education,
      selfEmployed: loanData.self_employed,
      incomeAnnum: loanData.income_annum,
      loanAmount: loanData.loan_amount,
      loanTerm: loanData.loan_term,
      cibilScore: loanData.cibil_score,
      resedentialAssetValue: loanData.residential_assets_value,
      commercialAssetValue: loanData.commercial_assets_value,
      luxuryAssetValue: loanData.luxury_assets_value,
      bankAssetValue: loanData.bank_asset_value,
      debt: loanData.debt,
    };

    const additionalData = computeLoanMetrics({ applicationData });

    try {
      console.log(`   Calling Gemini for ${applicant.name}...`);
      const aiAnalysis = await riskAssessment({ applicationData, additionalData, geminiConfig: GEMINI_CONFIG });
      loan.ai_analysis = aiAnalysis;
      await loan.save();
      console.log(`   AI result: ${aiAnalysis.recommendation} (${aiAnalysis.riskLevel} risk, ${aiAnalysis.confidence}% confidence)`);
    } catch (err) {
      console.error(`   Gemini failed for ${applicant.name}: ${err.message}`);
    }

    // 4. Delay before next Gemini call (skip delay after last entry)
    if (i < APPLICANTS.length - 1) {
      console.log(`   Waiting 15 seconds before next entry...\n`);
      await delay(15_000);
    }
  }

  console.log("\nSeeding complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
