import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  FaUsers, FaCheckCircle, FaExclamationCircle, 
  FaToggleOn, FaSpinner, FaLock, FaCalendarAlt 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import { getMyExams, getExamStudents, toggleAssignment } from "../api/examApi";

export default function MyExams() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const isDark = theme === "dark";
  
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamStudents, setSelectedExamStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await getMyExams();
      setExams(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleShowStudents = async (exam) => {
    setLoading(true);
    setSelectedExam(exam);
    try {
      const res = await getExamStudents(exam.examId);
      setSelectedExamStudents(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleUnassign = async (studentId) => {
    if (!selectedExam) return;
    if (new Date() >= new Date(selectedExam.startTime)) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Locked', 
        text: 'Exam is live. Enrollment is frozen.',
        background: "#1e293b", color: "#f8fafc", confirmButtonColor: "#818cf8"
      });
      return;
    }
    setTogglingId(studentId);
    try {
      await toggleAssignment({ examId: selectedExam.examId, studentId: studentId });
      setSelectedExamStudents(prev => prev.filter(s => s.userId !== studentId));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', background: "#1e293b", color: "#f8fafc" });
    } finally { setTogglingId(null); }
  };

  const isLocked = selectedExam && new Date() >= new Date(selectedExam.startTime);

  /* ================= THEME CONSTANTS ================= */
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#818cf8",
    border: "rgba(255, 255, 255, 0.05)",
    textMain: "#f8fafc",
    textMuted: "#94a3b8"
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem" }}>
      <Helmet><title>My Exams | EDUMETRICS</title></Helmet>

      <style>{`
        /* FORCING TABLE TRANSPARENCY & TEXT COLOR */
        .exam-table {
          --bs-table-bg: transparent !important;
          --bs-table-color: ${colors.textMain} !important;
          border-color: ${colors.border} !important;
        }

        .exam-table thead th {
          background-color: rgba(0,0,0,0.2) !important;
          color: ${colors.textMuted} !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 15px 20px;
          border: none;
        }

        .exam-table tbody td {
          background-color: transparent !important;
          color: ${colors.textMain} !important;
          border-bottom: 1px solid ${colors.border} !important;
          padding: 16px 20px;
        }

        .exam-table tbody tr:hover td {
          background-color: rgba(255,255,255,0.02) !important;
        }

        /* SIDEBAR CUSTOMIZATION */
        .student-sidebar {
          background-color: ${colors.card} !important;
          border: 1px solid ${colors.border} !important;
          border-radius: 16px;
          color: ${colors.textMain};
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>

      <div className="mb-4">
        <h3 className="fw-bold text-white">Examination Registry</h3>
        <p style={{ color: colors.textMuted }} className="small">View exam status and manage student permissions.</p>
      </div>

      <div className="row g-4">
        {/* EXAM LIST */}
        <div className={selectedExam ? "col-lg-7" : "col-12"}>
          <div style={{ backgroundColor: colors.card, borderRadius: '16px', border: `1px solid ${colors.border}` }} className="overflow-hidden shadow-sm">
            <div className="table-responsive">
              <table className="table exam-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Examination</th>
                    <th>Subject</th>
                    <th className="text-end pe-4">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e) => (
                    <tr key={e.examId}>
                      <td className="ps-4">
                        <div className="fw-bold">{e.examName}</div>
                        <div className="small opacity-50">ID: {e.examId}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: "rgba(129, 140, 248, 0.1)", color: colors.primary, border: `1px solid rgba(129, 140, 248, 0.2)` }}>
                          {e.subjectName}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm px-3" 
                          onClick={() => handleShowStudents(e)}
                          style={{ 
                            backgroundColor: selectedExam?.examId === e.examId ? colors.primary : "rgba(255,255,255,0.05)",
                            color: selectedExam?.examId === e.examId ? "#fff" : colors.textMain,
                            border: `1px solid ${selectedExam?.examId === e.examId ? colors.primary : "#475569"}`,
                            borderRadius: '8px'
                          }}
                        >
                          <FaUsers className="me-2" /> Students
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* STUDENT SIDEBAR */}
        {selectedExam && (
          <div className="col-lg-5">
            <div className="student-sidebar d-flex flex-column" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: colors.border }}>
                <div>
                  <h6 className="fw-bold mb-0">Assigned Students</h6>
                  <small style={{ color: colors.primary }}>{selectedExam.examName}</small>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setSelectedExam(null)}></button>
              </div>

              <div className="p-3">
                 <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ backgroundColor: isLocked ? "rgba(248, 113, 113, 0.1)" : "rgba(74, 222, 128, 0.1)" }}>
                    {isLocked ? <FaLock className="text-danger" /> : <FaCalendarAlt className="text-success" />}
                    <small style={{ color: isLocked ? "#f87171" : "#4ade80", fontWeight: '600' }}>
                      {isLocked ? "Enrollment Locked" : "Enrollment Open"}
                    </small>
                 </div>
              </div>

              <div className="flex-grow-1 overflow-auto custom-scrollbar px-3 pb-3">
                {loading ? (
                  <div className="h-100 d-flex align-items-center justify-content-center"><FaSpinner className="spinner-border text-primary" style={{border: 'none'}} /></div>
                ) : selectedExamStudents.length > 0 ? (
                  selectedExamStudents.map((s) => (
                    <div key={s.userId} className="d-flex justify-content-between align-items-center p-3 mb-2 rounded-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${colors.border}` }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "35px", height: "35px", backgroundColor: "#334155", fontSize: '0.8rem' }}>
                          {s.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="small fw-bold">{s.fullName}</div>
                          <span style={{ fontSize: '0.7rem' }} className={s.isCompleted ? "text-success" : "text-muted"}>
                            {s.isCompleted ? <><FaCheckCircle /> Completed</> : "Pending Completion"}
                          </span>
                        </div>
                      </div>
                      <div 
                        onClick={() => !isLocked && handleUnassign(s.userId)} 
                        style={{ cursor: isLocked ? "not-allowed" : "pointer", fontSize: '1.6rem' }}
                      >
                        {togglingId === s.userId ? (
                          <FaSpinner className="spinner-border spinner-border-sm text-primary" />
                        ) : (
                          <FaToggleOn style={{ color: isLocked ? "#475569" : "#4ade80", opacity: isLocked ? 0.3 : 1 }} />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 opacity-50 small">No students assigned.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}