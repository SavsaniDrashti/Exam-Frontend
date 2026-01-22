import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import { Helmet } from "react-helmet-async";
import { Mail, Lock, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login({ email, password });
      const routes = {
        Teacher: "/teacher/dashboard",
        Admin: "/dashboard",
        Student: "/student/dashboard",
      };
      navigate(routes[data.role] || "/student/dashboard");
    } catch (err) {
      setError("The email or password you entered is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row" style={{ backgroundColor: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
      <Helmet>
        <title>Login | EDUMETRICS EMS</title>
      </Helmet>

      {/* Left Panel: High-End Branding */}
      <div className="d-none d-lg-flex col-lg-7 flex-column justify-content-between p-5 text-white" 
           style={{ 
             background: "radial-gradient(circle at top left, #1e293b, #0f172a)", 
             position: "relative",
             overflow: "hidden" 
           }}>
        
        {/* Animated Background Blur */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "500px", height: "500px", background: "rgba(99, 102, 241, 0.15)", borderRadius: "50%", filter: "blur(100px)" }}></div>

        <div className="z-1">
          <div className="d-flex align-items-center mb-5">
            <div className="rounded-3 bg-primary d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
              <span className="fw-bold h4 mb-0">E</span>
            </div>
            <span className="ms-3 fs-4 fw-bold tracking-tight">EDUMETRICS</span>
          </div>

          <div style={{ marginTop: "10vh" }}>
            <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: 1.1 }}>
              Intelligence behind <br />
              <span style={{ color: "#818cf8" }}>every student.</span>
            </h1>
            <p className="lead opacity-75 mb-5" style={{ maxWidth: "480px" }}>
              Manage attendance, grades, and insights with the world's most intuitive education platform.
            </p>
            
            <div className="d-flex flex-column gap-3">
              {["Real-time Analytics", "Automated Grading", "Parent-Teacher Portal"].map((text) => (
                <div key={text} className="d-flex align-items-center opacity-75">
                  <CheckCircle2 size={20} className="me-2 text-indigo-400" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="z-1 opacity-50 small">
          © 2024 Edumetrics EMS. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Clean Login Form */}
      <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: "420px" }}>
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
            <p className="text-secondary">Please enter your account details.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>Email Address</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-control form-control-lg ps-5 shadow-none"
                  placeholder="name@institution.edu"
                  style={{ fontSize: "0.95rem", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>Password</label>
                <Link to="/forgot-password" size="sm" className="text-decoration-none small fw-bold text-primary">
                  Forgot Password?
                </Link>
              </div>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  className="form-control form-control-lg ps-5 shadow-none"
                  placeholder="••••••••"
                  style={{ fontSize: "0.95rem", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: "#4f46e5", 
                border: "none", 
                borderRadius: "10px",
                transition: "transform 0.2s ease" 
              }}
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.01)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>Sign In <ChevronRight size={18} className="ms-2" /></>
              )}
            </button>

            {error && (
              <div className="alert alert-danger mt-4 border-0 d-flex align-items-center" style={{ backgroundColor: "#fff1f2", color: "#e11d48", borderRadius: "10px" }}>
                <AlertCircle size={18} className="me-2" /> 
                <span className="small fw-medium">{error}</span>
              </div>
            )}
          </form>

          <div className="mt-5 text-center">
            <span className="text-muted small">New to Edumetrics? </span>
            <Link to="/register" className="text-decoration-none fw-bold text-dark small">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}