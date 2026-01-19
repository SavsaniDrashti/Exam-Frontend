import React, { useEffect, useState } from "react";
import { 
  FaUsers, FaBook, FaChalkboardTeacher, 
  FaRegBell, FaHourglassHalf, FaCheckCircle, FaLaptopCode, FaArrowRight 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getUsers } from "../api/userApi";
import { getSubjects } from "../api/subjectApi";
import { getAllAssignments } from "../api/teacherSubjectApi";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const role = localStorage.getItem("role"); 
  const token = localStorage.getItem("token");
  const storedName = localStorage.getItem("fullName") || "User"; // Fallback if name isn't stored
  
  const isTeacher = role === "Teacher";
  const isAdmin = role === "Admin";
  const isStudent = role === "Student";

  const [stats, setStats] = useState({ 
    users: 0, subjects: 0, assignments: 0, 
    activeExams: 0, pendingGrading: 0, 
    completedExams: 0, overallGrade: "N/A" 
  });
  const [activities, setActivities] = useState([]);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        if (isStudent) {
          const [statusRes, resultsRes] = await Promise.all([
            axios.get("https://localhost:7240/api/student/exams/status", { headers }),
            axios.get("https://localhost:7240/api/results/my-results", { headers })
          ]);

          const completed = statusRes.data.filter(e => e.isCompleted).length;
          const pending = statusRes.data.filter(e => !e.isCompleted).length;
          const evaluated = resultsRes.data.filter(r => r.status === "Evaluated");
          const avg = evaluated.length > 0 
            ? (evaluated.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks), 0) / evaluated.length * 100).toFixed(1) + "%"
            : "N/A";

          setStats({ activeExams: pending, completedExams: completed, subjects: statusRes.data.length, overallGrade: avg });
          setActivities([
            { id: 1, type: 'Result', msg: `Result for ${evaluated[0]?.examName || 'recent exam'} is published.`, time: 'Recently', color: '#10b981' },
            { id: 2, type: 'Exam', msg: `You have ${pending} pending assessments.`, time: 'Action Req', color: '#f59e0b' }
          ]);

        } else if (isTeacher) {
          const res = await axios.get("https://localhost:7240/api/results/my-students-results", { headers });
          const myExams = await axios.get("https://localhost:7240/api/exams/assignments", { headers });

          setStats({
            users: [...new Set(res.data.map(r => r.studentName))].length,
            subjects: myExams.data.length,
            pendingGrading: res.data.filter(r => r.status === "Pending").length,
            activeExams: myExams.data.length 
          });

          setActivities([
            { id: 1, type: 'Exam', msg: 'New student attempt recorded.', time: 'Live', color: '#818cf8' },
            { id: 2, type: 'Grading', msg: `${res.data.filter(r => r.status === "Pending").length} papers pending.`, time: 'Urgent', color: '#ef4444' }
          ]);
        } else {
          const [u, s, a] = await Promise.all([getUsers(), getSubjects(), getAllAssignments()]);
          setStats({ users: u.data.length, subjects: s.data.length, assignments: a.data.length });
          setActivities([ { id: 1, type: 'System', msg: `Sync complete with ${u.data.length} users.`, time: 'Live', color: '#10b981' } ]);
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      }
    };
    loadDashboardData();
  }, [role, token]);

  /* ================= MODERN THEME CONSTANTS ================= */
  const colors = {
    bg: "#0f172a",          
    cardBg: "#1e293b",      
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    accent: "#6366f1",      
    border: "rgba(255, 255, 255, 0.06)"
  };

  const cardStyle = {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const getKpis = () => {
    if (isStudent) return [
      { label: "Active Exams", val: stats.activeExams, icon: <FaLaptopCode />, col: "#f59e0b" },
      { label: "Completed", val: stats.completedExams, icon: <FaCheckCircle />, col: "#10b981" },
      { label: "Total Modules", val: stats.subjects, icon: <FaBook />, col: "#818cf8" },
      { label: "Overall Grade", val: stats.overallGrade, icon: <FaCheckCircle />, col: "#6366f1" },
    ];
    if (isTeacher) return [
      { label: "My Students", val: stats.users, icon: <FaUsers />, col: "#3b82f6" },
      { label: "Exams Set", val: stats.subjects, icon: <FaBook />, col: "#818cf8" },
      { label: "To Grade", val: stats.pendingGrading, icon: <FaHourglassHalf />, col: "#ef4444" },
      { label: "Activity", val: "High", icon: <FaCheckCircle />, col: "#10b981" },
    ];
    return [
      { label: "Total Users", val: stats.users, icon: <FaUsers />, col: "#3b82f6" },
      { label: "Modules", val: stats.subjects, icon: <FaBook />, col: "#818cf8" },
      { label: "Faculty", val: stats.assignments, icon: <FaChalkboardTeacher />, col: "#10b981" },
      { label: "Status", val: "Active", icon: <FaCheckCircle />, col: "#6366f1" },
    ];
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: colors.bg, minHeight: "100vh", color: colors.textMain }}>
      <Helmet><title>{role} Portal | EDUMETRICS</title></Helmet>

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: "1.75rem", letterSpacing: "-0.5px" }}>
            {isStudent ? "Learning Dashboard" : isTeacher ? "Academic Overview" : "Command Center"}
          </h1>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            System monitoring for <span style={{ color: colors.accent, fontWeight: "600" }}>{storedName}</span>
          </p>
        </div>
        <div className="text-end d-none d-md-block" style={{ padding: "10px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: colors.accent, textTransform: "uppercase" }}>System Date</div>
          <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-4 mb-5">
        {getKpis().map((kpi, i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div style={cardStyle} className="h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ backgroundColor: `${kpi.col}20`, color: kpi.col, padding: '12px', borderRadius: '12px' }}>
                  {React.cloneElement(kpi.icon, { size: 22 })}
                </div>
              </div>
              <div style={{ color: colors.textMuted, fontSize: '0.8rem', fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>
                {kpi.label}
              </div>
              <h2 className="fw-bold mb-0" style={{ fontSize: "2rem" }}>{kpi.val}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div style={cardStyle} className="h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold m-0" style={{ fontSize: "1.1rem" }}>Activity Stream</h6>
            </div>
            
            <div className="activity-list">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="d-flex align-items-center justify-content-between p-3 mb-2" 
                       style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: act.color }}></div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.85rem" }}>{act.type} Update</div>
                        <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>{act.msg}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontWeight: "500" }}>{act.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <FaRegBell size={40} style={{ color: colors.border, marginBottom: "15px" }} />
                  <p style={{ color: colors.textMuted }}>No new activity.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${colors.cardBg} 0%, #1e1b4b 100%)` }} className="h-100">
            <h6 className="fw-bold mb-4" style={{ fontSize: "1.1rem" }}>Quick Actions</h6>
            <div className="d-grid gap-3">
              {isStudent ? (
                <>
                  <ActionButton onClick={() => navigate("/student/exam")} label="Launch Exam" color={colors.accent} />
                  <ActionButton onClick={() => navigate("/my-results")} label="View Gradebook" color="#10b981" />
                </>
              ) : isTeacher ? (
                <>
                  <ActionButton onClick={() => navigate("/my-exams")} label="Exam Builder" color={colors.accent} />
                  <ActionButton onClick={() => navigate("/results-exam")} label="Grade Papers" color="#10b981" />
                </>
              ) : (
                <>
                  <ActionButton onClick={() => navigate("/users")} label="User Directory" color={colors.accent} />
                  <ActionButton onClick={() => navigate("/subjects")} label="Course Manager" color="#8b5cf6" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, color }) {
  return (
    <button 
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        color: "#fff",
        padding: "14px 20px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: "600",
        fontSize: "0.9rem",
        cursor: "pointer"
      }}
    >
      {label}
      <FaArrowRight size={12} style={{ color: color }} />
    </button>
  );
}