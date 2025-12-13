import React, { useEffect, useState, createContext, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext'; // Needed for backend_url
import api from '../config/api'; // Updated import to use api.js

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // We don't need backend_url here anymore because api.js handles the baseURL
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken')); // Changed 'token' to 'accessToken' to match api.js
  const [loading, setLoading] = useState(true);

  // Helper to decode
  const decodeUser = (t) => {
    try { return jwtDecode(t); } catch (e) { return null; }
  };

  // 1. Initialize App (Check LocalStorage)
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    
    if (storedToken) {
      const decoded = decodeUser(storedToken);
      if (decoded) {
        setUser(decoded);
        setToken(storedToken);
        // ✅ CHANGE 2: Set header on your 'api' instance, not global axios
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ❌ REMOVED: The generic axios interceptor logic. 
  // Why? Because 'api.js' now handles the 401/403 refresh logic automatically.

  // 2. Login Function
  const login = (newToken, userData) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    
    // ✅ CHANGE 3: Update 'api' instance headers
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // 3. Logout Function
  const handleLogout = async () => {
    try {
      // ✅ CHANGE 4: Use 'api.post' to utilize the baseURL and credentials
      await api.post(`/auth/logout`); 
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // Clear State
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      // Clear Header
      delete api.defaults.headers.common['Authorization'];
      
      toast.success("Logged out successfully");
      // Optional: Force redirect to ensure clean state
      // window.location.href = '/login'; 
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
// ----- UPDATED ROUTES -----

export const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Replace with your spinner component

  // Allow BOTH Admin and SuperAdmin to access Admin Routes
  if (user && (user.role === 'Admin' || user.role === 'SuperAdmin')) {
    return <Outlet />;
  }
  return <Navigate to="/login" replace />;
};

export const SuperAdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  // STRICTLY SuperAdmin
  if (user && user.role === 'SuperAdmin') {
    return <Outlet />;
  }
  return <Navigate to="/login" replace />;
};

export const CustomerRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  if (user && user.role === 'Customer') {
    return <Outlet />;
  }
  return <Navigate to="/login" replace />;
};