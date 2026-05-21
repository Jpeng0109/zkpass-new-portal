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
    const message =
      err.response?.data?.message ||
      (err.code === "ERR_NETWORK"
        ? `Cannot reach API at ${API_BASE_URL}. Is the backend running on port 5000?`
        : err.message) ||
      "Request failed";
    if (import.meta.env.DEV) console.error("[api] error:", message);
    return Promise.reject(new Error(message));
  },
);
