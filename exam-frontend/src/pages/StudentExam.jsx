import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaClipboardCheck, FaClock, FaTrophy, 
  FaCalendarAlt, FaLock, FaHourglassHalf, FaArrowRight, FaExclamationCircle, FaCheckCircle
} from "react-icons/fa";

export default function StudentExam() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().getTime()); 
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#818cf8", 
    success: "#4ade80",
    danger: "#f87171",
    warning: "#fbbf24",
    textMain: "#f8fafc",
    textlight: "#94a3b8",
    border: "rgba(255, 255, 255, 0.1)"
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get("https://localhost:7240/api/student/exams", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExams(res.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();

    // Re-fetch data when window gets focus (user returns from exam tab)
    window.addEventListener('focus', fetchExams);

    const timer = setInterval(() => setCurrentTime(new Date().getTime()), 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', fetchExams);
    };
  }, [token]);

  const getCountdown = (targetDate) => {
    const target = new Date(targetDate).getTime();
    const diff = target - currentTime;
    if (diff <= 0) return null;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: colors.bg }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ background: colors.bg, color: colors.textMain }}>
      
      {/* Header Block */}
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4" style={{ borderColor: colors.border }}>
        <div>
          <h2 className="fw-bold mb-1">Available Assessments</h2>
          <p className="text-light mb-0">Total assigned: {exams.length}</p>
        </div>
        <div className="text-end">
          <div className="badge p-3 rounded-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="small text-light mb-1">CURRENT SYSTEM TIME</div>
            <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
              {new Date(currentTime).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {exams.length === 0 ? (
          <div className="text-center py-5 rounded-4 w-100" style={{ background: colors.card }}>
            <FaExclamationCircle size={40} className="text-light mb-3" />
            <h4 className="text-light">No exams found for your profile</h4>
          </div>
        ) : (
          exams.map((exam) => {
            const startTimestamp = new Date(exam.startTime).getTime();
            const endTimestamp = new Date(exam.endTime).getTime();
            
            // Default Status
            let status = { label: "EXPIRED", color: colors.danger, icon: <FaHourglassHalf />, canStart: false };

            // ================= STATUS LOGIC UPDATE =================
            if (exam.isCompleted) {
                // If the backend says IsCompleted is true
                status = { label: "SUBMITTED", color: colors.success, icon: <FaCheckCircle />, canStart: false };
            } else if (currentTime < startTimestamp) {
                status = { label: "UPCOMING", color: colors.primary, icon: <FaLock />, canStart: false };
            } else if (currentTime >= startTimestamp && currentTime <= endTimestamp) {
                status = { label: "LIVE", color: colors.success, icon: <FaClipboardCheck />, canStart: true };
            }

            const countdown = (status.label === "UPCOMING") 
              ? getCountdown(exam.startTime) 
              : (status.label === "LIVE") ? getCountdown(exam.endTime) : null;

            return (
              <div key={exam.studentExamId} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-lg position-relative" 
                     style={{ background: colors.card, borderRadius: "20px", overflow: "hidden", opacity: exam.isCompleted ? 0.8 : 1 }}>
                  
                  {/* Status Bar */}
                  <div style={{ height: "6px", background: status.color }}></div>
                  
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge py-2 px-3 rounded-pill text-uppercase" 
                            style={{ background: "rgba(129, 140, 248, 0.1)", color: colors.primary, fontSize: '0.65rem', letterSpacing: '1px' }}>
                        {exam.subjectName}
                      </span>
                      <div className="d-flex align-items-center gap-2" style={{ color: status.color }}>
                        {status.icon} <span className="fw-bold small">{status.label}</span>
                      </div>
                    </div>

                    <h4 className="fw-bold mb-4">{exam.examName}</h4>

                    <div className="p-3 rounded-4 mb-4" style={{ background: "rgba(15, 23, 42, 0.4)", border: `1px solid ${colors.border}` }}>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="small text-light">Total Marks</div>
                          <div className="fw-bold text-warning">{exam.totalMarks} Marks</div>
                        </div>
                        <div className="col-6">
                          <div className="small text-light">Duration</div>
                          <div className="fw-bold text-info">{exam.duration} Minutes</div>
                        </div>
                      </div>
                    </div>

                    {/* Countdown Timer Area */}
                    {countdown ? (
                      <div className="text-center p-3 rounded-4 mb-4" style={{ background: `${status.color}10`, border: `1px solid ${status.color}30` }}>
                        <div className="small opacity-75 mb-1" style={{ color: status.color }}>
                          {status.label === "UPCOMING" ? "TIME UNTIL START" : "TIME REMAINING"}
                        </div>
                        <div className="h4 fw-bold mb-0" style={{ color: status.color }}>{countdown}</div>
                      </div>
                    ) : (
                        status.label === "EXPIRED" ? (
                            <div className="text-center p-3 rounded-4 mb-4 bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 small fw-bold">
                                WINDOW CLOSED
                            </div>
                        ) : status.label === "SUBMITTED" && (
                            <div className="text-center p-3 rounded-4 mb-4 bg-success bg-opacity-10 text-success border border-success border-opacity-25 small fw-bold">
                                ASSESSMENT COMPLETED
                            </div>
                        )
                    )}

                    <div className="mt-auto">
                      <button 
                        disabled={!status.canStart || !exam.isActive || exam.isCompleted}
                        className={`btn w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all ${status.canStart && !exam.isCompleted ? 'btn-primary shadow-primary' : 'btn-outline-secondary'}`}
                        style={(status.canStart && !exam.isCompleted) ? { background: colors.primary, border: 'none' } : {}}
                        onClick={() => navigate(`/student/exam/${exam.examId}`)}
                      >
                        {exam.isCompleted ? (
                          <><FaCheckCircle /> SUBMITTED</>
                        ) : status.label === "LIVE" ? (
                          <>START ASSESSMENT <FaArrowRight /></>
                        ) : (
                          status.label
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .shadow-primary { box-shadow: 0 8px 20px -6px ${colors.primary}; }
        .transition-all { transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
      `}</style>
    </div>
  );
}