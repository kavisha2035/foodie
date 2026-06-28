import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // Automatically sends cookies (accessToken, refreshToken)
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Check if error is 401 and code is TOKEN_EXPIRED (or status 401)
    if (err.response?.status === 401 && !originalRequest._retry) {
      // Determine if we need to refresh based on user type (handled seamlessly by the backend endpoints)
      // Check path to know if it's a food partner or regular user
      const isPartnerRoute = originalRequest.url.includes("/food-partner") || originalRequest.url.includes("/partner");
      const refreshUrl = isPartnerRoute ? "/api/auth/food-partner/refresh" : "/api/auth/refresh";

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post(refreshUrl); // Triggers cookie rotation on backend
        processQueue(null);
        return api(originalRequest); // Retry the original request
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Clean auth state and redirect to login
        localStorage.removeItem("flavorloop-auth");
        window.location.href = isPartnerRoute ? "/partner/login" : "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
