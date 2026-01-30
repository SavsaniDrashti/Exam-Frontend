import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaSearch, FaEye, FaPenNib, FaFileDownload, FaUserGraduate } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const AllResultsList = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { theme } = useOutletContext() || { theme: "dark" };
  const isDark = theme === "dark";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = () => {
    setLoading(true);
    axios.get("http://10.119.220.26:8084/api/results/all-student-results", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setResults(res.data || []);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  };

  const filteredResults = results.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= THEME SYNCED WITH TEACHERS.JSX ================= */
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#818cf8",
    textMuted: "#94a3b8",
    border: "rgba(255, 255, 255, 0.05)"
  };

  const styles = {
    pageWrapper: {
      backgroundColor: colors.bg,
      minHeight: "100vh",
      padding: "2rem",
      color: "#f8fafc"
    },
    card: {
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: "16px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
    },
    input: {
      backgroundColor: colors.bg,
      color: "#f8fafc",
      border: "1px solid #334155",
      borderRadius: "10px"
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Helmet><title>Academic Gradebook | EDUMETRICS</title></Helmet>

      <style>{`
        /* Global Table Overrides */
        .custom-table {
          --bs-table-bg: transparent !important;
          --bs-table-color: #f8fafc !important;
        }
        .table > :not(caption) > * > * {
          background-color: transparent !important;
          box-shadow: none !important;
        }

        .custom-table thead th {
          background-color: rgba(0,0,0,0.2) !important;
          color: #94a3b8 !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 18px 20px;
          border: none;
        }

        .custom-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: background 0.2s;
        }

        .custom-table tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }

        /* Search Input Focus */
        .form-control:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2) !important;
          color: #fff !important;
        }
        
        input::placeholder {
          color: #94a3b8 !important;
        }

        /* Action Buttons */
        .action-btn-view {
          background: rgba(129, 140, 248, 0.1);
          border: 1px solid rgba(129, 140, 248, 0.2);
          color: #818cf8;
          border-radius: 8px;
          padding: 6px 16px;
          transition: all 0.2s;
        }
        .action-btn-view:hover {
          background: #818cf8;
          color: white;
        }

        .action-btn-grade {
          background: #818cf8;
          border: 1px solid #818cf8;
          color: white;
          border-radius: 8px;
          padding: 6px 16px;
          transition: all 0.2s;
        }
        .action-btn-grade:hover {
          background: #6366f1;
          transform: translateY(-1px);
        }

        /* Progress Bar Styling */
        .custom-progress {
          background-color: rgba(255,255,255,0.05);
          border-radius: 10px;
          overflow: hidden;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-white mb-1">Academic Gradebook</h3>
          <p style={{ color: colors.textMuted }} className="small mb-0">Monitor student performance and evaluate submissions</p>
        </div>
        <button 
          className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: "10px" }}
        >
          <FaFileDownload /> Export Data
        </button>
      </div>

      <div style={styles.card} className="shadow-lg border-0 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: colors.border }}>
          <div className="position-relative" style={{ width: "400px" }}>
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: colors.textMuted, fontSize: "0.8rem" }} />
            <input 
              className="form-control ps-5 shadow-none border-0" 
              style={styles.input} 
              placeholder="Search by student or exam..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ color: colors.textMuted }} className="small">
            Records found: <span className="text-white fw-bold">{filteredResults.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Student Profile</th>
                <th>Exam Details</th>
                <th>Performance</th>
                <th>Status</th>
                <th className="text-end pe-4">Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5" style={{ color: colors.textMuted }}>Loading academic records...</td></tr>
              ) : filteredResults.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5" style={{ color: colors.textMuted }}>No matching records found.</td></tr>
              ) : (
                filteredResults.map((res) => (
                  <tr key={res.studentExamId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                             style={{width: "38px", height: "38px", backgroundColor: "rgba(129, 140, 248, 0.1)", color: colors.primary }}>
                          <FaUserGraduate />
                        </div>
                        <div>
                          <div className="fw-bold text-white">{res.studentName}</div>
                          <div style={{ color: colors.textMuted, fontSize: "0.75rem", fontFamily: "monospace" }}>REF: #{res.studentExamId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-white fw-semibold">{res.examName}</div>
                      <div className="small" style={{ color: colors.textMuted }}>Final Examination</div>
                    </td>
                    <td>
                      {res.isCompleted ? (
                        <div style={{ width: "160px" }}>
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.7rem" }}>
                            <span style={{ color: colors.textMuted }}>Score</span>
                            <span className="text-white">{Math.round((res.obtainedMarks/res.totalMarks)*100)}%</span>
                          </div>
                          <div className="progress custom-progress" style={{height: "6px"}}>
                            <div 
                              className="progress-bar" 
                              style={{
                                width: `${(res.obtainedMarks/res.totalMarks)*100}%`,
                                backgroundColor: colors.primary,
                                boxShadow: `0 0 8px ${colors.primary}44`
                              }}
                            ></div>
                          </div>
                          <div className="mt-1 small" style={{ color: colors.textMuted, fontSize: "0.7rem" }}>
                            {res.obtainedMarks} of {res.totalMarks} Points
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: colors.textMuted }} className="small fst-italic opacity-50">Pending Submission</span>
                      )}
                    </td>
                    <td>
                      {res.status === "Evaluated" ? (
                        <span className="badge rounded-pill" style={{ 
                          backgroundColor: "rgba(34, 197, 94, 0.1)", 
                          color: "#4ade80", 
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                          fontSize: "0.7rem",
                          padding: "5px 12px"
                        }}>
                          <span className="me-1">●</span> EVALUATED
                        </span>
                      ) : (
                        <span className="badge rounded-pill" style={{ 
                          backgroundColor: "rgba(234, 179, 8, 0.1)", 
                          color: "#facc15", 
                          border: "1px solid rgba(234, 179, 8, 0.2)",
                          fontSize: "0.7rem",
                          padding: "5px 12px"
                        }}>
                          <span className="me-1">●</span> NEEDS REVIEW
                        </span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      {res.isCompleted ? (
                        <button 
                          className="btn btn-sm action-btn-view"
                          onClick={() => navigate(`/teacher/result/${res.studentExamId}`)}
                        >
                          <FaEye className="me-2" /> View Report
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm action-btn-grade"
                          onClick={() => navigate(`/teacher/review/${res.studentExamId}`)}
                        >
                          <FaPenNib className="me-2" /> Grade Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllResultsList;