import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
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
    const contentType = String(err.response?.headers?.["content-type"] || "");
    const body = typeof err.response?.data === "string" ? err.response.data : "";
    const isHtml = contentType.includes("text/html") || body.trimStart().startsWith("<!DOCTYPE");

    if (status === 404 || isHtml) {
      hint =
        `API at ${API_BASE_URL} is serving the frontend, not Express. ` +
        `On Render set Root Directory = backend, Start = npm start, then redeploy. ` +
        `Verify /health returns JSON {"service":"zkpassportal-api"}, not plain "ok" or HTML.`;
    } else if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
      hint =
        `Cannot reach API at ${API_BASE_URL}. Check: (1) URL ends with /api/v1 ` +
        `(2) Render Root Directory is backend/ (3) CLIENT_ORIGIN includes your exact Vercel URL ` +
        `(4) free tier cold start — retry in 60s. Local dev: cd backend && npm run dev`;
    }
    const message = err.response?.data?.message || hint || "Request failed";
    if (import.meta.env.DEV) console.error("[api] error:", message);
    return Promise.reject(new Error(message));
  },
);
