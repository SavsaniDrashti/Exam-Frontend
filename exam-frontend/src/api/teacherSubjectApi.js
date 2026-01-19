import api from "./axios"; // Axios instance with baseURL

export const getTeachers = () => api.get("/admin/teachers");

export const getSubjects = () =>
  api.get("/subjects");

export const getTeacherSubjects = (teacherId) =>
  api.get(`/admin/teacher/${teacherId}/subjects`);

export const assignSubjects = (data) =>
  api.post("/admin/assign-subjects", data);

export const removeSubject = (teacherId, subjectId) =>
  api.delete(`/admin/remove-subject?teacherId=${teacherId}&subjectId=${subjectId}`);

export const getAllAssignments = () =>
  api.get("/admin/assignments");

export const deleteAssignment = (teacherId, subjectId) =>
  api.delete(
    `/admin/remove-subject?teacherId=${teacherId}&subjectId=${subjectId}`
  );