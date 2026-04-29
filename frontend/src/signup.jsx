import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const LoanApplication = () => {
  const { register, handleSubmit, reset, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const nav = useNavigate();
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const validatePassword = (pwd) => {
    const errors = [];

    if (!pwd || pwd.length < 8 || pwd.length > 15) {
      errors.push("Password must be between 8-15 characters");
    }
    if (!/\d/.test(pwd)) {
      errors.push("Password must contain at least one digit");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[!@#$%\^&*()+=.\-]/.test(pwd)) {
      errors.push("Password must contain at least one special character (!@#$%^&*()+=^-.)");
    }
    if (/\s/.test(pwd)) {
      errors.push("Password must not contain any whitespace");
    }

    return errors;
  };

  React.useEffect(() => {
    if (password) {
      setPasswordErrors(validatePassword(password));
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  React.useEffect(() => {
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    } else {
      setConfirmPasswordError("");
    }
  }, [password, confirmPassword]);

  // ✅ FIXED FUNCTION ONLY
  const onSubmit = async (data) => {
    const errors = validatePassword(data.password);

    if (errors.length > 0) {
      setPasswordErrors(errors);
      setMessage("");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setMessage("");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://localhost:8000/api/v1/register", {
        ...data,
        role: "applicant",
      });

      // ✅ only on success
      setMessage("Application submitted successfully!");
      reset();
      nav("/login");

    } catch (error) {
      // ✅ show backend error properly
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error submitting application.";

      setMessage(backendMessage);
      // ❌ no navigation here
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar login={true} logout={false} signup={true} dashboard={false} />
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Join{" "}
              <span className="bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                ऋृणflow
              </span>
            </h2>
            <p className="mt-2 text-slate-600">
              Create your account to get started
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  required
                  className="w-full p-3 border border-slate-200 rounded-lg"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  required
                  className="w-full p-3 border border-slate-200 rounded-lg"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  required
                  className={`w-full p-3 border rounded-lg ${
                    passwordErrors.length > 0
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200"
                  }`}
                  placeholder="••••••••"
                />

                {passwordErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="text-xs font-medium text-pink-700 mb-2">
                      Password requirements not met:
                    </p>
                    <ul className="space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index} className="text-xs text-pink-600">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  required
                  className={`w-full p-3 border rounded-lg ${
                    confirmPasswordError
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200"
                  }`}
                  placeholder="••••••••"
                />

                {confirmPasswordError && (
                  <div className="mt-2 p-2 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="text-xs text-pink-600">
                      {confirmPasswordError}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    passwordErrors.length > 0 ||
                    confirmPasswordError
                  }
                  className="w-full bg-slate-900 text-white py-3 rounded-lg"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`mt-4 text-center text-sm ${
                  message.includes("Error") || message.includes("exists")
                    ? "text-pink-600"
                    : "text-green-600"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanApplication;