import React, { useEffect, useState, createContext, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import api from '../config/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const decodeUser = (t) => {
    try { return jwtDecode(t); } catch (e) { return null; }
  };

  // Function to sync state with LocalStorage
  const checkToken = () => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user'); 

    if (storedToken) {
      const decoded = decodeUser(storedToken);
      const currentTime = Date.now() / 1000;

      // Check if token exists and hasn't expired
      if (decoded && decoded.exp > currentTime) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                setUser(decoded);
            }
        } else {
            setUser(decoded);
        }
      } else {
        // Token is invalid or expired
        handleLogout(false); // False = suppress toast on auto-logout
        return;
      }
    } else {
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  };

  useEffect(() => {
    checkToken();

    // Listen for the custom event dispatched by api.js
    const handleStorageChange = () => {
      checkToken();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = async (showToast = true) => {
    try {
      // ✅ FIX: Added /v1 to match your backend routes
      await api.post(`/v1/auth/logout`); 
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      if(showToast) toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}



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