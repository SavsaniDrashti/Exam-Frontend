import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  // get role from localStorage
  const role = localStorage.getItem("role");

  // if not logged in
  if (!role) {
    return <Navigate to="/" replace />; // replace prevents history stack issues
  }

  // if role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // allowed, render children
  return children;
}
