import { useEffect, useState } from "react";
import { FaUserGraduate, FaBookOpen, FaTrashAlt, FaExchangeAlt, FaLayerGroup } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getTeachers,
  getSubjects,
  assignSubjects,
  getAllAssignments,
  deleteAssignment,
} from "../api/teacherSubjectApi";

export default function AssignSubject() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const isDark = theme === "dark";

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tRes, sRes, aRes] = await Promise.all([
        getTeachers(),
        getSubjects(),
        getAllAssignments()
      ]);
      setTeachers(tRes.data || []);
      setSubjects(sRes.data || []);
      setAssignments(aRes.data || []);
    } catch (err) {
      console.error("Data loading failed", err);
    }
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleAssign = async () => {
    if (!selectedTeacher || selectedSubjects.length === 0) return alert("Select teacher and subjects");
    setLoading(true);
    try {
      await assignSubjects({ TeacherId: selectedTeacher, SubjectIds: selectedSubjects });
      setSelectedTeacher("");
      setSelectedSubjects([]);
      const updated = await getAllAssignments();
      setAssignments(updated.data);
    } catch (err) {
      alert("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId, subjectId) => {
    if (!window.confirm("Remove this mapping?")) return;
    try {
      await deleteAssignment(teacherId, subjectId);
      const updated = await getAllAssignments();
      setAssignments(updated.data);
    } catch (err) {
      alert("Delete failed");
    }
  };

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
      <Helmet><title>Curriculum Mapping | EDUMETRICS</title></Helmet>

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

        /* High Visibility Placeholder/Select */
        select.form-select, input::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
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

        .action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #334155;
          color: #f8fafc;
          transition: all 0.2s;
          border-radius: 8px;
        }

        .action-btn:hover {
          background: rgba(248, 113, 113, 0.1);
          border-color: #f87171;
          color: #f87171;
        }

        .form-select:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
          color: #fff;
        }
      `}</style>

      <div className="mb-4">
        <h3 className="fw-bold text-white">Curriculum Mapping</h3>
        <p style={{ color: colors.textMuted }} className="small">Assign subjects to faculty personnel</p>
      </div>

      {/* ➕ ASSIGNMENT FORM (Clean Design like Teachers.jsx) */}
      <div style={styles.card} className="p-4 mb-4 border-0">
        <div className="d-flex align-items-center gap-2 mb-3" style={{ color: colors.primary }}>
          <FaLayerGroup />
          <h6 className="mb-0 fw-bold">Create Subject Mapping</h6>
        </div>
        
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="small mb-2" style={{color: colors.textMuted}}>Faculty Member</label>
            <div className="position-relative">
              <FaUserGraduate className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: colors.textMuted }} />
              <select 
                className="form-select ps-5 shadow-none" 
                style={styles.input}
                value={selectedTeacher} 
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="" style={{backgroundColor: colors.bg}}>Choose Teacher...</option>
                {teachers.map((t) => (
                  <option key={t.userId} value={t.userId} style={{backgroundColor: colors.bg}}>{t.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-5">
            <label className="small mb-2" style={{color: colors.textMuted}}>Select Subjects ({selectedSubjects.length} selected)</label>
            <div className="dropdown">
              <button 
                className="form-select text-start ps-3 shadow-none w-100" 
                type="button" 
                style={styles.input}
                data-bs-toggle="dropdown" 
                data-bs-auto-close="outside"
              >
                {selectedSubjects.length === 0 ? "Pick subjects..." : `${selectedSubjects.length} Subjects Selected`}
              </button>
              <ul className="dropdown-menu dropdown-menu-dark shadow-lg border-secondary w-100" style={{backgroundColor: colors.card, maxHeight: '300px', overflowY: 'auto'}}>
                {subjects.map((s) => (
                  <li key={s.subjectId} className="dropdown-item py-2" onClick={() => toggleSubject(s.subjectId)} style={{cursor: 'pointer'}}>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={selectedSubjects.includes(s.subjectId)} readOnly />
                      <label className="form-check-label ms-2">{s.subjectName}</label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md-3">
            <button 
              className="btn w-100 fw-bold" 
              style={{ backgroundColor: colors.primary, color: "white", borderRadius: "10px", height: "42px" }}
              onClick={handleAssign}
              disabled={loading}
            >
              <FaExchangeAlt className="me-2" />
              {loading ? "Saving..." : "Map Subjects"}
            </button>
          </div>
        </div>
      </div>

      {/* 📋 TABLE SECTION */}
      <div style={styles.card} className="overflow-hidden border-0 shadow-lg">
        <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: colors.border }}>
            <FaBookOpen style={{ color: colors.primary }} />
            <h6 className="mb-0 fw-bold text-white">Active Curriculum Map</h6>
        </div>
        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th className="ps-4" width="80">No.</th>
                <th>Teacher Reference</th>
                <th>Assigned Subject</th>
                <th className="text-end pe-4" width="100">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5" style={{ color: colors.textMuted }}>No active mappings found.</td></tr>
              ) : (
                assignments.map((a, index) => (
                  <tr key={`${a.teacherId}-${a.subjectId}`}>
                    <td className="ps-4">
                      <span style={{ color: colors.textMuted, fontSize: "0.85rem", fontFamily: "monospace" }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-white">{a.teacherName}</div>
                      <div className="small" style={{ color: colors.textMuted }}>ID: #{a.teacherId}</div>
                    </td>
                    <td>
                      <span className="badge rounded-pill" style={{ 
                        backgroundColor: "rgba(129, 140, 248, 0.1)", 
                        color: colors.primary, 
                        border: "1px solid rgba(129, 140, 248, 0.2)",
                        padding: "0.6em 1.2em"
                      }}>
                        {a.subjectName}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm action-btn" onClick={() => handleDelete(a.teacherId, a.subjectId)}>
                        <FaTrashAlt />
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
  );
}