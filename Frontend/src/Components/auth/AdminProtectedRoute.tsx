import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./../Context/AdminContext";
import type { JSX } from "react";

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
