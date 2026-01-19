import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  FaFileDownload, FaArrowLeft, FaAward, FaUser, 
  FaCalendarCheck, FaUniversity, FaShieldAlt, FaCheckCircle, FaTimesCircle 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import html2pdf from "html2pdf.js";

const ViewResult = () => {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const token = localStorage.getItem("token");
  const { theme } = useOutletContext() || { theme: "dark" };

  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#6366f1", // Sleek Indigo
    accent: "#0ea5e9", // Sky Blue
    success: "#10b981",
    danger: "#f43f5e",
    textMuted: "#94a3b8",
    gold: "#fbbf24"
  };

  useEffect(() => {
    axios
      .get(`https://localhost:7240/api/results/summary/${studentExamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setResult(res.data))
      .catch(() => console.error("Error loading result details."));
  }, [studentExamId, token]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("print-area");
    const options = {
      margin: 0,
      filename: `Official_Transcript_${result?.studentName}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true, windowWidth: 850 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  if (!result) return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bg }}>
      <div className="spinner-grow" style={{ color: colors.primary }} role="status"></div>
    </div>
  );

  const isPassed = result.resultStatus === "PASSED";

  return (
    <div style={{ 
      backgroundColor: colors.bg, 
      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
      backgroundSize: '40px 40px',
      minHeight: "100vh", 
      padding: "3rem 0" 
    }}>
      <Helmet><title>Transcript | {result.studentName}</title></Helmet>

      <div className="container">
        {/* Modern Navbar-style Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-5 no-print">
          <button 
            className="btn d-flex align-items-center gap-2 border-0" 
            onClick={() => navigate(-1)}
            style={{ color: colors.textMuted, transition: '0.3s' }}
            onMouseOver={(e) => e.target.style.color = 'white'}
            onMouseOut={(e) => e.target.style.color = colors.textMuted}
          >
            <FaArrowLeft /> <span className="fw-bold">Dashboard</span>
          </button>
          
          <button 
            className="btn px-4 py-2 rounded-pill shadow-lg fw-bold d-flex align-items-center gap-2 hover-lift" 
            onClick={handleDownloadPDF}
            style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`, 
                color: 'white', 
                border: 'none' 
            }}
          >
            <FaFileDownload /> Export Official PDF
          </button>
        </div>

        {/* TRANSCRIPT PAPER */}
        <div 
          id="print-area" 
          className="bg-white mx-auto position-relative" 
          style={{ 
            maxWidth: "850px", 
            minHeight: "1100px",
            boxShadow: "0 0 50px rgba(0,0,0,0.3)",
            color: "#1e293b",
            overflow: "hidden"
          }}
        >
          {/* Subtle Watermark */}
          <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ pointerEvents: 'none', opacity: 0.03, zIndex: 0 }}>
             <FaUniversity size={500} />
          </div>

          {/* Top Design Bar */}
          <div style={{ height: "12px", background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${isPassed ? colors.success : colors.danger})` }}></div>

          <div className="p-5 position-relative" style={{ zIndex: 1 }}>
            
            {/* Header Section */}
            <div className="row mb-5">
              <div className="col-8">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="p-3 rounded-3" style={{ background: '#f1f5f9' }}>
                    <FaUniversity size={35} color={colors.primary} />
                  </div>
                  <div>
                    <h2 className="fw-black mb-0" style={{ letterSpacing: "-1.5px", color: "#0f172a" }}>
                      EDUMETRICS <span style={{ color: colors.primary }}>EMS</span>
                    </h2>
                    <div className="d-flex align-items-center gap-2">
                         <span className="badge bg-dark rounded-0" style={{ fontSize: '0.6rem' }}>OFFICIAL RECORD</span>
                         <span className="text-muted small fw-bold text-uppercase">Academic Year 2024-25</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-4 text-end">
                <p className="small text-muted mb-0 text-uppercase fw-bold">Verification ID</p>
                <p className="fw-mono fw-bold text-primary mb-0">{studentExamId.split('-')[0].toUpperCase()}-OFFICIAL</p>
              </div>
            </div>

            <hr className="my-4" style={{ opacity: 0.1 }} />

            {/* Title Section */}
            <div className="text-center my-3">
                <h6 className="text-primary fw-bold text-uppercase mb-2" style={{ letterSpacing: '3px' }}>Transcript of Results</h6>
                <h1 className="display-5 fw-black text-dark mb-2" style={{ letterSpacing: '-1px' }}>{result.examName}</h1>
                <div className={`d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill ${isPassed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span className="fw-bold text-uppercase small">{result.resultStatus}</span>
                </div>
            </div>

            {/* Student Info Card */}
            <div className="row g-0 rounded-4 overflow-hidden mb-5 border" style={{ backgroundColor: '#f8fafc' }}>
                <div className="col-md-7 p-4 border-end">
                    <div className="mb-4">
                        <label className="small text-uppercase fw-bold text-muted d-block mb-1">Candidate Name</label>
                        <h3 className="fw-bold mb-0 text-dark">{result.studentName}</h3>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <label className="small text-uppercase fw-bold text-muted d-block mb-1">Date of Issue</label>
                            <p className="fw-bold mb-0 small"><FaCalendarCheck className="me-2 text-primary"/>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="col-6">
                            <label className="small text-uppercase fw-bold text-muted d-block mb-1">Grade Earned</label>
                            <p className={`fw-bold mb-0 h5 ${isPassed ? 'text-success' : 'text-danger'}`}>{result.grade}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-5 p-4 bg-white d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="position-relative d-inline-block">
                            <svg width="120" height="120" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2.5"></circle>
                                <circle cx="18" cy="18" r="16" fill="none" stroke={isPassed ? colors.success : colors.danger} strokeWidth="2.5" 
                                    strokeDasharray={`${result.percentage}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
                            </svg>
                            <div className="position-absolute top-50 start-50 translate-middle">
                                <h3 className="fw-black mb-0">{result.percentage}%</h3>
                            </div>
                        </div>
                        <p className="small fw-bold text-muted text-uppercase mt-2 mb-0">Aggregate Score</p>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="mb-5">
                <h6 className="fw-bold text-uppercase text-muted mb-4 d-flex align-items-center gap-2">
                    <FaShieldAlt className="text-primary" /> Module Evaluation Details
                </h6>
                <div className="table-responsive">
                    <table className="table border">
                        <thead>
                            <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                                <th className="p-3 border-0">Assessment Component</th>
                                <th className="text-center p-3 border-0">Total Weight</th>
                                <th className="text-center p-3 border-0">Score Obtained</th>
                                <th className="text-center p-3 border-0">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="align-middle">
                                <td className="p-3 fw-bold">Primary Examination Structure</td>
                                <td className="text-center p-3">{result.totalMarks}</td>
                                <td className="text-center p-3 fw-bold">{result.obtainedMarks}</td>
                                <td className="text-center p-3">
                                    <span className={`badge rounded-pill ${isPassed ? 'bg-success' : 'bg-danger'}`}>
                                        {((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="2" className="p-3 text-end fw-black text-uppercase small">Cumulative Score Achieved</td>
                                <td className="text-center p-3 fw-black h4 mb-0 text-primary">{result.obtainedMarks}</td>
                                <td className="bg-white border-start-0"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Validation & Footer */}
            <div className="row mt-5 pt-5 align-items-end">
                
                <div className="col-12 text-end">
                    <div className="d-inline-block">
                       
                        <div style={{ width: "200px", height: "1px", background: "#000" }} className="mb-1"></div>
                        <p className="fw-bold mb-0">Registrar General</p>
                        <p className="small text-muted text-uppercase">Edumetrics Board of Governance</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Bottom Security Banner */}
          <div className="p-3 text-center" style={{ backgroundColor: "#0f172a", color: "rgba(255,255,255,0.7)", fontSize: "0.65rem", letterSpacing: "2px" }}>
             THIS IS A DIGITALLY VERIFIED DOCUMENT. SCAN QR FOR INSTANT VERIFICATION.
          </div>
        </div>
      </div>

      <style>{`
        .hover-lift:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        .fw-black { font-weight: 900; }
        .bg-success-subtle { background-color: #d1fae5; }
        .bg-danger-subtle { background-color: #fee2e2; }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          #print-area { 
            box-shadow: none !important; 
            width: 100% !important; 
            max-width: 100% !important;
            margin: 0 !important;
          }
          /* Ensure colors print correctly */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default ViewResult;