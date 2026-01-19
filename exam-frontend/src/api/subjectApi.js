import api from "./axios";

// GET all subjects
export const getSubjects = () => api.get("/subjects");

// ADD subject
export const createSubject = (data) => api.post("/subjects", data);

// UPDATE subject
export const updateSubject = (id, data) =>
  api.put(`/subjects/${id}`, data);

// DELETE subject
export const deleteSubject = (id) =>
  api.delete(`/subjects/${id}`);
