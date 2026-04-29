import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Loan() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loan, setLoan] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLoanDetails() {
      if (!id) return;

      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/loanOfficer/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Request failed (${response.status})`);
        }
        setLoan(data.loan);
        setAiResponse(data.aiResponse);
      } catch (err) {
        setError(err.message || "Failed to load loan details");
      } finally {
        setLoading(false);
      }
    }
    fetchLoanDetails();
  }, [id]);

  const handleAccept = async () => {
    if (!id) return;
    const res = await fetch(`http://localhost:8000/api/v1/loanOfficer/accept/${id}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) nav(`/dashboard`, { replace: true });
    else setError(`Failed to accept loan (${res.status})`);
  };

  const handleReject = async () => {
    if (!id) return;
    const res = await fetch(`http://localhost:8000/api/v1/loanOfficer/reject/${id}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) nav(`/dashboard`, { replace: true });
    else setError(`Failed to reject loan (${res.status})`);
  };

  const handleReset = async () => {
    if (!id) return;
    const res = await fetch(`http://localhost:8000/api/v1/loanOfficer/reset/${id}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) nav(`/dashboard`, { replace: true });
    else setError(`Failed to reset loan (${res.status})`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";
      case "Approved":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading loan details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No loan data available
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar login={false} logout={true} signup={false} dashboard={true} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* GenAI Assessment Section */}
        {aiResponse ? (
          <div className="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                AI Risk Assessment
              </h3>
              <div className="flex items-center gap-3">
                {/* Risk level badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(
                    aiResponse.riskLevel
                  )}`}
                >
                  {aiResponse.riskLevel} Risk
                </span>
                {/* Recommendation badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    aiResponse.recommendation === "Approve"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {aiResponse.recommendation === "Approve"
                    ? "✓ Approve Recommended"
                    : "✗ Reject Recommended"}
                </span>
                {/* Confidence */}
                <span className="text-slate-300 text-xs">
                  {aiResponse.confidence}% confidence
                </span>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Reasoning */}
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Assessment
                </p>
                <p className="text-slate-800 leading-relaxed">
                  {aiResponse.reasoning}
                </p>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {aiResponse.pros?.map((pro, i) => (
                      <li key={i} className="text-sm text-green-800 flex gap-2">
                        <span className="mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    Concerns
                  </p>
                  <ul className="space-y-1">
                    {aiResponse.cons?.map((con, i) => (
                      <li key={i} className="text-sm text-red-800 flex gap-2">
                        <span className="mt-0.5">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Risk Factors */}
              {aiResponse.keyRiskFactors?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Key Risk Factors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.keyRiskFactors.map((factor, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Conditions */}
              {aiResponse.suggestedConditions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <p className="text-sm font-semibold text-blue-700 mb-1">
                    Suggested Conditions
                  </p>
                  <p className="text-sm text-blue-800">
                    {aiResponse.suggestedConditions}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-6 text-slate-500 text-center">
            AI assessment unavailable for this application.
          </div>
        )}

        {/* Loan Application Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Loan Application Details
            </h2>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan ID</p>
                  <p className="mt-1">{loan._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Applicant ID
                  </p>
                  <p className="mt-1">{loan.Applicant_Id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Education</p>
                  <p className="mt-1">{loan.education}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Employment Status
                  </p>
                  <p className="mt-1">
                    {loan.self_employed ? "Self Employed" : "Employed"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Dependents
                  </p>
                  <p className="mt-1">{loan.number_of_dependents}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    CIBIL Score
                  </p>
                  <p className="mt-1">{loan.cibil_score}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan Term</p>
                  <p className="mt-1">{loan.loan_term} months</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Current Status
                  </p>
                  <p
                    className={`mt-1 font-medium ${getStatusColor(
                      loan.loan_status
                    )}`}
                  >
                    {loan.loan_status}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Annual Income
                    </p>
                    <p className="mt-1">
                      ₹{loan.income_annum.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Loan Amount
                    </p>
                    <p className="mt-1">₹{loan.loan_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Current Debt
                    </p>
                    <p className="mt-1">₹{loan.debt.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Residential Assets
                    </p>
                    <p className="mt-1">
                      ₹{loan.residential_assets_value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Commercial Assets
                    </p>
                    <p className="mt-1">
                      ₹{loan.commercial_assets_value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Luxury Assets
                    </p>
                    <p className="mt-1">
                      ₹{loan.luxury_assets_value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              {loan.loan_status === "Pending" && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Accept Loan
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Reject Loan
                  </button>
                </div>
              )}

              {loan.loan_status !== "Pending" && (
                <button
                  onClick={handleReset}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors"
                >
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Loan;
