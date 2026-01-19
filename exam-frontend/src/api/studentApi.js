import api from "./axios";

export const getStudentExams = () => api.get("/student/exams");

export const getExamQuestions = (examId) =>
  api.get(`/student/exam/${examId}/questions`);

export const submitExam = (examId, data) =>
  api.post(`/student/exam/${examId}/submit`, data);

export const getDetailedResult = (examId) =>
  api.get(`/student/exam/${examId}/detailed-result`);

export const getResult = (examId) =>
  api.get(`/student/exam/${examId}/result`);
