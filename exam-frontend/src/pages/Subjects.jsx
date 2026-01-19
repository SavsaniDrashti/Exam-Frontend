import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaBook, FaSearch, FaPlus } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../api/subjectApi";

export default function Subjects() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const isAdmin = localStorage.getItem("role") === "Admin";

  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [subjectName, setSubjectName] = useState("");

  /* ================= FETCH LOGIC ================= */
  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await getSubjects();
      setSubjects(res.data || []);
      setFilteredSubjects(res.data || []);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  /* ================= SEARCH LOGIC ================= */
  useEffect(() => {
    const s = search.toLowerCase();
    setFilteredSubjects(
      subjects.filter((sub) =>
        (sub.subjectName || "").toLowerCase().includes(s)
      )
    );
  }, [search, subjects]);

  /* ================= HANDLERS ================= */
  const resetForm = () => {
    setSubjectName("");
    setEditingId(null);
  };

  const handleEdit = (subject) => {
    setEditingId(subject.subjectId);
    setSubjectName(subject.subjectName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSubject(editingId, { subjectName });
      } else {
        await createSubject({ subjectName });
      }
      loadSubjects();
      resetForm();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await deleteSubject(id);
      loadSubjects();
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ================= THEME SYNCED WITH SIDEBAR ================= */
  const colors = {
    bg: "#0f172a",       // Midnight Slate
    card: "#1e293b",     // Slate 800
    primary: "#818cf8",  // Indigo
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
      <Helmet><title>Subjects | EDUMETRICS</title></Helmet>

      <style>{`
  /* Override Bootstrap Table Backgrounds */
  .custom-table {
    --bs-table-bg: transparent !important;
    --bs-table-border-color: rgba(255, 255, 255, 0.05) !important;
    --bs-table-color: #f8fafc !important;
  }
  
  .table > :not(caption) > * > * {
    background-color: transparent !important;
    box-shadow: none !important;
  }

  /* --- Placeholder Visibility Fix --- */
  input::placeholder, 
  textarea::placeholder,
  select.form-select {
    color: #94a3b8 !important; /* Slate-400 for high readability */
    opacity: 1 !important;     /* Ensure full opacity */
  }

  /* High contrast for focused state */
  .form-control:focus::placeholder {
    color: #cbd5e1 !important; /* Slate-300 when typing */
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
    background-color: transparent !important;
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
    background: rgba(129, 140, 248, 0.15);
    border-color: #818cf8;
    color: #818cf8;
  }

  .form-control:focus, .form-select:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
    color: #fff !important;
  }
`}</style>

      <div className="mb-4">
        <h3 className="fw-bold text-white">Subject Curriculum</h3>
        <p style={{ color: colors.textMuted }} className="small">Define and manage academic departments</p>
      </div>

      {/* ➕ ADD / EDIT SECTION */}
      {isAdmin && (
        <div style={styles.card} className="p-4 mb-4 border-0">
          <div className="d-flex align-items-center gap-2 mb-3" style={{ color: colors.primary }}>
            {editingId ? <FaEdit /> : <FaPlus />}
            <h6 className="mb-0 fw-bold">{editingId ? "Update Subject Name" : "Add New Subject"}</h6>
          </div>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-9">
              <input 
                className="form-control shadow-none" 
                style={styles.input} 
                placeholder="e.g. Advanced Mathematics" 
                value={subjectName} 
                onChange={(e) => setSubjectName(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn w-100 fw-bold" style={{ backgroundColor: colors.primary, color: "white", borderRadius: "10px" }}>
                {editingId ? "Save Changes" : "Create Subject"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-light" style={{ borderRadius: "10px" }} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 📋 TABLE SECTION */}
      <div style={styles.card} className="overflow-hidden border-0 shadow-lg">
        {/* Search Header */}
        <div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="position-relative" style={{ width: "350px" }}>
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: colors.textMuted }} />
            <input 
              className="form-control ps-5 shadow-none" 
              style={styles.input} 
              placeholder="Search subjects..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div style={{ color: colors.textMuted }} className="small">
            Records: <strong>{filteredSubjects.length}</strong>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th className="ps-4" width="180">ID Ref</th>
                <th>Subject Name</th>
                {isAdmin && <th className="text-end pe-4">Management</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm" style={{ color: colors.primary }}></div>
                    <span className="ms-2" style={{ color: colors.textMuted }}>Loading database...</span>
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-5" style={{ color: colors.textMuted }}>
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((s) => (
                  <tr key={s.subjectId}>
                    <td className="ps-4">
                      <span style={{ color: colors.textMuted, fontSize: "0.85rem", fontFamily: "monospace" }}>
                        #SUB-{s.subjectId}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded" style={{ backgroundColor: "rgba(129, 140, 248, 0.1)", color: colors.primary }}>
                          <FaBook />
                        </div>
                        <span className="fw-bold text-white">{s.subjectName}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="text-end pe-4">
                        <button className="btn btn-sm action-btn me-2" onClick={() => handleEdit(s)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm action-btn" onClick={() => handleDelete(s.subjectId)}>
                          <FaTrash style={{ color: "#f87171" }} />
                        </button>
                      </td>
                    )}
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