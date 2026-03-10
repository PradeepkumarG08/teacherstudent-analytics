import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // If not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role not allowed → redirect
  if (role && role !== userRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}