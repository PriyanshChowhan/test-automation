export default function computeLoanMetrics({applicationData}) {
    const { incomeAnnum, loanAmount, debt, resedentialAssetValue, commercialAssetValue, luxuryAssetValue, bankAssetValue, loanTerm } = applicationData;
  
    // Compute financial ratios
    const debtToIncomeRatio = (debt / incomeAnnum) * 100;
    const loanToIncomeRatio = (loanAmount / incomeAnnum) * 100;
    const totalAssets = resedentialAssetValue + commercialAssetValue + luxuryAssetValue + bankAssetValue;
    const assetCoverageRatio = totalAssets / loanAmount;
  
    // Approximate EMI Calculation (Assuming 10% interest rate for example)
    const interestRate = 10 / 100 / 12; // Monthly interest rate (10% per annum)
    const numMonths = loanTerm * 12;
    const emi = (loanAmount * interestRate * Math.pow(1 + interestRate, numMonths)) / (Math.pow(1 + interestRate, numMonths) - 1);
  
    return {
      debtToIncomeRatio: debtToIncomeRatio.toFixed(2) + "%",
      loanToIncomeRatio: loanToIncomeRatio.toFixed(2) + "%",
      totalAssets: `₹${totalAssets.toLocaleString()}`,
      assetCoverageRatio: assetCoverageRatio.toFixed(2),
      estimatedEMI: `₹${emi.toFixed(2)}`
    };
  }