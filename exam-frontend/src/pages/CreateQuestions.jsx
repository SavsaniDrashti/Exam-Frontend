import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  FaRobot, FaSave, FaTrash, FaEdit, FaSearch, 
  FaExclamationTriangle, FaChartPie, FaPlus, FaCheckCircle
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Swal from "sweetalert2";
import AiChat from "./AiChat";

export default function CreateQuestions() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const token = localStorage.getItem("token");

  // --- State Management ---
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [currentTotalMarks, setCurrentTotalMarks] = useState(0);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [marks, setMarks] = useState(2);
  const [mcqOptions, setMcqOptions] = useState({ A: "", B: "", C: "", D: "", correct: "" });
  const [showAi, setShowAi] = useState(false);
  const [questions, setQuestions] = useState({ MCQ: [], PARAGRAPH: [], CODING: [] });
  const [activeTab, setActiveTab] = useState("MCQ");
  const [searchTerm, setSearchTerm] = useState("");
// --- State Management ---
const [loading, setLoading] = useState(false); // Add this line
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    input: "#0f172a",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    success: "#4ade80"
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get("https://localhost:7240/api/exams/my-exams", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setExams(res.data);
      } catch (err) { console.error("Exam load error", err); }
    };
    fetchExams();
  }, [token]);

  useEffect(() => {
    if (selectedExam) {
      const exam = exams.find(e => (e.examId || e.ExamId || "").toString() === selectedExam);
      setSelectedExamDetails(exam);
      fetchQuestions();
    } else {
      setSelectedExamDetails(null);
      setQuestions({ MCQ: [], PARAGRAPH: [], CODING: [] });
    }
  }, [selectedExam, exams]);

  useEffect(() => {
    const allQuestions = [...(questions.MCQ || []), ...(questions.PARAGRAPH || []), ...(questions.CODING || [])];
    const total = allQuestions.reduce((sum, q) => {
        const val = q.marks ?? q.Marks ?? 0;
        return sum + parseInt(val);
    }, 0);
    setCurrentTotalMarks(total);
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      const types = ["mcq", "paragraph", "coding"];
      const results = await Promise.all(
        types.map(t => axios.get(`https://localhost:7240/api/questions/exam/${selectedExam}/${t}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }))
      );
      setQuestions({ MCQ: results[0].data, PARAGRAPH: results[1].data, CODING: results[2].data });
    } catch (err) { console.error("Fetch error", err); }
  };

// Add this to your state declarations at the top
// const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;

    // 1. Prepare Data & Logic
    const maxLimit = selectedExamDetails?.totalMarks ?? selectedExamDetails?.TotalMarks ?? 0;
    const newMarksValue = parseInt(marks);
    let projectedTotal = currentTotalMarks + newMarksValue;

    if (editingQuestionId) {
        const all = [...questions.MCQ, ...questions.PARAGRAPH, ...questions.CODING];
        const oldQ = all.find(q => (q.questionId ?? q.QuestionId) === editingQuestionId);
        projectedTotal -= (oldQ?.marks ?? oldQ?.Marks ?? 0);
    }

    if (projectedTotal > maxLimit) {
        return Swal.fire({ 
            title: "Weightage Exceeded", 
            text: `Max marks allowed: ${maxLimit}.`, 
            icon: "error", 
            background: colors.card, 
            color: colors.textMain 
        });
    }

    const payload = {
        ExamId: parseInt(selectedExam),
        QuestionText: questionText,
        QuestionType: questionType,
        Marks: newMarksValue,
        OptionA: questionType === "MCQ" ? mcqOptions.A : null,
        OptionB: questionType === "MCQ" ? mcqOptions.B : null,
        OptionC: questionType === "MCQ" ? mcqOptions.C : null,
        OptionD: questionType === "MCQ" ? mcqOptions.D : null,
        CorrectOption: questionType === "MCQ" ? mcqOptions.correct : null,
    };

    // 2. Start Loading
    setLoading(true); 

    try {
        let savedQuestion;
        
        if (editingQuestionId) {
            const res = await axios.put(`https://localhost:7240/api/questions/${editingQuestionId}`, payload, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            savedQuestion = res.data || { ...payload, QuestionId: editingQuestionId, questionId: editingQuestionId };
        } else {
            const res = await axios.post("https://localhost:7240/api/questions", payload, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            savedQuestion = res.data; 
        }

        // 3. Update State Directly (Instant UI)
        setQuestions(prev => {
            const typeKey = questionType.toUpperCase();
            const updatedList = [...(prev[typeKey] || [])];

            if (editingQuestionId) {
                const index = updatedList.findIndex(q => (q.questionId ?? q.QuestionId) === editingQuestionId);
                if (index !== -1) updatedList[index] = savedQuestion;
            } else {
                updatedList.unshift(savedQuestion); // Put new question at the top
            }

            return { ...prev, [typeKey]: updatedList };
        });

        setActiveTab(questionType.toUpperCase());
        resetForm();
        
        Swal.fire({ 
            icon: 'success', 
            title: 'Saved Successfully', 
            timer: 1500, 
            showConfirmButton: false, 
            background: colors.card, 
            color: colors.textMain 
        });

    } catch (err) {
        console.error("Save error:", err);
        Swal.fire({ title: "Error", text: "Failed to save question", icon: "error" });
    } finally {
        // 4. Stop Loading
        setLoading(false);
    }
};
  const resetForm = () => {
    setQuestionText(""); setMarks(2);
    setMcqOptions({ A: "", B: "", C: "", D: "", correct: "" });
    setEditingQuestionId(null);
  };

  const handleEdit = (q) => {
    setEditingQuestionId(q.questionId ?? q.QuestionId);
    setQuestionText(q.questionText ?? q.QuestionText);
    setMarks(q.marks ?? q.Marks);
    setQuestionType(activeTab);
    if (activeTab === "MCQ") {
      setMcqOptions({ 
        A: q.optionA ?? q.OptionA, B: q.optionB ?? q.OptionB, 
        C: q.optionC ?? q.OptionC, D: q.optionD ?? q.OptionD, 
        correct: q.correctOption ?? q.CorrectOption 
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async (id) => {
    const res = await Swal.fire({ title: 'Delete Question?', icon: 'warning', showCancelButton: true, background: colors.card, color: colors.textMain });
    if (res.isConfirmed) {
      try {
        await axios.delete(`https://localhost:7240/api/questions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchQuestions();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem", color: colors.textMain }}>
      <Helmet><title>Builder | EDUMETRICS</title></Helmet>

      <style>{`
        ::placeholder { color: ${colors.textMuted} !important; opacity: 0.6; }
        .form-control, .form-select { background-color: ${colors.input} !important; border: 1px solid #334155 !important; color: #fff !important; border-radius: 8px; }
        .form-control:focus, .form-select:focus { border-color: ${colors.primary} !important; box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2); }
        .q-table thead th { background-color: rgba(0,0,0,0.2) !important; color: ${colors.textMuted} !important; border: none; font-size: 0.75rem; text-transform: uppercase; padding: 15px; }
        .q-table tbody td { background-color: transparent !important; border-bottom: 1px solid ${colors.border} !important; color: ${colors.textMain} !important; padding: 15px; }
        .opt-pill { font-size: 0.8rem; padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: ${colors.textMuted}; }
        .opt-correct { background: rgba(74, 222, 128, 0.1) !important; border-color: rgba(74, 222, 128, 0.3) !important; color: #4ade80 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1">Assessment Builder</h3>
          <p className="text-muted small mb-0">Unified Midnight Theme Dashboard</p>
        </div>
        
        {selectedExamDetails && (
          <div className="p-3 rounded-4 d-flex align-items-center gap-3 shadow-sm" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><FaChartPie size={20}/></div>
            <div>
              <div className="small fw-bold text-light" style={{fontSize: '0.65rem'}}>CURRICULUM WEIGHTAGE</div>
              <div className="fw-bold">
                <span className={currentTotalMarks > (selectedExamDetails.totalMarks ?? selectedExamDetails.TotalMarks) ? "text-danger" : "text-primary"}>
                  {currentTotalMarks}
                </span>
                <span className="text-light"> / {selectedExamDetails.totalMarks ?? selectedExamDetails.TotalMarks ?? "0"} Pts</span>
              </div>
            </div>
          </div>
        )}

        <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" style={{ borderRadius: '12px' }} onClick={() => setShowAi(true)}>
          <FaRobot /> AI Assistant
        </button>
      </div>

      <div className="row g-4">
        {/* FORM PANEL */}
        <div className="col-xl-4 col-lg-5">
          <div className="p-4 rounded-4 shadow-sm h-100" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h6 className="fw-bold mb-4 text-uppercase small text-primary d-flex align-items-center gap-2">
                <FaPlus size={12}/> {editingQuestionId ? "Update Existing" : "Create New"}
            </h6>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-2">TARGET EXAM</label>
                <select className="form-select" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} required>
                  <option value="">-- Choose Exam --</option>
                  {exams.map(ex => (
                    <option key={ex.examId ?? ex.ExamId} value={ex.examId ?? ex.ExamId}>
                      {ex.examName ?? ex.ExamName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedExam && currentTotalMarks >= (selectedExamDetails?.totalMarks ?? selectedExamDetails?.TotalMarks) && !editingQuestionId ? (
                 <div className="alert alert-warning border-0 small bg-warning bg-opacity-10 text-warning">
                    <FaExclamationTriangle className="me-2"/> Mark limit reached.
                 </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="small fw-bold text-muted mb-2">QUESTION NARRATIVE</label>
                    <textarea className="form-control" rows={4} value={questionText} onChange={(e) => setQuestionText(e.target.value)} required placeholder="Ask AI or type here..." />
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-7">
                      <label className="small fw-bold text-muted mb-2">TYPE</label>
                      <select className="form-select" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                        <option value="MCQ">MCQ</option>
                        <option value="PARAGRAPH">Paragraph</option>
                        <option value="CODING">Coding</option>
                      </select>
                    </div>
                    <div className="col-5">
                      <label className="small fw-bold text-muted mb-2">POINTS</label>
                      <input type="number" className="form-control" value={marks} onChange={(e) => setMarks(e.target.value)} required />
                    </div>
                  </div>

                  {questionType === "MCQ" && (
                    <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                      <div className="row g-2">
                        {['A','B','C','D'].map(opt => (
                          <div className="col-6" key={opt}>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text border-0" style={{ backgroundColor: mcqOptions.correct === opt ? colors.success : '#334155', color: '#fff' }}>{opt}</span>
                              <input type="text" className="form-control" value={mcqOptions[opt]} onChange={(e) => setMcqOptions({...mcqOptions, [opt]: e.target.value})} required />
                            </div>
                          </div>
                        ))}
                        <div className="col-12 mt-2">
                          <select className="form-select form-select-sm" value={mcqOptions.correct} onChange={(e) => setMcqOptions({...mcqOptions, correct: e.target.value})} required>
                            <option value="">SELECT CORRECT KEY</option>
                            {['A','B','C','D'].map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" style={{borderRadius: '10px'}}>
                    <FaSave className="me-2"/> {editingQuestionId ? "Update" : "Save"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* LIST PANEL */}
        <div className="col-xl-8 col-lg-7">
          <div className="rounded-4 overflow-hidden h-100" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: colors.border }}>
                <div className="d-flex gap-1 p-1 rounded-3" style={{ backgroundColor: colors.bg }}>
                  {["MCQ", "PARAGRAPH", "CODING"].map(type => (
                    <button key={type} onClick={() => setActiveTab(type)} className="btn btn-sm border-0 px-3 py-1" style={{ 
                      backgroundColor: activeTab === type ? colors.primary : "transparent",
                      color: activeTab === type ? "#fff" : colors.textMuted
                    }}>{type}</button>
                  ))}
                </div>
                <div className="input-group input-group-sm w-50">
                   <span className="input-group-text bg-transparent border-end-0" style={{borderColor: '#334155'}}><FaSearch className="text-muted"/></span>
                   <input type="text" className="form-control border-start-0 ps-0 shadow-none" placeholder="Filter questions..." onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="table-responsive custom-scrollbar" style={{maxHeight: '65vh'}}>
              <table className="table q-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">#</th>
                    <th>Question Content & Options</th>
                    <th className="text-center">Pts</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(questions[activeTab] || [])
                    .filter(q => (q.questionText ?? q.QuestionText ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((q, i) => (
                      <tr key={q.questionId ?? q.QuestionId}>
                        <td className="ps-4 text-muted small">{i+1}</td>
                        <td className="py-3">
                          <div className="fw-bold small mb-3">{q.questionText ?? q.QuestionText}</div>
                          {activeTab === "MCQ" && (
                            <div className="d-flex flex-wrap gap-2">
                                {['A','B','C','D'].map(label => {
                                    const optVal = q[`option${label}`] ?? q[`Option${label}`];
                                    const isCorrect = (q.correctOption ?? q.CorrectOption) === label;
                                    return (
                                        <div key={label} className={`opt-pill ${isCorrect ? 'opt-correct' : ''}`}>
                                            <span className="fw-bold me-1">{label}:</span> {optVal}
                                            {isCorrect && <FaCheckCircle className="ms-1" size={10}/>}
                                        </div>
                                    );
                                })}
                            </div>
                          )}
                        </td>
                        <td className="text-center"><span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">{q.marks ?? q.Marks}</span></td>
                        <td className="text-end pe-4">
                            <button onClick={() => handleEdit(q)} className="btn btn-sm text-primary me-2"><FaEdit /></button>
                            <button onClick={() => confirmDelete(q.questionId ?? q.QuestionId)} className="btn btn-sm text-danger"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAi && (
        <AiChat onClose={() => setShowAi(false)} onUseText={(text) => { setQuestionText(text); setShowAi(false); }} />
      )}
    </div>
  );
}