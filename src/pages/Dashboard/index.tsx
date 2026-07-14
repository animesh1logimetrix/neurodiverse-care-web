import React from 'react';
import ParentDashboard from './ParentDashboard';
import ClinicAdminDashboard from './ClinicAdminDashboard';

export default function Dashboard() {
  const userStr = localStorage.getItem('user');
  let roleName = "Clinic Admin";
  
  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      roleName = user?.role?.name || "Clinic Admin";
    }
  } catch (error) {
    console.error("Failed to parse user role for dashboard:", error);
  }

  if (roleName === "Parent/Guardian" || roleName === "Parent / Guardian") {
    return <ParentDashboard />;
  }

  if (roleName === "Therapist") {
    return <ClinicAdminDashboard />;
  }

  // Default to ClinicAdminDashboard for other roles
  return <ClinicAdminDashboard />;
}
