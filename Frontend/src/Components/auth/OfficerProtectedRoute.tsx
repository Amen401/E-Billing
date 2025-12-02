import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/context/UnifiedContext";
import type { JSX } from "react";

const OfficerProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login/officer" replace />
;
};

export default OfficerProtectedRoute;
