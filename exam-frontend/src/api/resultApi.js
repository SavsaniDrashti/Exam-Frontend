import api from "./axios";

export const getMyResults = () => api.get("/results/my");
export const getResultsByExam = (examId) =>
  api.get(`/results/exam/${examId}`);
export const getStudentResult = (examId, studentId) =>
  api.get(`/results/exam/${examId}/student/${studentId}`);

export const evaluateResult = (examId, studentId, data) =>
  api.post(`/results/evaluate/${examId}/${studentId}`, data);

export const reviewResult = (examId, studentId) =>
  api.get(`/results/review/${examId}/${studentId}`);

export const getAllResults = () => api.get("/results/all");
