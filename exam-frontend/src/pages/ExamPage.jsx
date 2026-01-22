import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

// Midnight Dark Custom Styles
const midnightTheme = {
  container: {
    backgroundColor: "#0b0e14",
    minHeight: "100vh",
    color: "#e0e0e0",
    paddingBottom: "60px"
  },
  card: {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
  },
  timerBadge: {
    backgroundColor: "#1f242d",
    border: "1px solid #f85149",
    color: "#f85149",
    fontWeight: "bold",
    padding: "8px 16px",
    borderRadius: "8px"
  },
  navButton: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "0.2s",
    border: "1px solid #30363d"
  }
};

export default function StudentExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // ================= 1. SECURITY LOCKS =================
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      alert("Navigation is disabled during the exam.");
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Warning: Leaving now will submit your exam.";
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // ================= 2. SUBMISSION LOGIC =================
  const submitExam = useCallback(async (isTimeOut = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isTimeOut) alert("Time Expired! Submitting automatically...");

    try {
      await axios.post(`https://localhost:7240/api/student/exam/${examId}/submit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!isTimeOut) alert("Exam submitted successfully!");
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      navigate("/student/exams", { replace: true });
    }
  }, [examId, token, navigate]);

  // ================= 3. FETCH DATA & HYDRATION =================
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const res = await axios.get(`https://localhost:7240/api/student/exam/${examId}/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setQuestions(data);

        const endTimeStr = data[0]?.endTime || data[0]?.EndTime;
        if (endTimeStr) {
          const calc = () => Math.max(0, Math.floor((new Date(endTimeStr) - new Date()) / 1000));
          if (calc() <= 0) { submitExam(true); return; }
          setTimeLeft(calc());
          timerRef.current = setInterval(() => {
            const rem = calc();
            setTimeLeft(rem);
            if (rem <= 0) { clearInterval(timerRef.current); submitExam(true); }
          }, 1000);
        }

        const initial = {};
        data.forEach(q => {
          const existing = q.studentAnswers?.[0] || {}; 
          initial[q.questionId] = { 
            selectedOption: existing.selectedOption || "", 
            paragraphAnswer: existing.paragraphAnswer || "", 
            code: existing.code || "", 
            output: existing.compilerOutput || "" 
          };
        });
        setAnswers(initial);

      } catch (err) {
        navigate("/student/exams", { replace: true });
      }
    };
    fetchExamData();
    return () => clearInterval(timerRef.current);
  }, [examId, token, navigate, submitExam]);

  // ================= 4. SAVE PROGRESS =================
  const saveAnswerToDB = async (qId, payload) => {
    try {
      await axios.post(`https://localhost:7240/api/student/exam/${examId}/submit-answer`,
        { questionId: qId, ...payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error("Autosave failed", err); }
  };

  // Helper to check if a question is answered
  const isAnswered = (qId) => {
    const ans = answers[qId];
    return ans?.selectedOption || ans?.paragraphAnswer?.trim() || ans?.code?.trim();
  };

  if (questions.length === 0) return <div style={midnightTheme.container} className="d-flex align-items-center justify-content-center font-monospace">SYTEM_BOOTING...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.questionId] || {};
  

  return (
    <div style={midnightTheme.container}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 mb-3 sticky-top shadow-lg" style={{ backgroundColor: "#161b22", borderBottom: "1px solid #30363d", zIndex: 1000 }}>
        <h5 className="m-0 text-info font-monospace">SESSION_X: {examId}</h5>
        <div style={midnightTheme.timerBadge}>
          {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : "00:00"}
        </div>
      </div>

      <div className="container">
        {/* QUESTION JUMP GRID */}
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#161b22", border: "1px solid #30363d" }}>
          <small className="text-secondary font-monospace d-block mb-2 text-uppercase">Navigation Grid</small>
          <div className="d-flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <div
                key={q.questionId}
                onClick={() => setCurrentQuestionIndex(idx)}
                style={{
                  ...midnightTheme.navButton,
                  backgroundColor: currentQuestionIndex === idx ? "#1f6feb" : isAnswered(q.questionId) ? "#238636" : "#0d1117",
                  color: currentQuestionIndex === idx || isAnswered(q.questionId) ? "white" : "#8b949e",
                  fontWeight: currentQuestionIndex === idx ? "bold" : "normal",
                  borderColor: currentQuestionIndex === idx ? "#58a6ff" : "#30363d"
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Main Question Card */}
        <div className="card p-4" style={midnightTheme.card}>
          <div className="d-flex justify-content-between mb-3">
            <span className="badge bg-dark border border-secondary text-secondary">BLOCK {currentQuestionIndex + 1} / {questions.length}</span>
            <span className="text-warning small fw-bold font-monospace">● AUTO_SYNC: ENABLED</span>
          </div>
          
          <h4 className="mb-4" style={{ color: "#f0f6fc", lineHeight: "1.6" }}>{currentQuestion.questionText}</h4>

          {/* MCQ UI */}
          {currentQuestion.questionType?.toUpperCase() === "MCQ" && (
            <div className="list-group">
              {["A", "B", "C", "D"].map(opt => (
                <label key={opt} className={`list-group-item list-group-item-action mb-2 rounded border ${currentAnswer.selectedOption === opt ? 'border-primary bg-primary bg-opacity-10 text-white' : 'bg-dark text-secondary border-secondary'}`} style={{ cursor: 'pointer' }}>
                  <input type="radio" className="form-check-input me-3"
                    name={`q-${currentQuestion.questionId}`}
                    checked={currentAnswer.selectedOption === opt}
                    onChange={() => {
                      setAnswers(prev => ({ ...prev, [currentQuestion.questionId]: { ...currentAnswer, selectedOption: opt } }));
                      saveAnswerToDB(currentQuestion.questionId, { selectedOption: opt });
                    }}
                  />
                  <span className="fw-bold me-2 text-info">{opt}</span> {currentQuestion[`option${opt}`]}
                </label>
              ))}
            </div>
          )}

          {/* PARAGRAPH UI */}
          {currentQuestion.questionType?.toUpperCase() === "PARAGRAPH" && (
            <textarea 
              className="form-control bg-dark text-white border-secondary font-monospace" 
              rows="8" 
              style={{ resize: "none", outline: "none" }}
              placeholder="System awaiting documentation input..."
              value={currentAnswer.paragraphAnswer || ""}
              onChange={(e) => setAnswers(prev => ({
                ...prev, [currentQuestion.questionId]: { ...currentAnswer, paragraphAnswer: e.target.value }
              }))}
              onBlur={() => saveAnswerToDB(currentQuestion.questionId, { paragraphAnswer: currentAnswer.paragraphAnswer })}
            />
          )}

        {/* CODING UI */}
{(currentQuestion.questionType?.toUpperCase() === "CODE" || currentQuestion.questionType?.toUpperCase() === "CODING") && (
  <div className="rounded overflow-hidden border border-secondary">
    <Editor 
      height="380px" 
      theme="vs-dark" 
      language={currentQuestion.codingLanguage?.toLowerCase() || "cpp"}
      value={currentAnswer.code || ""}
      options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
      onChange={(val) => {
        setAnswers(prev => ({
          ...prev, [currentQuestion.questionId]: { ...currentAnswer, code: val }
        }));
      }}
      onMount={(editor) => {
        // Save to DB when student leaves the code editor area
        editor.onDidBlurEditorText(() => {
          saveAnswerToDB(currentQuestion.questionId, { 
            code: currentAnswer.code, 
            compilerOutput: currentAnswer.output 
          });
        });
      }}
    />
    <div className="bg-dark p-2 d-flex justify-content-between border-top border-secondary">
      <button 
        className="btn btn-outline-info btn-sm font-monospace" 
        disabled={loading} 
        onClick={async () => {
          setLoading(true);
          try {
            const res = await axios.post(`https://localhost:7240/api/student/exam/${examId}/run-code`, 
              { QuestionId: currentQuestion.questionId, Code: currentAnswer.code },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const logs = res.data.output;

            // 1. Update UI
            setAnswers(prev => ({ 
              ...prev, 
              [currentQuestion.questionId]: { ...currentAnswer, output: logs } 
            }));

            // 2. Persist to DB immediately so the teacher sees the latest output
            await saveAnswerToDB(currentQuestion.questionId, { 
              code: currentAnswer.code, 
              compilerOutput: logs 
            });

          } catch (err) { 
            alert("Execution error: Ensure Judge0 service is active."); 
          }
          setLoading(false);
        }}
      >
        {loading ? ">_ EXECUTING..." : ">_ RUN_MODULE"}
      </button>
      <span className="text-secondary small font-monospace pt-1" style={{fontSize: '0.65rem'}}>
        {loading ? "BUSY" : "READY"}
      </span>
    </div>
    <div className="bg-black p-3 text-success font-monospace" style={{ minHeight: "100px", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
      <div className="text-secondary border-bottom border-secondary pb-1 mb-2" style={{ fontSize: "0.7rem" }}>LOG_STREAM</div>
      {currentAnswer.output || "No execution data found in current session."}
    </div>
  </div>
)}
        </div>

        {/* Footer Navigation */}
        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-outline-secondary px-4 font-monospace" disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(i => i - 1)}>PREVIOUS</button>
          
          {currentQuestionIndex === questions.length - 1 ?
            <button className="btn btn-danger px-5 shadow font-monospace fw-bold" onClick={() => submitExam(false)}>FINAL_LOGOUT</button> :
            <button className="btn btn-primary px-5 font-monospace" onClick={() => setCurrentQuestionIndex(i => i + 1)}>NEXT_BLOCK</button>
          }
        </div>
      </div>
    </div>
  );
}