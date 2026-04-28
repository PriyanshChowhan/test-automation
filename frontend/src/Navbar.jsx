import { Button } from "@mui/material";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function Navbar({ login, logout, signup, dashboard }) {
  const nav = useNavigate();

  const handleLogin = () => {
    nav("/login");
  };
  const handleLogout = async () => {
    await axios.post(
      "http://localhost:8000/api/v1/logout",
      {},
      {
        withCredentials: true,
      }
    );
    nav("/");
  };
  const handleSignup = () => {
    nav("/signup");
  };

  const handleDashboard = () => {
    nav("/dashboard");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <Link to={"/"}>RinFlow</Link>
              </h1>
            </div>
            <div className="flex items-center">
              {dashboard && (
                <Button
                  variant="text"
                  onClick={handleDashboard}
                  sx={{ color: "#D81B60", fontWeight: "bold" }}
                  className="hover:bg-pink-50"
                >
                  Dashboard
                </Button>
              )}
              {login && (
                <Button
                  variant="text"
                  onClick={handleLogin}
                  sx={{ color: "#D81B60", fontWeight: "bold" }}
                  className="hover:bg-pink-50"
                >
                  Login
                </Button>
              )}
              {logout && (
                <Button
                  variant="text"
                  onClick={handleLogout}
                  sx={{ color: "#D81B60", fontWeight: "bold" }}
                  className="hover:bg-pink-50"
                >
                  Logout
                </Button>
              )}
              {signup && (
                <Button
                  variant="text"
                  onClick={handleSignup}
                  sx={{ color: "#D81B60", fontWeight: "bold" }}
                  className="hover:bg-pink-50"
                >
                  Signup
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
