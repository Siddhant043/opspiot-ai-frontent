import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with base configuration
const api = axios.create({
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here if needed
    if (error.response?.status === 401) {
      // Token expired or invalid - remove token
      Cookies.remove("token", { path: "/" });
      // Optionally redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Environment variables
export const USER_MICROSERVICE_URL = import.meta.env.VITE_USER_MICROSERVICE_URL;
