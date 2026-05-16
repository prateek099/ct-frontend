import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // The browser attaches the httpOnly access_token / refresh_token cookies
  // that the backend sets on login/refresh. Required for cross-origin in
  // prod (ct-frontend-*.onrender.com → ct-backend-*.onrender.com).
  withCredentials: true,
});

const IS_DEV = import.meta.env.DEV;

// ── Request interceptor — log only in dev ────────────────────────────────────
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (IS_DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

function clearDisplayCookies() {
  // The httpOnly access/refresh cookies can only be cleared server-side
  // (see /auth/logout). These are the JS-readable display cookies.
  Cookies.remove("login_type");
  Cookies.remove("user_name");
}

function clearAdminDisplayCookies() {
  Cookies.remove("admin_session");
}

function isAdminApiUrl(url: string): boolean {
  // Prateek: /admin/* endpoints (including /admin/auth/* which we skip for
  // refresh) are admin-realm requests. The user 401-refresh path is wrong
  // for these — admin sessions live behind admin_*_token cookies and the
  // user /auth/refresh endpoint doesn't know about them.
  return url.startsWith("/admin/") || url.startsWith("admin/");
}

client.interceptors.response.use(
  (response) => {
    if (IS_DEV) {
      console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (IS_DEV) {
      console.error(`[API] ERROR ${error.response?.status ?? "network"} ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, error.response?.data);
    }
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh for 401 on non-auth endpoints.
    // /login is the workflow-login endpoint — never refresh on its own 401,
    // otherwise a bad password triggers a redirect that wipes the form state.
    const url = original.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/") || url === "/login" || url.endsWith("/login");
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while refresh is in flight
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => client(original));
      }

      original._retry = true;
      isRefreshing = true;

      // Admin and user sessions live behind separate refresh endpoints and
      // separate cookies — branch on the request's namespace.
      const isAdmin = isAdminApiUrl(url);

      try {
        await client.post(isAdmin ? "/admin/auth/refresh" : "/auth/refresh");
        processQueue(null);
        return client(original);
      } catch (refreshError) {
        processQueue(refreshError);
        if (isAdmin) {
          clearAdminDisplayCookies();
          window.location.href = "/admin/login";
        } else {
          clearDisplayCookies();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
