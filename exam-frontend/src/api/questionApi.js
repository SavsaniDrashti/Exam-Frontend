import api from "./axios";

export const getExams = () => api.get("/exams/my-exams"); // teacher exams
export const getQuestions = (examId) => api.get(`/questions/exam/${examId}`);
export const addQuestion = (data) => api.post("/questions", data);
export const updateQuestion = (id, data) =>
  api.put(`/questions/${id}`, data);
export const deleteQuestion = (id) =>
  api.delete(`/questions/${id}`);