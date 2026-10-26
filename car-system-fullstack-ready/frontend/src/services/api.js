import axios from "axios";

const configuredOrigin = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

const api = axios.create({
  baseURL: configuredOrigin ? `${configuredOrigin}/api` : "/api",
  headers: { "Content-Type": "application/json" }
});

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return configuredOrigin ? `${configuredOrigin}${url}` : url;
}

export const FALLBACK_CAR_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("car_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = error.config?.url || "";
    const isAuthAttempt =
      reqUrl.includes("/auth/login") ||
      reqUrl.includes("/auth/signup") ||
      reqUrl.includes("/auth/admin-signup");
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem("car_token");
      localStorage.removeItem("car_user");
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
