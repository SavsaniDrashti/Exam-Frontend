import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { User, Mail, Lock, ChevronRight, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", passwordHash: "", role: "Student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/users", form);
      navigate("/"); 
    } catch (err) {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-vh-100 d-flex flex-column flex-lg-row bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Helmet><title>Create Account | EDUMETRICS EMS</title></Helmet>

      {/* LEFT PANEL: BRANDING (Consistent with Login) */}
      <div className="d-none d-lg-flex col-lg-6 flex-column justify-content-between p-5 text-white" 
           style={{ 
             background: "radial-gradient(circle at top left, #1e293b, #0f172a)", 
             position: "relative",
             overflow: "hidden" 
           }}>
        
        {/* Decorative Blur */}
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "500px", height: "500px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "50%", filter: "blur(100px)" }}></div>

        <div className="z-1">
          <div className="d-flex align-items-center gap-2 mb-5">
            <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px", background: "#6366f1" }}>
              <ShieldCheck size={24} />
            </div>
            <span className="fs-4 fw-bold tracking-tight">EDUMETRICS</span>
          </div>

          <div style={{ marginTop: "8vh" }}>
            <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: 1.2 }}>
              Join the future of <br />
              <span style={{ color: "#818cf8" }}>Academic Excellence.</span>
            </h1>
            <p className="lead opacity-75 mb-5" style={{ maxWidth: "450px" }}>
              Unlock powerful tools for institutional management, student tracking, and advanced reporting.
            </p>
            
            <div className="d-flex flex-column gap-3">
              {["Secure Data Encryption", "Role-based Access Control", "Instant Onboarding"].map((text) => (
                <div key={text} className="d-flex align-items-center opacity-75">
                  <CheckCircle2 size={20} className="me-2 text-indigo-400" />
                  <span className="small fw-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="z-1 opacity-50 small">
          © {new Date().getFullYear()} Edumetrics EMS. Professional Grade.
        </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5">
        <div className="w-100" style={{ maxWidth: "440px" }}>
          <div className="mb-5">
            <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>Create Account</h2>
            <p className="text-secondary">Join Edumetrics to start managing your data.</p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Name Input */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Full Name</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                  <User size={18} />
                </span>
                <input 
                  name="fullName" 
                  className="form-control form-control-lg ps-5 shadow-none" 
                  placeholder="John Doe" 
                  style={{ fontSize: "0.95rem", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Email Address</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                  <Mail size={18} />
                </span>
                <input 
                  name="email" 
                  type="email" 
                  className="form-control form-control-lg ps-5 shadow-none" 
                  placeholder="name@institution.edu" 
                  style={{ fontSize: "0.95rem", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Password</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                  <Lock size={18} />
                </span>
                <input 
                  name="passwordHash" 
                  type="password" 
                  className="form-control form-control-lg ps-5 shadow-none" 
                  placeholder="••••••••" 
                  style={{ fontSize: "0.95rem", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Role Selection (Improved Dropdown Styling) */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>I am a...</label>
              <select 
                name="role" 
                className="form-select form-select-lg shadow-none" 
                style={{ fontSize: "0.95rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", cursor: "pointer" }}
                onChange={handleChange}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-dark w-100 py-3 fw-bold d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: "#0f172a", 
                border: "none", 
                borderRadius: "10px", 
                transition: "all 0.2s ease" 
              }} 
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1e293b"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0f172a"}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>Create Account <ChevronRight size={18} className="ms-2" /></>
              )}
            </button>

            {error && (
              <div className="alert alert-danger mt-4 border-0 d-flex align-items-center" style={{ backgroundColor: "#fff1f2", color: "#e11d48", borderRadius: "10px" }}>
                <AlertCircle size={18} className="me-2" /> 
                <span className="small fw-medium">{error}</span>
              </div>
            )}
          </form>

          <p className="mt-5 text-center small text-muted">
            Already have an account? {" "}
            <Link to="/" className="text-primary fw-bold text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}