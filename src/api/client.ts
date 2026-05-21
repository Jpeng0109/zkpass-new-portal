import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("zkpass_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (import.meta.env.DEV) {
    console.debug(`[api] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.debug(`[api] ← ${res.status} ${res.config.url}`);
    }
    return res;
  },
  (err) => {
    const status = err.response?.status;
    let hint = err.message;
    if (status === 404) {
      hint =
        `API returned 404 at ${API_BASE_URL}. The Render backend is missing or misconfigured. ` +
        `Create a separate Render Web Service with Root Directory = backend (not the frontend site). ` +
        `Correct VITE_API_BASE_URL: https://zkpass-new-portal-api.onrender.com/api/v1`;
    } else if (err.code === "ERR_NETWORK") {
      hint =
        `Cannot reach API at ${API_BASE_URL}. Check URL ends with /api/v1, Render CLIENT_ORIGIN includes your Vercel domain, and cold start (wait 60s).`;
    }
    const message = err.response?.data?.message || hint || "Request failed";
    if (import.meta.env.DEV) console.error("[api] error:", message);
    return Promise.reject(new Error(message));
  },
);
