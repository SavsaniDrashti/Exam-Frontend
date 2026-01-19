import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  FaFileSignature, FaLayerGroup, FaTrophy, FaClock, 
  FaPlusCircle, FaCalendarAlt, FaTrash, FaEdit, FaLock, FaCheckCircle, FaTools 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { 
  getMySubjects, createExam, getTeacherExams, 
  updateExam, deleteExam, getExamById 
} from "../api/examApi";
import Swal from "sweetalert2";

export default function ExamManager() {
  const { theme } = useOutletContext() || { theme: "dark" };
  
  // State
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExamId, setCurrentExamId] = useState(null);

  // Form State
  const [examForm, setExamForm] = useState({
    examName: "", 
    subjectId: "", 
    totalMarks: "", 
    duration: "",   
    startTime: "", 
    endTime: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [subRes, examRes] = await Promise.all([getMySubjects(), getTeacherExams()]);
      setSubjects(subRes.data || []);
      setExams(examRes.data || []);
    } catch (err) {
      console.error("Data load failed", err);
    }
  };

  /* ================= THEME SYNCED PALETTE (DARK ONLY) ================= */
  const colors = {
    bg: "#0f172a",         // Midnight Slate
    card: "#1e293b",       // Slate 800
    primary: "#818cf8",     // Indigo
    textMain: "#f8fafc",    // Slate 50
    textMuted: "#94a3b8",   // Slate 400
    border: "rgba(255, 255, 255, 0.05)",
    inputBg: "#0f172a",
    tableHeader: "rgba(0,0,0,0.2)"
  };

  const styles = {
    pageWrapper: { 
      backgroundColor: colors.bg, 
      minHeight: "100vh", 
      padding: "2rem", 
      color: colors.textMain,
    },
    card: { 
      backgroundColor: colors.card, 
      border: `1px solid ${colors.border}`, 
      borderRadius: "16px", 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" 
    },
    input: { 
      backgroundColor: colors.inputBg, 
      color: colors.textMain, 
      border: "1px solid #334155", 
      borderRadius: "10px" 
    },
    iconGroup: { 
      backgroundColor: "rgba(255,255,255,0.03)", 
      border: "1px solid #334155", 
      color: colors.textMuted 
    }
  };

  /* ================= HANDLERS ================= */
  const handleEditClick = async (id) => {
    try {
      const res = await getExamById(id);
      const data = res.data;
      if (!data.isEditable) {
        Swal.fire({
          icon: 'warning',
          title: 'Configuration Locked',
          text: 'This exam has already commenced.',
          background: colors.card,
          color: colors.textMain,
          confirmButtonColor: colors.primary
        });
        return;
      }
      setExamForm({
        examName: data.examName,
        subjectId: data.subjectId,
        totalMarks: data.totalMarks,
        duration: data.duration,
        startTime: data.startTime.slice(0, 16),
        endTime: data.endTime.slice(0, 16)
      });
      setCurrentExamId(id);
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Could not fetch details", background: colors.card, color: colors.textMain });
    }
  };

  const handleSubmit = async () => {
    if (!examForm.examName || !examForm.subjectId || !examForm.totalMarks || !examForm.duration) {
      return Swal.fire({ icon: "warning", title: "Required", text: "Fill all fields", background: colors.card, color: colors.textMain });
    }
    setLoading(true);
    const payload = {
      ...examForm,
      subjectId: parseInt(examForm.subjectId),
      totalMarks: parseInt(examForm.totalMarks),
      duration: parseInt(examForm.duration),
      startTime: examForm.startTime,
      endTime: examForm.endTime
    };
    try {
      if (isEditing) {
        await updateExam(currentExamId, payload);
      } else {
        await createExam(payload);
      }
      Swal.fire({ 
        icon: 'success', 
        title: isEditing ? 'Updated' : 'Initialized', 
        timer: 1500, 
        showConfirmButton: false,
        background: colors.card,
        color: colors.textMain
      });
      resetForm();
      loadData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Submission failed", background: colors.card, color: colors.textMain });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Repository?",
      text: "This action will purge all data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f87171",
      cancelButtonColor: colors.textMuted,
      background: colors.card,
      color: colors.textMain,
      confirmButtonText: "Yes, delete"
    });
    if (result.isConfirmed) {
      try {
        await deleteExam(id);
        loadData();
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed", background: colors.card, color: colors.textMain });
      }
    }
  };

  const resetForm = () => {
    setExamForm({ examName: "", subjectId: "", totalMarks: "", duration: "", startTime: "", endTime: "" });
    setIsEditing(false);
    setCurrentExamId(null);
  };

  return (
    <div style={styles.pageWrapper}>
      <Helmet><title>Exam Management | EDUMETRICS</title></Helmet>

      <style>{`
        /* Syncing with Subjects Component UI */
        .form-control:focus, .form-select:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2) !important;
          color: #fff !important;
        }
        
        input::placeholder { color: #64748b !important; }
        .input-group-text { border-right: none !important; }
        .form-control { border-left: none !important; }
        
        .custom-table {
          --bs-table-bg: transparent !important;
          --bs-table-color: ${colors.textMain} !important;
          --bs-table-border-color: ${colors.border} !important;
        }

        .custom-table thead th {
          background-color: ${colors.tableHeader} !important;
          color: ${colors.textMuted} !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 18px 20px;
          border: none;
        }

        .custom-table tbody tr {
          border-bottom: 1px solid ${colors.border} !important;
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
      `}</style>

      <div className="mb-4">
        <h3 className="fw-bold text-white">Exam Repository</h3>
        <p style={{ color: colors.textMuted }} className="small">Configure assessment timelines and scoring parameters.</p>
      </div>

      {/* ➕ CONFIGURATION FORM */}
      <div style={styles.card} className="p-4 mb-5 border-0">
        <div className="d-flex align-items-center gap-2 mb-4" style={{ color: isEditing ? "#fbbf24" : colors.primary }}>
          {isEditing ? <FaTools /> : <FaPlusCircle />}
          <h6 className="mb-0 fw-bold">{isEditing ? "Update Exam Parameters" : "Initialize New Examination"}</h6>
        </div>
        
        <div className="row g-3">
          <div className="col-md-8">
            <label className="small mb-2" style={{color: colors.textMuted}}>Exam Title</label>
            <div className="input-group">
              <span className="input-group-text" style={styles.iconGroup}><FaFileSignature/></span>
              <input type="text" className="form-control shadow-none" style={styles.input} placeholder="e.g. Semester 1 Finals" value={examForm.examName} onChange={e => setExamForm({...examForm, examName: e.target.value})} />
            </div>
          </div>

          <div className="col-md-4">
            <label className="small mb-2" style={{color: colors.textMuted}}>Subject Assignment</label>
            <div className="input-group">
              <span className="input-group-text" style={styles.iconGroup}><FaLayerGroup/></span>
              <select className="form-select shadow-none" style={styles.input} value={examForm.subjectId} onChange={e => setExamForm({...examForm, subjectId: e.target.value})}>
                <option value="" style={{backgroundColor: colors.card}}>Select Subject...</option>
                {subjects.map(s => <option key={s.subjectId} value={s.subjectId} style={{backgroundColor: colors.card}}>{s.subjectName}</option>)}
              </select>
            </div>
          </div>

          <div className="col-md-3">
            <label className="small mb-2" style={{color: colors.textMuted}}>Total Points</label>
            <div className="input-group">
              <span className="input-group-text" style={styles.iconGroup}><FaTrophy/></span>
              <input type="number" className="form-control shadow-none" style={styles.input} placeholder="100" value={examForm.totalMarks} onChange={e => setExamForm({...examForm, totalMarks: e.target.value})} />
            </div>
          </div>

          <div className="col-md-3">
            <label className="small mb-2" style={{color: colors.textMuted}}>Duration (Mins)</label>
            <div className="input-group">
              <span className="input-group-text" style={styles.iconGroup}><FaClock/></span>
              <input type="number" className="form-control shadow-none" style={styles.input} placeholder="60" value={examForm.duration} onChange={e => setExamForm({...examForm, duration: e.target.value})} />
            </div>
          </div>

          <div className="col-md-3">
            <label className="small mb-2" style={{color: colors.textMuted}}>Start Window</label>
            <input type="datetime-local" className="form-control shadow-none" style={styles.input} value={examForm.startTime} onChange={e => setExamForm({...examForm, startTime: e.target.value})} />
          </div>

          <div className="col-md-3">
            <label className="small mb-2" style={{color: colors.textMuted}}>End Window</label>
            <input type="datetime-local" className="form-control shadow-none" style={styles.input} value={examForm.endTime} onChange={e => setExamForm({...examForm, endTime: e.target.value})} />
          </div>

          <div className="col-12 mt-4 d-flex gap-2">
            <button 
              className="btn py-2 px-4 fw-bold flex-grow-1" 
              style={{ backgroundColor: isEditing ? "#fbbf24" : colors.primary, color: isEditing ? "#000" : "#fff", borderRadius: "10px", border: "none" }} 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
              {isEditing ? "Save Modifications" : "Deploy Examination"}
            </button>
            {isEditing && (
              <button className="btn px-4 btn-outline-light" style={{ borderRadius: "10px" }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📋 EXAM LIST */}
      <div style={styles.card} className="overflow-hidden border-0 shadow-lg">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: colors.border }}>
            <div className="d-flex align-items-center gap-2">
              <FaCalendarAlt style={{ color: colors.primary }} />
              <h6 className="mb-0 fw-bold text-white">Institutional Exam Schedule</h6>
            </div>
            <div className="small" style={{ color: colors.textMuted }}>
              Total: <strong>{exams.length}</strong>
            </div>
        </div>
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Examination</th>
                <th>Evaluation</th>
                <th>Timeframe</th>
                <th>Status</th>
                <th className="text-end pe-4">Management</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5" style={{ color: colors.textMuted }}>No active exam records found.</td></tr>
              ) : exams.map(exam => (
                <tr key={exam.examId}>
                  <td className="ps-4">
                    <div className="fw-bold text-white">{exam.examName}</div>
                    <div className="small" style={{ color: colors.primary }}>{exam.subjectName}</div>
                  </td>
                  <td>
                    <span className="badge rounded-pill" style={{ backgroundColor: "rgba(129, 140, 248, 0.1)", color: colors.primary, border: "1px solid rgba(129, 140, 248, 0.2)" }}>
                      {exam.totalMarks} Points
                    </span>
                  </td>
                  <td>
                    <div className="small text-white opacity-75">{new Date(exam.startTime).toLocaleDateString()}</div>
                    <div className="small" style={{ color: colors.textMuted }}>{exam.duration} Min Duration</div>
                  </td>
                  <td>
                    {new Date() > new Date(exam.startTime) ? 
                      <span className="badge rounded-pill" style={{ backgroundColor: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)", fontSize: "0.7rem" }}>
                        <FaLock className="me-1"/> LOCKED
                      </span> : 
                      <span className="badge rounded-pill" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.2)", fontSize: "0.7rem" }}>
                        <FaCheckCircle className="me-1"/> ACTIVE
                      </span>
                    }
                  </td>
                  <td className="text-end pe-4">
                    <button className="btn btn-sm action-btn me-2" onClick={() => handleEditClick(exam.examId)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm action-btn" onClick={() => handleDelete(exam.examId)}>
                      <FaTrash style={{color: '#f87171'}} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}