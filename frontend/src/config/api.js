import axios from "axios";

const BACKEND_URL =  "http://192.168.1.64:3001"

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check 401/403, ensure we haven't retried, and ensure we aren't ALREADY calling login/refresh
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
        // FIX 1: Use the correct route prefix (Assuming your auth routes are under /auth)
        // FIX 2: Explicitly remove Authorization header for this request so backend doesn't reject it
        // FIX 3: Use _axios_ directly or pass empty headers to avoid the request interceptor attaching the bad token
        const response = await api.get("/v1/auth/refresh", {
           headers: { Authorization: "" } 
        });

        const { accessToken } = response.data;

        // Save new Access Token
        localStorage.setItem("accessToken", accessToken);
        
        // Update default headers
        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        // dispatch event to update AuthContext (See Solution 2)
        window.dispatchEvent(new Event("storage"));

        processQueue(null, accessToken);
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        
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