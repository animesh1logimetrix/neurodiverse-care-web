import React from 'react';
import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
  moduleRequired?: string; // Optional if you just want to check if they are logged in
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ moduleRequired }) => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const permissions = user?.role?.permissions || [];

    // If a specific module is required, check if they have it
    if (moduleRequired) {
      const hasAccess = permissions.some((p: any) => p.module === moduleRequired);
      if (!hasAccess) {
         // Fallback redirect if they don't have access to this module
         return <Navigate to="/" replace />;
      }
    }

    return <Outlet />;
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return <Navigate to="/signin" replace />;
  }
};

export default ProtectedRoute;
