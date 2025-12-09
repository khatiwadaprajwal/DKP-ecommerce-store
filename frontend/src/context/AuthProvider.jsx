import React, { useEffect, useState, createContext, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext'; // Needed for backend_url

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { backend_url } = useContext(ShopContext); // Get URL from your existing context
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Helper to decode
  const decodeUser = (t) => {
    try { return jwtDecode(t); } catch (e) { return null; }
  };

  // 1. Initialize
  useEffect(() => {
    axios.defaults.withCredentials = true;
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = decodeUser(storedToken);
      if (decoded) {
        setUser(decoded);
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // 2. Interceptors (Already correct, but ensure this is here)
  useEffect(() => {
    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        const newToken = response.headers['x-new-access-token'];
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          setUser(decodeUser(newToken));
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        return response;
      },
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Only force logout if it's strictly an auth error, not a permission error
           if (error.response.data.message === "Session expired. Please login again.") {
               handleLogout(); 
           }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(resInterceptor);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // 🔴 UPDATED LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      // 1. Call Backend to clear Cookie
      await axios.post(`${backend_url}/v1/auth/logout`); 
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // 2. Clear Frontend State regardless of backend success
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

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