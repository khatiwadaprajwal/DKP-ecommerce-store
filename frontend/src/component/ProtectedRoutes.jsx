import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// ✅ Import useAuth instead of ShopContext
import { useAuth } from '../context/AuthProvider';

export const CustomerRoute = () => {
  // ✅ Use useAuth
  const { token, loading } = useAuth();

  // Optional: Show a loading spinner while checking auth status
  if (loading) return <div>Loading...</div>;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  // ✅ Use useAuth
  const { token, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Robust Role Check
  const role = user?.role?.toLowerCase() || "";
  
  if (role !== 'admin' && role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};