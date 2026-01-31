import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck, ChevronRight, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Send Email to generate OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await axios.post('https://localhost:7240/api/auth/forgot-password', { email });
            
            // ✅ ADDED DEBUG LOG HERE
            console.log("Debug OTP from Server:", res.data.debug_otp); 

            setMessage({ text: "OTP sent! Check your email (or console for debug).", type: 'success' });
            setStep(2);
        } catch (err) {
            setMessage({ text: err.response?.data || "Email not found", type: 'danger' });
        }
        setLoading(false);
    };

    // Step 2: Verify OTP and Change Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('https://localhost:7240/api/auth/reset-password-otp', {
                email,
                otpCode,
                newPassword
            });
            alert("Password updated successfully!");
            navigate('/');
        } catch (err) {
            setMessage({ text: err.response?.data || "Invalid or Expired OTP", type: 'danger' });
        }
        setLoading(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-vh-100 d-flex align-items-center justify-content-center p-4"
            style={{ background: "radial-gradient(circle at top left, #1e293b, #0f172a)", fontFamily: "'Inter', sans-serif" }}
        >
            <Helmet><title>Reset Password | EDUMETRICS</title></Helmet>

            <div className="w-100" style={{ maxWidth: "440px", zIndex: 1 }}>
                <div className="card border-0 shadow-2xl p-4 p-md-5" style={{ borderRadius: "20px", background: "#ffffff" }}>
                    
                    <div className="mb-4 text-center">
                        <h2 className="fw-bold text-dark mb-1">{step === 1 ? "Forgot Password?" : "Verify OTP"}</h2>
                        <p className="text-secondary small">Follow the instructions sent to {email || 'your email'}</p>
                    </div>

                    {message.text && (
                        <div className={`alert border-0 d-flex align-items-center mb-4`} 
                             style={{ backgroundColor: message.type === 'danger' ? "#fff1f2" : "#f0fdf4", color: message.type === 'danger' ? "#e11d48" : "#16a34a", borderRadius: "10px" }}>
                            <AlertCircle size={18} className="me-2" />
                            <span className="small fw-medium">{message.text}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Email Address</label>
                                <div className="position-relative">
                                    <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"><Mail size={18} /></span>
                                    <input type="email" className="form-control form-control-lg ps-5 shadow-none" placeholder="name@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-dark w-100 py-3 fw-bold" style={{ backgroundColor: "#0f172a", borderRadius: "10px" }} disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">6-Digit Code</label>
                                <input type="text" className="form-control form-control-lg text-center fw-bold font-monospace shadow-none" maxLength="6" placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required style={{ letterSpacing: "4px", fontSize: "1.5rem" }} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">New Password</label>
                                <input type="password" className="form-control form-control-lg shadow-none" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-dark w-100 py-3 fw-bold mb-3" style={{ backgroundColor: "#0f172a", borderRadius: "10px" }} disabled={loading}>
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ForgotPassword;