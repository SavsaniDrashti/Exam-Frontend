import api from "./axios";

export const login = async (data) => {
  try {
    const res = await api.post("/auth/login", data);
    // Store token and role in localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    console.log("Token stored in localStorage:", res.data.token); // display token in network/console
    return res.data;
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data || "Login failed");
    } else {
      throw new Error("Network error. Check backend connection.");
    }
  }
};
