import axios from "axios";

// Access the environment variable (Vite style)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: BACKEND_URL, 
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle 403/401 & Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401/403 and we haven't tried refreshing yet
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") && 
      !originalRequest.url.includes("/refresh")  
    ) {
      if (isRefreshing) {
        
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        
        const response = await api.get("/refresh");

        const { accessToken } = response.data;

        // Save new Access Token
        localStorage.setItem("accessToken", accessToken);
        
        // Update default headers
        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        // Retry queued requests
        processQueue(null, accessToken);

        // Retry original request
        return api(originalRequest);

      } catch (err) {
        // Refresh failed (Session truly expired)
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user"); // Clear user data
        
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;