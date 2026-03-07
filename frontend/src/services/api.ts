import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginUser = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);
export const registerUser = (data: { name: string; email: string; studentId: string; password: string }) =>
  api.post("/auth/register", data);

// Books
export const getBooks = (params?: Record<string, string>) =>
  api.get("/books", { params });
export const getBookById = (id: string) => api.get(`/books/${id}`);
export const createBook = (data: Record<string, unknown>) => api.post("/books", data);
export const updateBook = (id: string, data: Record<string, unknown>) => api.put(`/books/${id}`, data);
export const deleteBook = (id: string) => api.delete(`/books/${id}`);

// Borrow / Return
export const borrowBook = (data: { bookId: string; userId: string; dueDate: string }) =>
  api.post("/borrow", data);
export const returnBook = (data: { borrowId: string; returnDate: string }) =>
  api.post("/return", data);
export const getMyBorrows = () => api.get("/borrows/my");
export const getAllBorrows = () => api.get("/borrows");

// Users
export const getCurrentUser = () => api.get("/users/me");
export const updateCurrentUser = (data: { name?: string; avatar?: string }) =>
  api.put("/users/me", data);
export const getUsers = () => api.get("/users");
export const getUserById = (id: string) => api.get(`/users/${id}`);

// OCR
export const uploadOCR = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/ocr", form, { headers: { "Content-Type": "multipart/form-data" } });
};

// Recommendations
export const getRecommendations = (userId: string) =>
  api.get(`/recommendations/${userId}`);

// Fines
export const getFines = () => api.get("/fines");
export const payFine = (fineId: string) => api.post(`/fines/${fineId}/pay`);

export default api;
