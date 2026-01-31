import axios from "axios";

const API_URL = "https://localhost:7240/api/results";

export const getMyResults = () => axios.get(`${API_URL}/my`);

export const getResultsByExam = (examId) =>
  axios.get(`${API_URL}/exam/${examId}`);

export const getStudentAnswersForExam = (examId, studentId) =>
  axios.get(`${API_URL}/exam/${examId}/student/${studentId}`);

export const evaluateStudentAnswers = (examId, studentId, evaluations) =>
  axios.post(`${API_URL}/evaluate/${examId}/${studentId}`, evaluations);

export const reviewStudentAnswers = (examId, studentId) =>
  axios.get(`${API_URL}/review/${examId}/${studentId}`);

export const getAllResults = () => axios.get(`${API_URL}/all`);
