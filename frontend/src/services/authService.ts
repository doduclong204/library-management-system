import axios from "axios";
import api from "./api";
import type { ApiResponse, LoginRequest, AuthenticationResponse } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const authService = {
  login: (body: LoginRequest) =>
    axios.post<ApiResponse<AuthenticationResponse>>(
      `${BASE_URL}/auth/login`,
      body,
      { headers: { "Content-Type": "application/json" } }
    ),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refresh_token: refreshToken }),

  getMe: () =>
    api.get<ApiResponse<AuthenticationResponse["user"]>>("/auth/me"),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthenticationResponse>>("/auth/refresh", {
      refresh_token: refreshToken,
    }),
};

export default authService;

export const parseAuthError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return data?.error ?? data?.message ?? error.message ?? "Đã xảy ra lỗi";
  }
  return "Đã xảy ra lỗi không xác định";
};