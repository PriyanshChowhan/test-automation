  import React, { useState } from "react";
  import axios from "axios";
  import { useForm } from "react-hook-form";
  import { useNavigate } from "react-router-dom";
  import Navbar from "./Navbar";

  const Login = () => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const nav = useNavigate();
    
    const onSubmit = async (data) => {
      setLoading(true);
      setMessage("");
      console.log(data);

      try {
        await axios.post("http://localhost:8000/api/v1/login", data, {
          withCredentials: true,
        });
        setMessage("Logged in");
        reset();
        nav("/dashboard");
      } catch (error) {
        setMessage("Error submitting application.");
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
                Welcome to <span className="bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">rinflow</span>
              </h2>
              <p className="mt-2 text-slate-600">Sign in to your account</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-xl p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    required
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
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
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div className="relative group pt-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition h-0"></div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full bg-slate-900  text-white py-3 rounded-lg hover:from-pink-700 hover:to-pink-600 transition font-medium"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              {message && (
                <div className={`mt-4 text-center text-sm ${
                  message.includes("Error") 
                    ? "text-pink-600" 
                    : "text-green-600"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  export default Login;
