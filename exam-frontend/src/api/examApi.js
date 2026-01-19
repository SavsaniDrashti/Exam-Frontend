import api from "./axios"; // Axios instance with baseURL

// Teachers
export const getMySubjects = () => api.get("/exams/my-subjects");
export const getMyExams = () => api.get("/exams/my-exams");
export const createExam = (data) => api.post("/exams", data);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);
export const getExamById = (id) => api.get(`/exams/${id}`);
export const assignExam = (data) =>
  api.post("/exams/assign", data);
export const getExamStudents = (examId) => api.get(`/exams/${examId}/students`);
export const getAllAssignments = () => api.get("/exams/assignments");
// Remove a student from an exam assignment
export const removeAssignedStudent = (examId, studentId) =>
  api.delete(`/exams/remove-assignment?examId=${examId}&studentId=${studentId}`);

// Students
export const getStudentExams = () => api.get("/exams/student-exams");
export const getAllStudents = () => api.get("/users?role=Student");
export const toggleAssignment = (data) => api.post("/exams/toggle-assignment", data);

export const getTeacherExams = () =>
  api.get("/exams/my-exams");