import React from 'react';
import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const role = localStorage.getItem('neurocare_role');

  if (!role) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Optionally redirect to an unauthorized page or default dashboard
    if (role === 'Parent / Guardian') {
      return <Navigate to="/parent-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
