import api from "./axios";

export const createUser = (data) =>
  api.post("/users", {
    FullName: data.fullName,
    Email: data.email,
    Role: data.role,
    PasswordHash: "123456", // demo / exam safe
  });
export const getUsers = () => api.get("/users");

export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) =>
  api.put(`/users/${id}`, {
    FullName: data.fullName,
    Email: data.email,
    Role: data.role,
  });

export const deleteUser = (id) =>
  api.delete(`/users/${id}`);
export const getMe = () => api.get("/users/me");