import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  FaUserGraduate, FaClipboardCheck, FaRegClock, 
  FaEye, FaEdit, FaCheckCircle, FaSearch, FaArrowLeft 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const ExamAttempts = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { theme } = useOutletContext() || { theme: "dark" }; 
  
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  // 🎨 Midnight Slate Palette
  const colors = {
    bg: "#0f172a",          // Deep background
    card: "#1e293b",        // Slate card
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8",     // Indigo accent
    textMain: "#f8fafc",    // Off-white
    textlight: "#94a3b8",   // Slate gray
    success: "#4ade80",     // Emerald
    warning: "#fbbf24",     // Amber
    tableHead: "rgba(15, 23, 42, 0.6)"
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://localhost:7240/api/results/exam-attempts/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAttempts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [examId, token]);

  const filteredAttempts = attempts.filter(a => 
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem", color: colors.textMain }}>
      <Helmet><title>Student Submissions | Midnight Theme</title></Helmet>

      <style>{`
        /* Midnight Table Overrides */
        .midnight-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .midnight-table thead th {
          background-color: ${colors.tableHead};
          color: ${colors.textlight};
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1rem 1.5rem;
          border-bottom: 2px solid ${colors.border};
        }
        .midnight-table tbody td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid ${colors.border};
          vertical-align: middle;
          color: ${colors.textMain};
        }
        .hover-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        
        /* Custom Search Box */
        .search-container {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 10px;
          padding: 8px 15px;
          display: flex;
          align-items: center;
          width: 320px;
        }
        .search-input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          margin-left: 10px;
          width: 100%;
        }
        
        /* Midnight Buttons */
        .btn-midnight-outline {
          background: transparent;
          border: 1px solid ${colors.border};
          color: ${colors.textMain};
          transition: 0.2s;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
        }
        .btn-midnight-outline:hover {
          border-color: ${colors.primary};
          color: ${colors.primary};
          background: rgba(129, 140, 248, 0.05);
        }
      `}</style>

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-link p-0 text-decoration-none mb-2 small d-flex align-items-center gap-2 shadow-none"
            style={{ color: colors.primary }}
          >
            <FaArrowLeft size={12} /> Back to Exams
          </button>
          <h2 className="fw-bold mb-0">Student Submissions</h2>
          <p className="text-light small mb-0">Monitor and evaluate student performance for assessment #{examId}.</p>
        </div>

        <div className="search-container">
           <FaSearch className="text-light" />
           <input 
             type="text" 
             className="search-input" 
             placeholder="Search students..." 
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Submissions", val: attempts.length, icon: <FaUserGraduate/>, color: colors.primary },
          { label: "Graded", val: attempts.filter(a => a.status === "Evaluated").length, icon: <FaCheckCircle/>, color: colors.success },
          { label: "Pending", val: attempts.filter(a => a.status !== "Evaluated").length, icon: <FaRegClock/>, color: colors.warning }
        ].map((item, i) => (
          <div className="col-md-4" key={i}>
            <div className="p-3 d-flex align-items-center gap-3 shadow-lg" 
                 style={{ backgroundColor: colors.card, borderRadius: "16px", border: `1px solid ${colors.border}` }}>
              <div className="p-3 rounded-circle" style={{ background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <div>
                <h4 className="fw-bold mb-0">{item.val}</h4>
                <small className="text-light text-uppercase small fw-bold" style={{ fontSize: '0.65rem' }}>{item.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div style={{ backgroundColor: colors.card, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden" }} className="shadow-lg">
        <div className="table-responsive">
          <table className="midnight-table">
            <thead>
              <tr>
                <th>Student Identity</th>
                <th>Status</th>
                <th className="text-center">Performance</th>
                <th className="text-end">Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center p-5 text-light">Analyzing submission data...</td></tr>
              ) : filteredAttempts.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-5 text-light">No matching records found.</td></tr>
              ) : (
                filteredAttempts.map((a) => (
                  <tr key={a.studentExamId} className="hover-row">
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded-3 d-flex align-items-center justify-content-center fw-bold" 
                          style={{ width: "40px", height: "40px", backgroundColor: "rgba(129, 140, 248, 0.1)", color: colors.primary, border: `1px solid rgba(129, 140, 248, 0.2)` }}
                        >
                          {a.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold">{a.studentName}</div>
                          <div className="text-light" style={{ fontSize: "0.75rem" }}>UID: {a.studentExamId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {a.status === "Evaluated" ? (
                        <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(74, 222, 128, 0.1)", color: colors.success, border: "1px solid rgba(74, 222, 128, 0.2)" }}>
                          <FaCheckCircle className="me-1" /> Graded
                        </span>
                      ) : (
                        <span className="badge rounded-pill px-3 py-2" style={{ background: "rgba(251, 191, 36, 0.1)", color: colors.warning, border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                          <FaRegClock className="me-1" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="text-center fw-bold">
                       <span style={{ fontSize: "1.1rem", color: a.score >= 40 ? colors.primary : colors.warning }}>
                          {a.score !== undefined ? `${a.score}%` : "--"}
                       </span>
                    </td>
                    <td className="text-end">
  <div className="d-flex justify-content-end gap-2">
    {/* If evaluated, show View and Edit. If not, show Evaluate button */}
    {a.status === "Evaluated" ? (
      <>
        <button 
          className="btn-midnight-outline" 
          onClick={() => navigate(`/teacher/result/${a.studentExamId}`)}
          title="View final result summary"
        >
          <FaEye className="me-1" /> View
        </button>
        <button 
          className="btn-midnight-outline" 
          style={{ borderColor: colors.warning, color: colors.warning }}
          onClick={() => navigate(`/teacher/review/${a.studentExamId}`)}
          title="Re-grade or edit marks"
        >
          <FaEdit className="me-1" /> Edit
        </button>
      </>
    ) : (
      <button
        className="btn btn-sm px-4 shadow-sm"
        style={{ background: colors.primary, border: "none", color: 'white', borderRadius: '8px' }}
        onClick={() => navigate(`/teacher/review/${a.studentExamId}`)}
      >
        <FaClipboardCheck className="me-1" /> Evaluate
      </button>
    )}
  </div>
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

export default ExamAttempts;