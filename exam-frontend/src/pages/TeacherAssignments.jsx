import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  FaBookOpen, FaChevronRight, FaSearch, 
  FaGraduationCap, FaLayerGroup, FaCheckCircle, FaClock
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const TeacherAssignments = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Midnight Palette
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    success: "#4ade80",
    warning: "#fbbf24"
  };

  useEffect(() => {
    axios
      .get("http://10.119.220.26:8084/api/exams/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExams(res.data))
      .catch((err) => console.error("Failed to load assignments", err))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredExams = exams.filter(e => 
    (e.examName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.subjectName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem", color: colors.textMain }}>
      <Helmet><title>Assignments | Midnight Theme</title></Helmet>

      <style>{`
        /* Remove all default Bootstrap table styling */
        .midnight-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            color: ${colors.textMain};
        }

        .midnight-table thead th {
            background-color: rgba(15, 23, 42, 0.6); /* Slightly darker than card */
            color: ${colors.textMuted};
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 1rem 1.5rem;
            border-bottom: 2px solid ${colors.border};
            font-weight: 600;
        }

        .midnight-table tbody tr {
            transition: background-color 0.2s ease;
            cursor: pointer;
        }

        .midnight-table tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.03);
        }

        .midnight-table tbody td {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid ${colors.border};
            vertical-align: middle;
        }

        /* Last row shouldn't have a border */
        .midnight-table tbody tr:last-child td {
            border-bottom: none;
        }

        .search-container {
            background: ${colors.card};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            width: 100%;
            max-width: 400px;
        }

        .search-input {
            background: transparent;
            border: none;
            color: white;
            padding-left: 10px;
            width: 100%;
            outline: none;
        }

        .id-badge {
            background: rgba(129, 140, 248, 0.15);
            color: ${colors.primary};
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-weight: bold;
            font-size: 0.8rem;
        }
      `}</style>

      <div className="container-fluid">
        {/* TOP BAR */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Curriculum Assignments</h2>
            <p className="text-light mb-0">Manage and monitor your assigned examination modules.</p>
          </div>
          <div className="search-container">
            <FaSearch className="text-muted" />
            <input 
              className="search-input" 
              placeholder="Search by exam or subject..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CUSTOM MIDNIGHT TABLE CARD */}
        <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="midnight-table">
              <thead>
                <tr>
                  <th>Exam Details</th>
                  <th>Subject</th>
                
                  <th className="text-center">Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
             <tbody>
  {loading ? (
    <tr>
      <td colSpan="5" className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-primary"></div>
      </td>
    </tr>
  ) : (
    filteredExams.map((e, index) => (
      <tr key={`${e.examId}-${e.studentId}`} onClick={() => navigate(`/teacher/exam/${e.examId}/student/${e.studentId}`)}>
        <td>
          <div className="d-flex align-items-center gap-3">
            <div className="id-badge">{index + 1}</div>
            <div>
              <div className="fw-bold">{e.examName}</div>
              <div className="small font-monospace" style={{ color: colors.primary }}>
                <FaGraduationCap className="me-1" /> {e.studentName}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '6px', 
            fontSize: '0.8rem',
            background: 'rgba(129, 140, 248, 0.05)',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted
          }}>
            {e.subjectName}
          </span>
        </td>
      
        <td className="text-center">
          {/* THE UPDATED STATUS LOGIC */}
          {e.isCompleted ? (
            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
              <FaCheckCircle className="me-1" /> SUBMITTED
            </span>
          ) : (
            <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2">
              <FaClock className="me-1" /> PENDING
            </span>
          )}
        </td>
       <td className="text-end">
  <button 
    className="btn btn-sm btn-outline-primary border-0 d-inline-flex align-items-center"
    style={{ 
      color: colors.primary, 
      backgroundColor: "rgba(129, 140, 248, 0.1)",
      padding: "6px 12px",
      borderRadius: "8px"
    }}
    onClick={(event) => {
      event.stopPropagation(); // Stops the row click from firing
      navigate(`/teacher/exam/${e.examId}/attempts`);
    }}
  >
    VIEW ATTEMPTS <FaChevronRight size={12} className="ms-2" />
  </button>
</td>
      </tr>
    ))
  )}
</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;