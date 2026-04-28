import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import LandPage from "./LandPage.jsx";
import LoginPage from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import ApplicationForm from "./LoanApplicationForm.jsx";
import Signup from "./signup.jsx";
import Loan from "./Loan.jsx";

function App() {
  return (
    <>
      {/* Global Spline 3D background — fixed, behind all pages */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Spline scene="https://prod.spline.design/xdAzH90q6Twd1Vpr/scene.splinecode" />
      </div>

      {/* All pages render above the Spline scene */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Router>
          <Routes>
            <Route path="/" element={<LandPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/loan/:id" element={<Loan />} />
            <Route path="/applicationform" element={<ApplicationForm />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
