import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, getRefreshToken, authActions } from "@/store/authStore";
import type { ApiResponse, AuthenticationResponse } from "@/types";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

export default api;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const drainQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      authActions.logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers["Authorization"] = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<ApiResponse<AuthenticationResponse>>(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}/auth/refresh`,
        { refresh_token: refreshToken },
        { withCredentials: true }
      );

      const { access_token, refresh_token, user } = data.data;
      authActions.setAuth(user, access_token, refresh_token);

      drainQueue(access_token);
      original.headers["Authorization"] = `Bearer ${access_token}`;
      return api(original);
    } catch (refreshErr) {
      drainQueue(null, refreshErr);
      authActions.logout();
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);