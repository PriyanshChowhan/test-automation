import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function riskAssessment({
  applicationData,
  additionalData,
  geminiConfig,
}) {
  const genAI = new GoogleGenerativeAI(geminiConfig.geminiApi);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are an expert loan risk assessment analyst at a financial institution. Evaluate this loan application and provide a comprehensive, data-driven risk assessment.

APPLICANT PROFILE:
- Number of Dependents: ${applicationData.dependents}
- Education: ${applicationData.education}
- Employment Type: ${applicationData.selfEmployed ? "Self-Employed" : "Salaried Employee"}

FINANCIAL PROFILE:
- Annual Income: ₹${applicationData.incomeAnnum}
- Existing Debt: ₹${applicationData.debt}
- Loan Amount Requested: ₹${applicationData.loanAmount}
- Loan Term: ${applicationData.loanTerm} months
- CIBIL Score: ${applicationData.cibilScore}

ASSET PORTFOLIO:
- Residential Assets: ₹${applicationData.resedentialAssetValue}
- Commercial Assets: ₹${applicationData.commercialAssetValue}
- Luxury Assets: ₹${applicationData.luxuryAssetValue}
- Bank / Liquid Assets: ₹${applicationData.bankAssetValue}

COMPUTED FINANCIAL METRICS:
- Debt-to-Income Ratio: ${additionalData.debtToIncomeRatio}
- Loan-to-Income Ratio: ${additionalData.loanToIncomeRatio}
- Total Net Asset Value: ${additionalData.totalAssets}
- Asset Coverage Ratio: ${additionalData.assetCoverageRatio}x
- Estimated Monthly EMI: ${additionalData.estimatedEMI}

INDUSTRY BENCHMARKS:
- CIBIL Score: <600 Poor | 600-699 Fair | 700-749 Good | 750+ Excellent
- Debt-to-Income: <36% Healthy | 36-50% Moderate Risk | >50% High Risk
- Asset Coverage Ratio: >1.5x Strong | 1.0-1.5x Adequate | <1.0x Insufficient
- Loan-to-Income: <300% Manageable | 300-500% Stretched | >500% Overextended

Analyze all factors holistically. Give more weight to CIBIL score, debt-to-income ratio, and asset coverage. Self-employed applicants carry slightly higher income volatility risk.

Respond with ONLY a valid JSON object matching this exact schema:
{
  "riskLevel": "Low" | "Moderate" | "High",
  "recommendation": "Approve" | "Reject",
  "confidence": <integer 60-98>,
  "reasoning": "<2-3 sentences covering the decisive factors and overall picture>",
  "pros": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "cons": ["<concern 1>", "<concern 2>"],
  "keyRiskFactors": ["<risk 1>", "<risk 2>"],
  "suggestedConditions": "<conditions for approval such as collateral or co-applicant, or null if recommending rejection>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      riskLevel: "Moderate",
      recommendation: "Reject",
      confidence: 60,
      reasoning: "AI assessment could not be parsed. Manual review required.",
      pros: [],
      cons: ["AI response malformed — exercise caution"],
      keyRiskFactors: ["Unable to generate structured assessment"],
      suggestedConditions: null,
    };
  }
}
