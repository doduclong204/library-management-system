// src/lib/axiosInstance.ts
// Nếu project đã có file này rồi thì BỎ QUA, chỉ kiểm tra baseURL có đúng không.

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1",  // khớp với server.port + context-path trong application.yml
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm JWT token vào mỗi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý 401 → redirect về login
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;