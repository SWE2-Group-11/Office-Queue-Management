import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem('isOfficerAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Redirect unauthenticated staff to the login page, NOT the client kiosk
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}