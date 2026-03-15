import api from "./api";
import type { ApiResponse, ApiPagination, BorrowRecord } from "@/types";
import type { BorrowStatus } from "@/types"; // thêm vào types nếu chưa có

// Sửa lại borrowApi hoàn toàn:
export const borrowApi = {
  // POST /borrows — khớp với BorrowController
  borrow: (data: BorrowRequest) =>
    api.post<ApiResponse<BorrowResponse>>("/borrows", data),

  // GET /borrows?status=borrowed
  getAll: (params?: { status?: BorrowStatus }) =>
    api.get<ApiResponse<BorrowResponse[]>>("/borrows", { params }),

  // Giữ lại nếu backend có — hoặc xóa nếu không dùng
  getMine: () =>
    api.get<ApiResponse<BorrowRecord[]>>("/borrows/my"),
};

// Thêm patron search API (cần backend có endpoint này)
export const patronApi = {
  search: (email: string) =>
    api.get<ApiResponse<PatronSearchResult[]>>("/patrons/search", {
      params: { email },
    }),
};

// Thêm bookCopy API để lấy bookCopyId từ ISBN/barcode
export const bookCopyApi = {
  searchByIsbnOrBarcode: (query: string) =>
    api.get<ApiResponse<BookCopy[]>>("/book-copies/search", {
      params: { q: query },
    }),
};