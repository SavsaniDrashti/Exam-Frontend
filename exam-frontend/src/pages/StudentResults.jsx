import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaGraduationCap, FaFilePdf, FaSearch, FaHistory, 
  FaCheckCircle, FaHourglassHalf 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const StudentResults = () => {
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8", 
    textMain: "#f8fafc",
    textLight: "#ffffff",
    success: "#4ade80",
    warning: "#fbbf24",
    tableHeader: "#334155"
  };

  useEffect(() => {
    axios.get("https://localhost:7240/api/results/my-results", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setMyResults(res.data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [token]);

  const filteredResults = myResults.filter(r => 
    r.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{backgroundColor: colors.bg}}>
      <div className="spinner-grow mb-3" style={{color: colors.primary}} role="status"></div>
      <p style={{color: colors.textLight}} className="fw-bold">Generating Transcript...</p>
    </div>
  );

  return (
    <div className="results-page-wrapper" style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <Helmet><title>Academic Transcript | Midnight EMS</title></Helmet>

      <div className="container-fluid">
        {/* Header Block */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-3" style={{color: colors.textMain}}>
              <FaGraduationCap style={{color: colors.primary}} /> Performance Ledger
            </h2>
            <p style={{color: colors.textLight}} className="small mb-0">Secure academic records and evaluation history.</p>
          </div>
          
          <div className="position-relative shadow-lg rounded-pill overflow-hidden" style={{ minWidth: "320px", backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{color: colors.textLight}} />
            <input 
              type="text" 
              className="form-control ps-5 py-2 border-0 shadow-none" 
              placeholder="Search evaluations..." 
              style={{ backgroundColor: "transparent", color: colors.textMain }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Professional Table */}
        <div className="shadow-lg" style={{ backgroundColor: colors.card, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table mb-0 custom-midnight-table">
              <thead>
                <tr style={{ backgroundColor: colors.tableHeader }}>
                  <th className="ps-4 py-3 border-0" style={{color: colors.textMain, fontSize: '0.75rem'}}>Examination Detail</th>
                  <th className="text-center border-0" style={{color: colors.textMain, fontSize: '0.75rem'}}>Status</th>
                  <th className="text-center border-0" style={{color: colors.textMain, fontSize: '0.75rem'}}>Score Ratio</th>
                  <th className="text-center border-0" style={{color: colors.textMain, fontSize: '0.75rem'}}>Percentage</th>
                  <th className="text-end pe-4 border-0" style={{color: colors.textMain, fontSize: '0.75rem'}}>Documentation</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 border-0 bg-transparent">
                       <FaHistory size={40} style={{color: colors.textLight, opacity: 0.3}} className="mb-3" /><br/>
                       <span style={{color: colors.textLight}}>No academic records found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((res) => {
                    const isEvaluated = res.status === "Evaluated";
                    const percentage = ((res.obtainedMarks / res.totalMarks) * 100).toFixed(1);

                    return (
                      <tr key={res.studentExamId}>
                        <td className="ps-4 py-4 bg-transparent border-0">
                          <div className="fw-bold" style={{color: colors.textMain}}>{res.examName}</div>
                          <div style={{color: colors.textLight, fontSize: '0.75rem'}}>REF-ID: {res.studentExamId.toString().padStart(6, '0')}</div>
                        </td>
                        <td className="text-center bg-transparent border-0">
                          <span className="badge rounded-pill px-3 py-2" style={{ 
                             fontSize: '0.7rem',
                             backgroundColor: isEvaluated ? `${colors.success}15` : `${colors.warning}15`,
                             color: isEvaluated ? colors.success : colors.warning,
                             border: `1px solid ${isEvaluated ? `${colors.success}30` : `${colors.warning}30`}`
                          }}>
                            {isEvaluated ? <><FaCheckCircle className="me-1"/> Published</> : <><FaHourglassHalf className="me-1"/> Reviewing</>}
                          </span>
                        </td>
                        <td className="text-center fw-bold bg-transparent border-0" style={{color: colors.textMain}}>
                          {isEvaluated ? `${res.obtainedMarks} / ${res.totalMarks}` : "--"}
                        </td>
                        <td className="text-center bg-transparent border-0">
                          {isEvaluated ? (
                            <div className="d-flex align-items-center justify-content-center gap-3">
                               <div className="progress flex-grow-1 d-none d-lg-flex" style={{ height: "6px", width: "80px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                                  <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: colors.primary }}></div>
                               </div>
                               <span className="fw-bold" style={{color: colors.textMain}}>{percentage}%</span>
                            </div>
                          ) : <span style={{color: colors.textLight}}>Pending</span>}
                        </td>
                        <td className="text-end pe-4 bg-transparent border-0">
                          {isEvaluated ? (
                            <button 
                              className="btn btn-sm d-inline-flex align-items-center gap-2 border-0 px-3 py-2"
                              style={{ backgroundColor: `${colors.primary}20`, color: colors.primary, borderRadius: '8px' }}
                              onClick={() => navigate(`/student/view-pdf/${res.studentExamId}`)}
                            >
                              <FaFilePdf /> Scorecard
                            </button>
                          ) : (
                            <span style={{color: colors.textLight, fontSize: '0.8rem'}} className="fst-italic opacity-50">Evaluating...</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        

        /* 2. Critical Fix: Remove Bootstrap's default background-color from rows */
        .custom-midnight-table tr, 
        .custom-midnight-table td, 
        .custom-midnight-table th {
            background-color: transparent !important;
           
            border-bottom: 1px solid ${colors.border} !important;
        }

        /* 3. Smooth Hover Effect */
        .custom-midnight-table tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.03) !important;
        }

        /* 4. Ensure inputs don't turn white on focus */
        input:focus {
           background-color: transparent !important;
           color: white !important;
           box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default StudentResults;