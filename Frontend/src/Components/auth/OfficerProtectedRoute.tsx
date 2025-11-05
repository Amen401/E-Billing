import { Navigate } from "react-router-dom";
import { useOfficerAuth } from "./../Context/OfficerContext";
import type { JSX } from "react";

const OfficerProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useOfficerAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/officer/login" replace />;
};

export default OfficerProtectedRoute;
