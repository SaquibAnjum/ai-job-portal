import axios from "axios";

// In local dev (npm run dev), leave baseURL empty so requests use Vite's dev proxy (http://localhost:5000).
// In production (Vercel build), default to the deployed Render server URL unless VITE_API_URL is specified.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://ai-job-portal-z0zc.onrender.com");

if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}
axios.defaults.withCredentials = true;

// Add global request interceptor to auto-attach authorization token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
});

export default api;
