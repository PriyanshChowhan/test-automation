import React, { useState } from 'react';
import {useNavigate} from "react-router-dom"

const LandingPage = () => {
  const [copied, setCopied] = useState(false);
  const nav = useNavigate()
  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm i rinflow");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                rinflow
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => nav("/signup")} className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-pink-50 text-pink-700">
                Just Released: v1.0.2 
                <svg className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight">
              Automate your lending <br className="hidden sm:block" />
              <span className="text-pink-600">operations</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-slate-600">
              Transform your lending process with AI-powered automation. Streamline workflows, 
              reduce errors, and close loans faster than ever before.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Processing",
                description: "Automatically process and validate loan documents with advanced AI technology."
              },
              {
                title: "Integrated eSignatures",
                description: "Seamless DocuSign integration for automated contract signing and request management via email."
              },
              {
                title: "Automated Notifications",
                description: "Keep all parties informed with automatic email updates on loan status changes and progress."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;