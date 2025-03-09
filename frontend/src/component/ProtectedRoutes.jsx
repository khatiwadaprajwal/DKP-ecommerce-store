import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// For handling admin-only routes
export const AdminRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Set token for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Check user profile or a specific admin verification endpoint
        const response = await axios.get('http://localhost:3001/v1/auth/login');
        console.log(response);
        
        if (response.data.user && response.data.user.role === 'Admin') {
          setIsAdmin(true);
        } else {
          toast.error("Access denied. Admin privileges required.");
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Session expired or invalid. Please login again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

// For handling customer-only routes (if needed)
export const CustomerRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyCustomer = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Set token for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify the token is valid
        const response = await axios.get('http://localhost:3001/v1/customer/khatiwadaprajwal18@gmail.com');
        
        
        if (response.data.user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error("Session expired or invalid. Please login again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyCustomer();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Auth provider for setting up axios defaults and checking auth on app load
export const AuthProvider = ({ children }) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Setup axios interceptor for handling 401 responses globally
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  return <>{children}</>;
};