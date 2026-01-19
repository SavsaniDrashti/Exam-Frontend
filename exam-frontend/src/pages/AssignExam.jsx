import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  FaUserCheck, FaClipboardList, FaSearch, FaUserGraduate, 
  FaArrowRight, FaCheckCircle, FaUndo 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { getMyExams, getAllStudents, assignExam } from "../api/examApi";
import Swal from "sweetalert2";

export default function AssignExam() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const isDark = theme === "dark";

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignForm, setAssignForm] = useState({ examId: "", studentIds: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eRes, sRes] = await Promise.all([getMyExams(), getAllStudents()]);
      setExams(eRes.data || []);
      const onlyStudents = sRes.data.filter(user => 
        (user.role || user.Role) === "Student"
      );
      setStudents(onlyStudents);
    } catch (err) {
      console.error("Data fetch failed", err);
      showToast('error', 'Fetch Error', 'Failed to retrieve records.');
    }
  };

  const showToast = (icon, title, text) => {
    Swal.fire({ 
      icon, title, text,
      background: "#1e293b",
      color: "#f8fafc",
      confirmButtonColor: "#818cf8",
      timer: 2500
    });
  };

  const handleToggleStudent = (id) => {
    const selected = [...assignForm.studentIds];
    const index = selected.indexOf(id);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(id);
    }
    setAssignForm({ ...assignForm, studentIds: selected });
  };

  const handleAssignExam = async () => {
    if (!assignForm.examId || assignForm.studentIds.length === 0) {
      showToast('warning', 'Selection Required', 'Please select an exam and at least one student.');
      return;
    }

    setLoading(true);
    try {
      await assignExam({
        examId: parseInt(assignForm.examId),
        studentIds: assignForm.studentIds.map((id) => parseInt(id)),
      });
      showToast('success', 'Assignment Complete', `Allocated to ${assignForm.studentIds.length} students.`);
      setAssignForm({ examId: "", studentIds: [] });
    } catch (err) {
      showToast('error', 'Process Failed', 'An error occurred during allocation.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= STYLE OVERRIDES ================= */
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#818cf8",
    success: "#4ade80",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    border: "rgba(255, 255, 255, 0.05)"
  };

  const styles = {
    container: { backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem" },
    card: {
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: "16px",
      color: colors.textMain,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
    },
    listArea: {
      maxHeight: "400px",
      overflowY: "auto",
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: "12px",
      border: `1px solid ${colors.border}`
    },
    item: (isSelected, activeColor) => ({
      padding: "14px 18px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: isSelected ? `rgba(${activeColor}, 0.1)` : "transparent",
      color: isSelected ? `rgb(${activeColor})` : colors.textMain,
      transition: "all 0.2s"
    })
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <Helmet><title>Assign Exams | EDUMETRICS</title></Helmet>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .form-control { background-color: #0f172a !important; border: 1px solid #334155 !important; color: #fff !important; }
        .form-control:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2) !important; }
        .hover-item:hover { background-color: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div className="mb-4">
        <h3 className="fw-bold text-white">Student Allocation</h3>
        <p style={{ color: colors.textMuted }} className="small">Assign assessments to students and manage enrollment windows.</p>
      </div>

      <div className="row g-4">
        {/* Step 1: Exam List */}
        <div className="col-lg-5">
          <div style={styles.card} className="p-4 h-100">
            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: colors.primary }}>
              <FaClipboardList /> 1. Choose Assessment
            </h6>
            <div style={styles.listArea} className="custom-scrollbar">
              {exams.map((e) => {
                const isSelected = assignForm.examId === e.examId;
                return (
                  <div 
                    key={e.examId} 
                    className="hover-item"
                    style={styles.item(isSelected, "129, 140, 248")}
                    onClick={() => setAssignForm({ ...assignForm, examId: e.examId })}
                  >
                    <span>{e.examName}</span>
                    {isSelected && <FaCheckCircle />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Student List */}
        <div className="col-lg-7">
          <div style={styles.card} className="p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: colors.success }}>
                <FaUserGraduate /> 2. Target Students
              </h6>
              <span className="badge rounded-pill" style={{ backgroundColor: "rgba(74, 222, 128, 0.1)", color: colors.success }}>
                {assignForm.studentIds.length} Selected
              </span>
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text bg-transparent border-end-0" style={{borderColor: '#334155'}}>
                <FaSearch className="text-muted" />
              </span>
              <input 
                type="text" 
                className="form-control shadow-none border-start-0" 
                placeholder="Search students..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={styles.listArea} className="custom-scrollbar">
              {filteredStudents.map((s) => {
                const isSelected = assignForm.studentIds.includes(s.userId);
                return (
                  <div 
                    key={s.userId} 
                    className="hover-item"
                    style={styles.item(isSelected, "74, 222, 128")}
                    onClick={() => handleToggleStudent(s.userId)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                           style={{width: "32px", height: "32px", backgroundColor: isSelected ? colors.success : "#334155", color: "#fff", fontSize: "0.75rem"}}>
                        {s.fullName[0].toUpperCase()}
                      </div>
                      <span className={isSelected ? 'fw-bold' : ''}>{s.fullName}</span>
                    </div>
                    {isSelected && <FaCheckCircle />}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 d-flex justify-content-between align-items-center border-top" style={{borderColor: colors.border}}>
              <button 
                className="btn btn-sm text-muted d-flex align-items-center gap-1 border-0"
                onClick={() => setAssignForm({ ...assignForm, studentIds: [] })}
              >
                <FaUndo /> Clear Selection
              </button>
              <button 
                className="btn px-4 py-2 fw-bold d-flex align-items-center gap-2"
                onClick={handleAssignExam}
                disabled={loading || !assignForm.examId || assignForm.studentIds.length === 0}
                style={{ backgroundColor: colors.primary, color: "#fff", borderRadius: "10px", border: "none" }}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <><FaUserCheck /> Deploy Now <FaArrowRight /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}