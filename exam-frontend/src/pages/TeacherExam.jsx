import { useEffect, useState } from "react";
import {
  getMySubjects,
  getMyExams,
  createExam,
  deleteExam,
  assignExam,
  getExamStudents,
  getAllAssignments,
  getAllStudents,
  removeAssignedStudent, // new API
} from "../api/examApi";

export default function TeacherExam() {
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedExamStudents, setSelectedExamStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const [examForm, setExamForm] = useState({
    examName: "",
    subjectId: "",
    totalMarks: "",
    duration: "",
  });

  const [assignForm, setAssignForm] = useState({
    examId: "",
    studentIds: [],
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const sRes = await getMySubjects();
    setSubjects(sRes.data);

    const eRes = await getMyExams();
    setExams(eRes.data);

    const stRes = await getAllStudents();
    setStudents(stRes.data);

    const aRes = await getAllAssignments();
    setAssignments(aRes.data);
  };

  // ---------------- CREATE EXAM ----------------
  const handleCreateExam = async () => {
    if (!examForm.examName || !examForm.subjectId) {
      alert("Exam name and subject are required.");
      return;
    }
    await createExam({
      examName: examForm.examName,
      subjectId: parseInt(examForm.subjectId),
      totalMarks: parseInt(examForm.totalMarks),
      duration: parseInt(examForm.duration),
    });
    setExamForm({ examName: "", subjectId: "", totalMarks: "", duration: "" });
    loadInitialData();
  };

  // ---------------- DELETE EXAM ----------------
  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Delete this exam?")) return;
    await deleteExam(examId);
    loadInitialData();
  };

  // ---------------- SHOW STUDENTS ----------------
  const handleShowStudents = async (examId) => {
    setSelectedExam(examId);
    const res = await getExamStudents(examId);
    setSelectedExamStudents(res.data);
  };

  // ---------------- ASSIGN EXAM ----------------
  const handleAssignExam = async () => {
    if (!assignForm.examId || assignForm.studentIds.length === 0) {
      alert("Select exam and students to assign.");
      return;
    }

    await assignExam({
      examId: parseInt(assignForm.examId),
      studentIds: assignForm.studentIds.map((id) => parseInt(id)),
    });

    setAssignForm({ examId: "", studentIds: [] });
    loadInitialData();
  };

  // ---------------- REMOVE ASSIGNED STUDENT ----------------
  const handleRemoveAssignedStudent = async (examId, studentId) => {
    if (!window.confirm("Remove this student from the exam?")) return;

    try {
      await removeAssignedStudent(examId, studentId);
      alert("Student removed successfully");
      loadInitialData();

      // refresh selected exam students if viewing the same exam
      if (selectedExam === examId) handleShowStudents(examId);
    } catch (err) {
      alert(err.response?.data || "Failed to remove student");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Teacher Exam Management</h3>

      {/* ---------- Create Exam ---------- */}
      <div className="card mb-3 p-3">
        <h5>Create Exam</h5>
        <input
          type="text"
          placeholder="Exam Name"
          className="form-control mb-2"
          value={examForm.examName}
          onChange={(e) =>
            setExamForm({ ...examForm, examName: e.target.value })
          }
        />
        <select
          className="form-select mb-2"
          value={examForm.subjectId}
          onChange={(e) =>
            setExamForm({ ...examForm, subjectId: e.target.value })
          }
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Total Marks"
          className="form-control mb-2"
          value={examForm.totalMarks}
          onChange={(e) =>
            setExamForm({ ...examForm, totalMarks: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          className="form-control mb-2"
          value={examForm.duration}
          onChange={(e) =>
            setExamForm({ ...examForm, duration: e.target.value })
          }
        />
        <button className="btn btn-primary" onClick={handleCreateExam}>
          Create Exam
        </button>
      </div>

      {/* ---------- Exams Table ---------- */}
      <h5>My Exams</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Subject</th>
            <th>Total Marks</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((e) => (
            <tr key={e.examId}>
              <td>{e.examName}</td>
              <td>{e.subjectName}</td>
              <td>{e.totalMarks}</td>
              <td>{e.duration}</td>
              <td>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleShowStudents(e.examId)}
                >
                  Students
                </button>{" "}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteExam(e.examId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------- Assign Exam ---------- */}
      <div className="card mb-3 p-3">
        <h5>Assign Exam to Students</h5>
        <select
          className="form-select mb-2"
          value={assignForm.examId}
          onChange={(e) =>
            setAssignForm({ ...assignForm, examId: e.target.value })
          }
        >
          <option value="">Select Exam</option>
          {exams.map((e) => (
            <option key={e.examId} value={e.examId}>
              {e.examName}
            </option>
          ))}
        </select>
        <select
          className="form-select mb-2"
          multiple
          value={assignForm.studentIds}
          onChange={(e) =>
            setAssignForm({
              ...assignForm,
              studentIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
            })
          }
        >
          {students.map((s) => (
            <option key={s.userId} value={s.userId}>
              {s.fullName}
            </option>
          ))}
        </select>
        <button className="btn btn-success" onClick={handleAssignExam}>
          Assign Exam
        </button>
      </div>

      {/* ---------- Assigned Students ---------- */}
      {selectedExam && (
        <div className="card mb-3 p-3">
          <h5>Assigned Students</h5>
          <ul className="list-group">
            {selectedExamStudents.map((s) => (
              <li key={s.userId} className="list-group-item d-flex justify-content-between">
                {s.fullName} {s.isCompleted ? "(Completed)" : ""}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveAssignedStudent(selectedExam, s.userId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------- All Assignments Table ---------- */}
      <h5>All Exam Assignments</h5>
     <table className="table table-bordered">
  <thead>
    <tr>
      <th>Exam</th>
      <th>Subject</th>
      <th>Student</th>
      <th>Completed</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {assignments.map((a, idx) => (
      <tr key={idx}>
        <td>{a.examName}</td>
        <td>{a.subjectName}</td>
        <td>{a.studentName}</td>
        <td>{a.isCompleted ? "Yes" : "No"}</td>
        <td>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleRemoveAssignedStudent(a.examId, a.studentId)}
          >
            Remove
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
}
