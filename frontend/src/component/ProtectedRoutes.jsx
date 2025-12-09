import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

export const CustomerRoute = () => {
  const { token } = useContext(ShopContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { token, user } = useContext(ShopContext);

  // If waiting for user to load, you might return null or a loader here
  // But for now, let's just check safety:
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Safe Role Check: Handle case sensitivity and missing role
  const role = user?.role?.toLowerCase() || "";
  
  if (role !== 'admin' && role !== 'superadmin') {
    // If logged in but not admin, go to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};