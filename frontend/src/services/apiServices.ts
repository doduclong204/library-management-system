import api from "./api";
import type { ApiResponse, ApiPagination, Book, BorrowRecord, BorrowRequest, BorrowResponse, Fine, User, BookRequest, PatronSearchResult, BookCopy } from "@/types";

export const bookApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<ApiPagination<Book>>>("/books", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Book>>(`/books/${id}`),

  create: (data: BookRequest) =>
    api.post<ApiResponse<Book>>("/books", data),

  update: (id: number, data: BookRequest) =>
    api.put<ApiResponse<Book>>(`/books/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/books/${id}`),
};

export const borrowApi = {
  // ✅ Sửa: /borrows (có s) + đúng kiểu BorrowRequest/BorrowResponse
  borrow: (data: BorrowRequest) =>
    api.post<ApiResponse<BorrowResponse>>("/borrows", data),

  return: (data: { borrowId: string; returnDate: string }) =>
    api.post<ApiResponse<BorrowRecord>>("/return", data),

  getMine: () =>
    api.get<ApiResponse<BorrowRecord[]>>("/borrows/my"),

  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<ApiPagination<BorrowRecord>>>("/borrows", { params }),
};

export const userApi = {
  getMe: () =>
    api.get<ApiResponse<User>>("/users/me"),

  updateMe: (data: { username?: string; full_name?: string; avatar?: string }) =>
    api.put<ApiResponse<User>>("/users/me", data),

  getAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<ApiPagination<User>>>("/users", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
};

export const fineApi = {
  getAll: () =>
    api.get<ApiResponse<Fine[]>>("/fines"),

  pay: (fineId: string) =>
    api.post<ApiResponse<{ message: string }>>(`/fines/${fineId}/pay`),
};

export const ocrApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<{ text: string }>>("/ocr", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const recommendApi = {
  get: (userId: number) =>
    api.get<ApiResponse<Book[]>>(`/recommendations/${userId}`),
};

export const patronApi = {
  search: async (email: string) => {
    const res = await api.get<PatronSearchResult>("/patrons/search", {
      params: { email },
    });
    // Bọc thành array để component dùng được
    return { data: { data: res.data ? [res.data] : [] } };
  },
};
export const bookCopyApi = {
  searchByIsbnOrBarcode: (query: string) =>
    api.get<ApiResponse<BookCopy[]>>("/book-copies/search", {
      params: { q: query },
    }),
};