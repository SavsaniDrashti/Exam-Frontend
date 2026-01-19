import api from "./axios";

export const getTeachers = () => api.get("/admin/teachers");
export const createTeacher = (data) => api.post("/admin/teachers", data);
export const updateTeacher = (id, data) => api.put(`/admin/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/admin/teachers/${id}`);

export const getMySubjects = () =>
  api.get("/teacher/subjects");