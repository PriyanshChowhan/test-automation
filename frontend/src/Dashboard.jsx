import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(null);
  const [appliedLoans, setAppliedLoans] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const nav = useNavigate();

  // Search / filter / sort state (loan officer only)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/getUser", {
          credentials: "include",
        });
        const data = await response.json();
        setUsername(data.data.user.name);
        setRole(data.data.role);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    if (role === "applicant") {
      async function fetchLoanData() {
        try {
          const response = await fetch(
            "http://localhost:8000/api/v1/applicant/loans",
            { credentials: "include" }
          );
          const data = await response.json();
          setAppliedLoans(data.loans);
        } catch (error) {
          console.error("Error fetching loan data:", error);
        }
      }
      fetchLoanData();
    } else if (role === "loanOfficer") {
      async function fetchAllLoans() {
        try {
          const response = await fetch(
            "http://localhost:8000/api/v1/loanOfficer/getAllLoans",
            { credentials: "include" }
          );
          const data = await response.json();
          setLoanApplications(data.data.loans);
        } catch (error) {
          console.error("Error fetching loan applications:", error);
        }
      }
      fetchAllLoans();
    }
  }, [role]);

  const handleApply = () => nav("/applicationForm");
  const handleReviewLoan = (loanId) => nav(`/loan/${loanId}`, { replace: true });

  // Stats derived from all loans (unfiltered)
  const stats = useMemo(() => {
    if (role !== "loanOfficer") return null;
    const total = loanApplications.length;
    const pending = loanApplications.filter((l) => l.loan_status === "Pending").length;
    const approved = loanApplications.filter((l) => l.loan_status === "Approved").length;
    const rejected = loanApplications.filter((l) => l.loan_status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [loanApplications, role]);

  // Filtered + sorted loans for loan officer
  const filteredLoans = useMemo(() => {
    if (role !== "loanOfficer") return loanApplications;

    let result = [...loanApplications];

    // Search by loan ID or applicant ID
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l._id.toLowerCase().includes(q) ||
          (l.Applicant_Id && l.Applicant_Id.toString().toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((l) => l.loan_status === statusFilter);
    }

    // Amount range filter
    if (minAmount !== "") {
      result = result.filter((l) => l.loan_amount >= Number(minAmount));
    }
    if (maxAmount !== "") {
      result = result.filter((l) => l.loan_amount <= Number(maxAmount));
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "amount_desc":
        result.sort((a, b) => b.loan_amount - a.loan_amount);
        break;
      case "amount_asc":
        result.sort((a, b) => a.loan_amount - b.loan_amount);
        break;
      case "cibil_desc":
        result.sort((a, b) => b.cibil_score - a.cibil_score);
        break;
      case "cibil_asc":
        result.sort((a, b) => a.cibil_score - b.cibil_score);
        break;
      default:
        break;
    }

    return result;
  }, [loanApplications, searchQuery, statusFilter, sortBy, minAmount, maxAmount, role]);

  if (!role)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );

  const LoanCard = ({ loan }) => (
    <div className="w-full p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-mono text-slate-500">
              #{loan._id}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Applied: {new Date(loan.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              loan.loan_status === "Approved"
                ? "bg-green-50 text-green-700"
                : loan.loan_status === "Pending"
                ? "bg-pink-50 text-pink-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {loan.loan_status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Amount Requested</p>
            <p className="text-lg font-semibold text-slate-900">
              ₹{loan.loan_amount?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Tenure</p>
            <p className="text-lg font-semibold text-slate-900">
              {loan.loan_term} months
            </p>
          </div>
        </div>

        {role === "loanOfficer" && (
          <>
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Annual Income</p>
                <p className="text-sm font-medium text-slate-800">
                  ₹{loan.income_annum?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">CIBIL Score</p>
                <p
                  className={`text-sm font-medium ${
                    loan.cibil_score >= 750
                      ? "text-green-600"
                      : loan.cibil_score >= 650
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {loan.cibil_score ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleReviewLoan(loan._id)}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition text-sm"
              >
                Review Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Navbar login={false} logout={true} signup={false} dashboard={false} />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">

          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome, {username || "Loading..."}
            </h1>
            {role === "applicant" && (
              <div className="relative group inline-block">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-pink-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                <button
                  onClick={handleApply}
                  className="relative bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition"
                >
                  Apply for New Loan
                </button>
              </div>
            )}
          </div>

          {/* Loan Officer Stats */}
          {role === "loanOfficer" && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total Applications", value: stats.total, color: "text-slate-900" },
                { label: "Pending", value: stats.pending, color: "text-pink-600" },
                { label: "Approved", value: stats.approved, color: "text-green-600" },
                { label: "Rejected", value: stats.rejected, color: "text-red-600" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl shadow-sm px-5 py-4 text-center"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Loan Officer Search & Filter Bar */}
          {role === "loanOfficer" && (
            <div className="bg-white rounded-xl shadow-sm px-5 py-4 mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search by Loan ID or Applicant ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_desc">Amount: High → Low</option>
                  <option value="amount_asc">Amount: Low → High</option>
                  <option value="cibil_desc">CIBIL: High → Low</option>
                  <option value="cibil_asc">CIBIL: Low → High</option>
                </select>
              </div>

              {/* Amount range filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 shrink-0">Loan Amount:</span>
                <input
                  type="number"
                  placeholder="Min (₹)"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="text-slate-400 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max (₹)"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                {(searchQuery || statusFilter !== "All" || minAmount || maxAmount) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("All");
                      setMinAmount("");
                      setMaxAmount("");
                    }}
                    className="text-sm text-pink-600 hover:underline ml-auto"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Result count */}
              <p className="text-xs text-slate-400">
                Showing {filteredLoans.length} of {loanApplications.length} applications
              </p>
            </div>
          )}

          {/* Loans list */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              {role === "applicant" ? "Your Loans" : "Loan Applications"}
            </h2>

            <div className="grid gap-6">
              {(role === "applicant" ? appliedLoans : filteredLoans)?.length > 0 ? (
                (role === "applicant" ? appliedLoans : filteredLoans).map(
                  (loan, index) => <LoanCard key={index} loan={loan} />
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-slate-600">
                    {role === "loanOfficer" && loanApplications.length > 0
                      ? "No applications match your filters."
                      : `No ${role === "applicant" ? "loans" : "loan applications"} found.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
