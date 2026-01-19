import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ChevronRight, AlertCircle, ShieldCheck, HelpCircle, MessageSquare, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Answer & Reset
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Step 1: Request the security question from Backend
  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/get-security-question", { email });
      setQuestion(response.data.question);
      setStep(2);
    } catch (err) {
      setError("We couldn't find an account with that email address.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit answer and new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-with-answer", {
        email,
        answer,
        newPassword
      });
      alert("Password reset successful! Please sign in.");
      navigate("/");
    } catch (err) {
      setError("The security answer is incorrect. Please try again.");
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
      <Helmet><title>Reset Password | EDUMETRICS EMS</title></Helmet>

      {/* LEFT PANEL: BRANDING (Shared Style) */}
      <div className="d-none d-lg-flex col-lg-6 flex-column justify-content-between p-5 text-white" 
           style={{ background: "radial-gradient(circle at top left, #1e293b, #0f172a)", position: "relative", overflow: "hidden" }}>
        <div className="z-1">
          <div className="d-flex align-items-center gap-2 mb-5">
            <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px", background: "#6366f1" }}>
              <ShieldCheck size={24} />
            </div>
            <span className="fs-4 fw-bold tracking-tight">EDUMETRICS</span>
          </div>
          <div style={{ marginTop: "8vh" }}>
            <h1 className="display-4 fw-bold mb-4">Account <br /><span style={{ color: "#818cf8" }}>Recovery.</span></h1>
            <p className="lead opacity-75">Follow the steps to securely verify your identity and regain access to your dashboard.</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Link to="/" className="text-decoration-none text-muted small fw-bold d-flex align-items-center mb-4">
            <ArrowLeft size={16} className="me-2" /> Back to Sign In
          </Link>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <h2 className="fw-bold text-dark mb-1">Identify Account</h2>
                <p className="text-secondary mb-4">Enter your email to retrieve your security question.</p>
                
                <form onSubmit={handleFetchQuestion}>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Email Address</label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"><Mail size={18} /></span>
                      <input type="email" className="form-control form-control-lg ps-5 shadow-none" placeholder="name@institution.edu" style={{ borderRadius: "10px" }} 
                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-dark w-100 py-3 fw-bold" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : "Continue"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h2 className="fw-bold text-dark mb-1">Security Challenge</h2>
                <p className="text-secondary mb-4">Verify your identity by answering your secret question.</p>

                <form onSubmit={handleResetPassword}>
                  <div className="mb-3 p-3 bg-light rounded-3 border">
                    <label className="d-block small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: "0.6rem" }}>Your Question</label>
                    <span className="fw-medium text-dark">{question}</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Your Answer</label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"><MessageSquare size={18} /></span>
                      <input type="text" className="form-control form-control-lg ps-5 shadow-none" placeholder="Answer here..." style={{ borderRadius: "10px" }} 
                        value={answer} onChange={(e) => setAnswer(e.target.value)} required />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>New Password</label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"><Lock size={18} /></span>
                      <input type="password" className="form-control form-control-lg ps-5 shadow-none" placeholder="••••••••" style={{ borderRadius: "10px" }} 
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" style={{ backgroundColor: "#4f46e5" }} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : "Reset Password"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="alert alert-danger mt-4 border-0 d-flex align-items-center" style={{ backgroundColor: "#fff1f2", color: "#e11d48", borderRadius: "10px" }}>
              <AlertCircle size={18} className="me-2" /> 
              <span className="small fw-medium">{error}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}