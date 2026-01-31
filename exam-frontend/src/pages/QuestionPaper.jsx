import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaFilePdf, FaPrint } from "react-icons/fa";

export default function QuestionPaper() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [questions, setQuestions] = useState([]);

  const paperRef = useRef();
  const token = localStorage.getItem("token");

  // Consistent Midnight Palette
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    input: "#0f172a",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#818cf8",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
  };

  // ================= FETCH EXAMS =================
  useEffect(() => {
    axios
      .get("https://localhost:7240/api/exams/my-exams", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExams(res.data))
      .catch(() => alert("Failed to load exams"));
  }, [token]);

  // ================= FETCH QUESTIONS =================
  useEffect(() => {
    if (!selectedExam) {
      setQuestions([]);
      return;
    }

    Promise.all([
      axios.get(`https://localhost:7240/api/questions/exam/${selectedExam}/mcq`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`https://localhost:7240/api/questions/exam/${selectedExam}/paragraph`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`https://localhost:7240/api/questions/exam/${selectedExam}/coding`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([mcq, para, coding]) => {
        setQuestions([...mcq.data, ...para.data, ...coding.data]);
      })
      .catch(() => alert("Failed to load questions"));
  }, [selectedExam, token]);

  // ================= DOWNLOAD PDF =================
  const downloadPDF = async () => {
    const canvas = await html2canvas(paperRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("Question_Paper.pdf");
  };

  return (
    <div className="container-fluid mt-0" style={{ backgroundColor: colors.bg, minHeight: "100vh", padding: "2rem" }}>
      
      <style>{`
        .form-select { background-color: ${colors.input} !important; border: 1px solid #334155 !important; color: #fff !important; }
        .form-select:focus { border-color: ${colors.primary} !important; box-shadow: none; }
        .card { background-color: ${colors.card} !important; border: 1px solid ${colors.border} !important; }
        .card-header { border-bottom: 1px solid ${colors.border} !important; background-color: rgba(0,0,0,0.2) !important; color: ${colors.textMain} !important; }
        .paper-preview { background-color: white !important; color: #000 !important; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        /* Force black text for the actual paper so it prints correctly */
        .paper-preview p, .paper-preview li, .paper-preview h3, .paper-preview span { color: #000 !important; }
      `}</style>

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center p-3">
          <h4 className="mb-0 fw-bold">📄 Question Paper Generator</h4>
          {questions.length > 0 && (
            <button className="btn btn-success d-flex align-items-center gap-2" onClick={downloadPDF}>
              <FaFilePdf /> Download PDF
            </button>
          )}
        </div>

        <div className="card-body p-4">
          {/* SELECT EXAM - Original Wide Layout */}
          <div className="row mb-4">
            <div className="col-12">
              <label className="form-label fw-bold text-muted small">SELECT EXAM</label>
              <select
                className="form-select"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              >
                <option value="">-- Select Exam --</option>
                {exams.map((e) => (
                  <option key={e.examId || e.ExamId} value={e.examId || e.ExamId}>
                    {e.examName || e.ExamName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* QUESTION PAPER PREVIEW - Original Full Width */}
          {questions.length > 0 && (
            <div ref={paperRef} className="p-5 paper-preview">
              {/* HEADER */}
              <div className="text-center border-bottom border-dark pb-3 mb-4">
                <h3 className="fw-bold">Online Examination System</h3>
                <p className="mb-1 fw-bold">End Semester Examination</p>
                <p className="mb-0 small">
                  Answer all questions | Time: 3 Hours
                </p>
              </div>

              {/* QUESTIONS */}
              {questions.map((q, index) => (
                <div key={q.questionId || q.QuestionId} className="mb-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <p className="fw-bold mb-2" style={{ flex: 1 }}>
                      Q{index + 1}. {q.questionText || q.QuestionText}
                    </p>
                    <span className="badge bg-dark text-white ms-3">
                      {q.marks || q.Marks} Marks
                    </span>
                  </div>

                  {/* MCQ OPTIONS */}
                  {(q.optionA || q.OptionA) && (
                    <ol type="A" className="ms-4">
                      <li>{q.optionA || q.OptionA}</li>
                      <li>{q.optionB || q.OptionB}</li>
                      <li>{q.optionC || q.OptionC}</li>
                      <li>{q.optionD || q.OptionD}</li>
                    </ol>
                  )}

                  {/* PARAGRAPH ANSWER SPACE */}
                  {!(q.optionA || q.OptionA) && (q.QuestionType === "PARAGRAPH" || q.questionType === "PARAGRAPH") && (
                    <div
                      className="mt-3"
                      style={{
                        height: "80px",
                        borderBottom: "1px dashed #ccc",
                      }}
                    />
                  )}

                  {/* CODING SECTION */}
                  {!(q.optionA || q.OptionA) && (q.codingLanguage || q.CodingLanguage) && (
                    <div className="mt-2 fst-italic text-muted small">
                      Write a program using <b>{q.codingLanguage || q.CodingLanguage}</b>.
                    </div>
                  )}
                </div>
              ))}

              {/* FOOTER */}
              <div className="text-center mt-5 pt-3 border-top border-dark text-muted small">
                *** End of Question Paper ***
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 