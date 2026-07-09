import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  moduleRequired?: string; // If provided, validates module access
}

const ProtectedRoute = ({ moduleRequired }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Check general authentication
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // 2. Check specific module permission if required (COMMENTED OUT TEMPORARILY as modules are not finalized)
  // if (moduleRequired && user) {
  //   const userPermissions = user.role?.permissions || [];
  //   const hasAccess = userPermissions.some(
  //     (perm: any) => perm.Name === moduleRequired
  //   );

  //   if (!hasAccess) {
  //     // If no access, they are logged in but don't have permission for this route
  //     // A common pattern is to redirect to their dashboard or show a "Not Authorized" page
  //     return <Navigate to="/dashboard" replace />;
  //   }
  // }

  // If all checks pass, render the child route
  return <Outlet />;
};

export default ProtectedRoute;
