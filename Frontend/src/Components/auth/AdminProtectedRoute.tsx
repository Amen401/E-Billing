import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/UnifiedContext";
import type { JSX } from "react";

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login/admin" replace />;
};

export default AdminProtectedRoute;
