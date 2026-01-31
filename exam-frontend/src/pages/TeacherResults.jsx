import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  FaUserGraduate, FaFileInvoice, FaCheckCircle, 
  FaExclamationCircle, FaSearch, FaFilter, FaEye, FaEdit 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const TeacherResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { theme } = useOutletContext() || { theme: "dark" };
  const isDark = theme === "dark";
  const token = localStorage.getItem("token");

  // 🎨 Midnight Slate Palette
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8", // Indigo accent
    textMain: "#f8fafc",
    textlight: "#94a3b8",
    success: "#4ade80",
    warning: "#fbbf24",
    tableHead: "rgba(15, 23, 42, 0.6)"
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("https://localhost:7240/api/results/my-students-results", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setResults(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token, navigate]);

  const filteredResults = results.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem", color: colors.textMain }}>
      <Helmet><title>Global Performance | Midnight Theme</title></Helmet>

      <style>{`
        /* Midnight Table Styling */
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
        }
        .hover-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }

        /* Search & Filters */
        .search-box-midnight {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 10px;
          padding: 8px 15px;
          display: flex;
          align-items: center;
          width: 320px;
        }
        .search-box-midnight input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          margin-left: 10px;
          width: 100%;
        }

        /* Status Pills */
        .pill-midnight {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Action Buttons */
        .btn-action-midnight {
          background: transparent;
          border: 1px solid ${colors.border};
          color: ${colors.textMain};
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .btn-action-midnight:hover {
          border-color: ${colors.primary};
          color: ${colors.primary};
          background: rgba(129, 140, 248, 0.05);
        }
      `}</style>

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Global Performance Tracking</h2>
          <p className="text-light mb-0">Review and finalize scores across all assigned examinations.</p>
        </div>
        
        <div className="d-flex gap-2">
          <div className="search-box-midnight shadow-lg">
            <FaSearch className="text-light" />
            <input 
              type="text" 
              placeholder="Filter student or exam..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-action-midnight" style={{ height: '42px', width: '42px', padding: 0 }}>
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Attempts", val: results.length, icon: <FaUserGraduate/>, color: colors.primary },
          { label: "Finalized", val: results.filter(r => r.status === "Evaluated").length, icon: <FaCheckCircle/>, color: colors.success },
        ].map((stat, idx) => (
          <div className="col-md-3 col-6" key={idx}>
            <div className="p-3 shadow-lg d-flex align-items-center gap-3" 
                 style={{ backgroundColor: colors.card, borderRadius: "16px", border: `1px solid ${colors.border}` }}>
              <div className="p-3 rounded-circle" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <h4 className="fw-bold mb-0">{stat.val}</h4>
                <small className="text-light">{stat.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Results Table Card */}
      <div style={{ backgroundColor: colors.card, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden" }} className="shadow-lg">
        <div className="table-responsive">
          <table className="midnight-table">
            <thead>
              <tr>
                <th className="px-4">Student Identity</th>
                <th>Assessment Title</th>
                <th className="text-center">Final Score</th>
                <th className="text-center">Status</th>
                <th className="px-4 text-end">Action Area</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-5 text-light">Synchronizing performance data...</td></tr>
              ) : filteredResults.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-5 text-light">No records matched your query.</td></tr>
              ) : (
                filteredResults.map((r) => (
                  <tr key={r.studentExamId} className="hover-row">
                    <td className="px-4">
                      <div className="fw-bold" style={{ color: colors.primary }}>{r.studentName}</div>
                      <div className="text-light extra-small" style={{ fontSize: '0.7rem' }}>REF: {r.studentExamId}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FaFileInvoice className="text-light" />
                        <span className="fw-medium">{r.examName}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      {r.isCompleted ? (
                        <span className="fw-bold" style={{ fontSize: '1rem' }}>
                          {r.obtainedMarks} <span style={{ color: colors.textlight, fontWeight: 'normal' }}>/ {r.totalMarks}</span>
                        </span>
                      ) : (
                        <span className="text-light">---</span>
                      )}
                    </td>
                    <td className="text-center">
                      {r.status === "Evaluated" ? (
                        <div className="pill-midnight" style={{ background: 'rgba(74, 222, 128, 0.1)', color: colors.success }}>
                          <FaCheckCircle /> Finalized
                        </div>
                      ) : (
                        <div className="pill-midnight" style={{ background: 'rgba(251, 191, 36, 0.1)', color: colors.warning }}>
                          <FaExclamationCircle /> Pending
                        </div>
                      )}
                    </td>
                    <td className="px-4 text-end">
                      {r.isCompleted ? (
                        <button 
                          className="btn-action-midnight"
                          onClick={() => navigate(`/teacher/result/${r.studentExamId}`)}
                        >
                          <FaEye className="me-2" /> View Report
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm px-3 shadow-none fw-bold"
                          style={{ background: colors.primary, color: 'white', borderRadius: '8px' }}
                          onClick={() => navigate(`/teacher/review/${r.studentExamId}`)}
                        >
                          <FaEdit className="me-2" /> Grade Now
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

export default TeacherResults;