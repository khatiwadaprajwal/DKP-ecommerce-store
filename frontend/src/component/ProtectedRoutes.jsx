import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider'; // Import from the file created above

// ----- ADMIN ROUTE -----
export const AdminRoute = () => {
  const { user, loading } = useAuth();

  // 1. Show Spinner while checking token/refreshing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // 2. If no user, go to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Check Role (Admin OR SuperAdmin)
  if (user.role === 'Admin' || user.role === 'SuperAdmin') {
    return <Outlet />;
  }

  // 4. If user exists but is not Admin, go Home
  return <Navigate to="/" replace />;
};

// ----- CUSTOMER ROUTE -----
export const CustomerRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // 1. If not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in as Customer (or you can allow all logged-in users here)
  if (user.role === 'Customer') {
    return <Outlet />;
  }

  // 3. Fallback
  return <Navigate to="/" replace />;
};