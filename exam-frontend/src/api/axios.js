import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7240/api", // make sure port matches your API
  headers: { "Content-Type": "application/json" }
});

// Automatically attach token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
