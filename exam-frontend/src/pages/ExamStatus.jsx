import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCheckCircle, FaHourglassHalf, FaClipboardList, 
  FaClock, FaAward, FaSearch, FaInfoCircle 
} from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const ExamStatus = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // theme is handled via context, but we will force midnight colors here 
  // to match your previous StudentExam portal.
  const token = localStorage.getItem("token");

  // 🎨 Midnight Slate Palette
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8", 
    textMain: "#f8fafc",
    textLight: "#94a3b8",
    success: "#4ade80",
    warning: "#fbbf24",
    danger: "#f87171",
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7240/api/exams/status", 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExams(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to sync your examination records.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [token]);

  const filteredExams = exams.filter(e => 
    e.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: {
      backgroundColor: colors.bg,
      minHeight: "100vh",
      color: colors.textMain,
      padding: "2rem 1.5rem",
      transition: "all 0.3s ease"
    },
    card: (isCompleted) => ({
      backgroundColor: colors.card,
      borderRadius: "20px",
      border: `1px solid ${isCompleted ? `${colors.success}40` : colors.border}`,
      transition: "all 0.3s ease",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
      overflow: "hidden"
    }),
    iconBox: (isCompleted) => ({
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isCompleted ? `${colors.success}15` : `${colors.textLight}10`,
      color: isCompleted ? colors.success : colors.textLight,
      border: `1px solid ${isCompleted ? `${colors.success}30` : "transparent"}`
    })
  };

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{backgroundColor: colors.bg}}>
      <div className="spinner-border mb-3" style={{color: colors.primary}} role="status"></div>
      <p style={{color: colors.textLight}} className="fw-medium">Syncing Scorecard...</p>
    </div>
  );

  return (
    <div style={styles.container} className="status-page-wrapper">
      <Helmet><title>My Progress | Midnight EMS</title></Helmet>
      
      <div className="container-fluid">
        {/* Header & Filter */}
        <div className="row mb-5 align-items-center g-4">
          <div className="col-md-7">
            <h2 className="fw-bold mb-1">Examination Portfolio</h2>
            <p style={{color: colors.textLight}} className="mb-0">Track your academic submissions and performance metrics.</p>
          </div>
          <div className="col-md-5">
            <div className="input-group shadow-lg rounded-pill overflow-hidden border-0" style={{backgroundColor: colors.card}}>
              <span className="input-group-text border-0 ps-3" style={{backgroundColor: 'transparent'}}>
                <FaSearch style={{color: colors.textLight}} />
              </span>
              <input 
                type="text" 
                className="form-control border-0 shadow-none text-white" 
                placeholder="Search by exam name..." 
                style={{backgroundColor: 'transparent', padding: '0.75rem 0.5rem'}}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="alert border-0 shadow-sm rounded-4 d-flex align-items-center" 
               style={{backgroundColor: `${colors.danger}15`, color: colors.danger}}>
            <FaInfoCircle className="me-2" /> {error}
          </div>
        ) : (
          <div className="row g-4">
            {filteredExams.map((exam) => (
              <div key={exam.studentExamId} className="col-xl-4 col-lg-6 col-md-12">
                <div 
                  style={styles.card(exam.isCompleted)} 
                  className="card h-100 p-3"
                >
                  <div className="card-body p-2 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div style={styles.iconBox(exam.isCompleted)}>
                        <FaClipboardList size={22} />
                      </div>
                      <span className="badge rounded-pill px-3 py-2" style={{
                        background: exam.isCompleted ? `${colors.success}15` : `${colors.warning}15`,
                        color: exam.isCompleted ? colors.success : colors.warning,
                        border: `1px solid ${exam.isCompleted ? `${colors.success}30` : `${colors.warning}30`}`
                      }}>
                        {exam.isCompleted ? <><FaCheckCircle className="me-1"/> Finalized</> : <><FaHourglassHalf className="me-1"/> Pending</>}
                      </span>
                    </div>

                    <h5 className="fw-bold mb-3" style={{color: colors.textMain}}>{exam.examName}</h5>

                    <div className="mb-4 p-3 rounded-3" style={{background: 'rgba(15, 23, 42, 0.4)', border: `1px solid ${colors.border}`}}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <FaClock style={{color: colors.primary}} size={16}/>
                        <span style={{color: colors.textLight, fontSize: '0.9rem'}}>Duration: <b>{exam.duration} mins</b></span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <FaAward style={{color: colors.warning}} size={16}/>
                        <span style={{color: colors.textLight, fontSize: '0.9rem'}}>
                          Score: <span style={{color: exam.isCompleted ? colors.success : colors.warning, fontWeight: 'bold'}}>
                            {exam.isCompleted ? `${exam.obtainedMarks || 0} / ${exam.totalMarks}` : "Awaiting Review"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-top" style={{borderColor: colors.border}}>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-uppercase tracking-wider fw-bold" style={{fontSize: '0.65rem', color: colors.textLight}}>
                          {exam.isCompleted ? "Submission Confirmed" : "Evaluation In-Progress"}
                        </small>
                        {exam.isCompleted && (
                          <div style={{color: colors.success, fontSize: '0.85rem'}} className="fw-bold">Passed</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredExams.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-4 opacity-50">
                <FaClipboardList size={80} style={{color: colors.textLight}} />
            </div>
            <h5 style={{color: colors.textLight}}>No matching examinations found.</h5>
          </div>
        )}
      </div>

      <style>{`
       

        .status-card-hover:hover {
          transform: translateY(-5px);
          border-color: ${colors.primary}50 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
        }

        input::placeholder {
          color: ${colors.textLight} !important;
          opacity: 0.7;
        }

        .bg-success-subtle { background-color: ${colors.success}20 !important; }
        .bg-warning-subtle { background-color: ${colors.warning}20 !important; }
      `}</style>
    </div>
  );
};

export default ExamStatus;