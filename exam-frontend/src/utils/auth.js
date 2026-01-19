import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    return {
      userId: decoded.nameid,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};
