import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaUserTie, FaSearch, FaUserPlus } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../api/teacherApi";

export default function Teachers() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const isAdmin = localStorage.getItem("role") === "Admin";

  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "" });

  /* ================= FETCH LOGIC ================= */
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await getTeachers();
      setTeachers(res.data || []);
      setFilteredTeachers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeachers(); }, []);

  /* ================= SEARCH LOGIC ================= */
  useEffect(() => {
    const s = search.toLowerCase();
    setFilteredTeachers(
      teachers.filter(t => 
        (t.fullName || "").toLowerCase().includes(s) || 
        (t.email || "").toLowerCase().includes(s)
      )
    );
  }, [search, teachers]);

  /* ================= HANDLERS ================= */
  const resetForm = () => { setForm({ fullName: "", email: "" }); setEditingId(null); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (teacher) => {
    setEditingId(teacher.userId);
    setForm({ fullName: teacher.fullName, email: teacher.email });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editingId ? await updateTeacher(editingId, form) : await createTeacher(form);
      loadTeachers();
      resetForm();
    } catch (err) { alert("Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this teacher from the faculty?")) return;
    try {
      await deleteTeacher(id);
      loadTeachers();
    } catch (err) { alert("Delete failed"); }
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
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      backgroundColor: "rgba(129, 140, 248, 0.1)",
      color: colors.primary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "0.9rem",
      border: `1px solid rgba(129, 140, 248, 0.2)`
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Helmet><title>Faculty | EDUMETRICS</title></Helmet>

      <style>{`
        /* Remove Bootstrap Table BG Constraints */
        .custom-table {
          --bs-table-bg: transparent !important;
          --bs-table-color: #f8fafc !important;
        }
        .table > :not(caption) > * > * {
          background-color: transparent !important;
          box-shadow: none !important;
        }

        /* High Visibility Placeholders */
        input::placeholder {
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

        .custom-table td {
          padding: 16px 20px;
          vertical-align: middle;
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

        .form-control:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
          color: #fff;
        }
      `}</style>

      <div className="mb-4">
        <h3 className="fw-bold text-white">Faculty Directory</h3>
        <p style={{ color: colors.textMuted }} className="small">Academic personnel and staff management</p>
      </div>

      {/* ➕ ADD / EDIT FORM */}
      {/* {isAdmin && (
        <div style={styles.card} className="p-4 mb-4 border-0">
          <div className="d-flex align-items-center gap-2 mb-3" style={{ color: colors.primary }}>
            <FaUserPlus />
            <h6 className="mb-0 fw-bold">{editingId ? "Update Faculty Member" : "Register New Faculty"}</h6>
          </div>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-5">
              <input name="fullName" className="form-control shadow-none" style={styles.input} placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <input name="email" type="email" className="form-control shadow-none" style={styles.input} placeholder="Official Email Address" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn w-100 fw-bold" style={{ backgroundColor: colors.primary, color: "white", borderRadius: "10px" }}>
                {editingId ? "Save Changes" : "Register Teacher"}
              </button>
              {editingId && <button type="button" className="btn btn-outline-light" style={{ borderRadius: "10px" }} onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>
      )} */}

      {/* 📋 TABLE SECTION */}
      <div style={styles.card} className="overflow-hidden border-0 shadow-lg">
        {/* Filter Bar */}
        <div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="position-relative" style={{ width: "350px" }}>
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: colors.textMuted }} />
            <input className="form-control ps-5 shadow-none" style={styles.input} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="small px-3" style={{ color: colors.textMuted }}>
            Total Faculty: <strong className="text-white">{filteredTeachers.length}</strong>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table custom-table mb-0">
            <thead>
              <tr>
                <th className="ps-4" width="120">Staff ID</th>
                <th>Faculty Member</th>
                <th>Status</th>
                {isAdmin && <th className="text-end pe-4" width="150">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm" style={{ color: colors.primary }}></div>
                    <span className="ms-2" style={{ color: colors.textMuted }}>Loading faculty...</span>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5" style={{ color: colors.textMuted }}>
                    No faculty members found.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.userId}>
                    <td className="ps-4">
                      <span style={{ color: colors.textMuted, fontSize: "0.85rem", fontFamily: "monospace" }}>
                        #TCH-{t.userId}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div style={styles.avatar}>
                          {t.fullName ? t.fullName.charAt(0).toUpperCase() : <FaUserTie />}
                        </div>
                        <div>
                          <div className="fw-bold text-white">{t.fullName}</div>
                          <div className="small" style={{ color: colors.textMuted }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge rounded-pill" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.2)", fontSize: "0.65rem", padding: "0.5em 1em" }}>
                        Active
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-end pe-4">
                       
                        <button className="btn btn-sm action-btn" onClick={() => handleDelete(t.userId)}>
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