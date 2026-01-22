import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaCode, FaAlignLeft, 
  FaSave, FaArrowLeft, FaTerminal, FaTrophy 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Swal from "sweetalert2";

const ReviewStudentAnswers = () => {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [answers, setAnswers] = useState([]);
  const [marks, setMarks] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🎨 Midnight Slate Palette
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8",
    textMain: "#f8fafc",
    textLight: "#94a3b8",
    success: "#4ade80",
    error: "#f87171",
    warning: "#fbbf24",
    inputBg: "#0f172a"
  };

  useEffect(() => {
    axios
      .get(`https://localhost:7240/api/results/student-answers/${studentExamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const data = res.data;
        let initialMarks = {};
        let score = 0;

        data.forEach((a) => {
          // Initialize marks from DB or default to 0
          const m = a.marksObtained ?? 0;
          initialMarks[a.studentAnswerId] = m;
          score += m;

          // Logic for MCQ auto-check visualization
          if (a.questionType === "MCQ") {
            a.isCorrect = a.selectedOption?.trim().toLowerCase() === a.correctOption?.trim().toLowerCase();
          }
        });

        setAnswers(data);
        setMarks(initialMarks);
        setTotal(score);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Fetch error:", err);
        Swal.fire({ icon: 'error', title: 'Fetch Failed', background: colors.card, color: colors.textMain });
      });
  }, [studentExamId, token]);

  const changeMarks = (id, val, max) => {
    let value = parseFloat(val) || 0;
    if (value > max) value = max; 
    if (value < 0) value = 0;

    const updated = { ...marks, [id]: value };
    setMarks(updated);
    
    // Recalculate Total
    const newTotal = answers.reduce((sum, a) => sum + (updated[a.studentAnswerId] || 0), 0);
    setTotal(newTotal);
  };

  const submitEvaluation = async () => {
    const payload = {
      studentExamId: Number(studentExamId),
      answers: answers.map((a) => ({
        studentAnswerId: a.studentAnswerId,
        marksObtained: marks[a.studentAnswerId] ?? 0,
        // Mark as correct if any marks are given for non-MCQ
        isCorrect: a.questionType === "MCQ" ? a.isCorrect : (marks[a.studentAnswerId] > 0),
      })),
    };

    try {
      const res = await axios.post("https://localhost:7240/api/results/evaluate", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ 
        icon: 'success', 
        title: 'Evaluation Saved', 
        text: `Final Score: ${res.data.totalScore}`,
        background: colors.card,
        color: colors.textMain,
        confirmButtonColor: colors.primary
      });
      navigate(-1);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Submission failed', background: colors.card, color: colors.textMain });
    }
  };

  const styles = {
    container: { backgroundColor: colors.bg, minHeight: "100vh", paddingBottom: "100px", color: colors.textMain },
    header: { position: "sticky", top: 0, zIndex: 100, backgroundColor: colors.card, borderBottom: `1px solid ${colors.border}`, backdropFilter: "blur(10px)" },
    qCard: (type, isCorrect) => ({
      backgroundColor: colors.card,
      borderRadius: "16px",
      border: `1px solid ${colors.border}`,
      borderLeft: `6px solid ${type === 'MCQ' ? (isCorrect ? colors.success : colors.error) : colors.primary}`,
      marginBottom: "24px",
    }),
    responseBox: { backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.textMain, padding: "15px", borderRadius: "12px", minHeight: "60px" },
    modelBox: { backgroundColor: "rgba(74, 222, 128, 0.05)", border: "1px solid rgba(74, 222, 128, 0.2)", color: colors.success, padding: "15px", borderRadius: "12px" },
    codeBox: { 
      backgroundColor: "#020617", 
      color: "#94a3b8", 
      padding: "20px", 
      borderRadius: "10px", 
      fontFamily: "'Fira Code', monospace", 
      fontSize: "0.85rem", 
      border: `1px solid ${colors.border}`,
      overflowX: "auto",
      whiteSpace: "pre-wrap"
    },
    markInput: { backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.textMain, textAlign: "center", fontWeight: "bold" }
  };

  if (loading) return <div style={styles.container} className="p-5 text-center font-monospace">ANALYZING_DATA...</div>;

  return (
    <div style={styles.container}>
      <Helmet><title>Review Submission | EDUMETRICS</title></Helmet>

      {/* HEADER */}
      <div style={styles.header} className="p-3 shadow-lg mb-4">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-light border-secondary"><FaArrowLeft /></button>
            <div>
              <h5 className="mb-0 fw-bold">Grading Terminal</h5>
              <small style={{ color: colors.textLight }}>Attempt ID: #{studentExamId}</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-4">
            <div className="text-end">
              <small style={{ color: colors.textLight }} className="d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Live Score</small>
              <h4 className="mb-0 fw-bold" style={{ color: colors.success }}><FaTrophy className="me-2"/>{total}</h4>
            </div>
            <button className="btn px-4 fw-bold shadow-sm" style={{ backgroundColor: colors.primary, color: 'white' }} onClick={submitEvaluation}>
              <FaSave className="me-2"/> Commit Grades
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {answers.map((a, index) => (
          <div key={a.studentAnswerId} style={styles.qCard(a.questionType, a.isCorrect)} className="p-4 shadow-sm">
            <div className="row">
              <div className="col-md-9 border-end border-secondary">
                <div className="d-flex justify-content-between mb-3">
                  <span className="badge" style={{ background: "rgba(129, 140, 248, 0.1)", color: colors.primary }}>Block {index + 1}</span>
                  <span className="small fw-bold" style={{ color: colors.textLight }}>
                    {a.questionType?.toUpperCase() === "MCQ" ? <><FaCheckCircle className="me-1"/> MCQ</> : 
                     (a.questionType?.toUpperCase() === "CODE" || a.questionType?.toUpperCase() === "CODING") ? <><FaCode className="me-1"/> Coding</> : 
                     <><FaAlignLeft className="me-1"/> Subjective</>}
                  </span>
                </div>
                <h6 className="fw-bold mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.5" }}>{a.questionText}</h6>

                <div className="row g-4">
                  {/* LEFT: STUDENT SIDE */}
                  <div className="col-md-6">
                    <label className="small fw-bold mb-2 d-block" style={{ color: colors.textLight }}>STUDENT_INPUT</label>
                    <div style={styles.responseBox}>
                      {(a.questionType?.toUpperCase() === "CODE" || a.questionType?.toUpperCase() === "CODING") ? (
                        /* FIX: Added multiple property checks for code to ensure it shows */
                        <pre style={styles.codeBox}>{a.codeAnswer || a.code || a.answerText || "// No solution submitted"}</pre>
                      ) : (
                        <p className="mb-0">{a.selectedOption || a.answerText || <em className="text-muted">No response</em>}</p>
                      )}
                    </div>
                    
                    {/* COMPILER OUTPUT LOG */}
                    {a.compilerOutput && (
                      <div className="mt-3 p-3 rounded bg-black border border-secondary">
                         <div className="text-uppercase mb-2" style={{fontSize: '0.65rem', color: colors.error}}><FaTerminal className="me-1"/> Execution_Log</div>
                         <pre className="mb-0 text-success small" style={{fontFamily: 'monospace'}}>{a.compilerOutput}</pre>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: MODEL SIDE */}
                  <div className="col-md-6">
                    <label className="small fw-bold mb-2 d-block" style={{ color: colors.success }}>EXPECTED_OUTPUT</label>
                    <div style={styles.modelBox}>
                      {a.questionType?.toUpperCase() === "MCQ" ? (
                        <div>
                          <span className="d-block small opacity-75">Correct Option:</span>
                          <span className="fw-bold fs-5">{a.correctOption}</span>
                        </div>
                      ) : (
                        <div>
                           <span className="d-block small opacity-75 mb-1">Reference Answer:</span>
                           <p className="mb-0 small" style={{lineHeight: '1.4'}}>{a.modelParagraphAnswer || "No model answer provided by faculty."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* GRADING SIDEBAR */}
              <div className="col-md-3 d-flex flex-column justify-content-center px-4">
                <div className="text-center">
                  <label className="small fw-bold mb-2 d-block" style={{ color: colors.textLight }}>ADJUST_MARKS</label>
                  <div className="input-group input-group-lg mb-2">
                    <input
                      type="number"
                      step="0.5"
                      style={styles.markInput}
                      className="form-control shadow-none"
                      value={marks[a.studentAnswerId]}
                      // MCQ is usually auto-graded, but we allow manual override if needed
                      onChange={(e) => changeMarks(a.studentAnswerId, e.target.value, a.maxMarks)}
                    />
                    <span className="input-group-text border-0" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: colors.textLight }}>/ {a.maxMarks}</span>
                  </div>
                  
                  {a.questionType === "MCQ" && (
                    <div className="mt-2 fw-bold small text-uppercase" style={{ color: a.isCorrect ? colors.success : colors.error }}>
                      {a.isCorrect ? "[ SYSTEM: MATCH ]" : "[ SYSTEM: MISMATCH ]"}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="progress" style={{ height: "4px", background: colors.bg }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${(marks[a.studentAnswerId] / a.maxMarks) * 100}%`, 
                          backgroundColor: (marks[a.studentAnswerId] / a.maxMarks) > 0.5 ? colors.success : colors.primary 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStudentAnswers;