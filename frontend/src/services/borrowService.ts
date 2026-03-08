import api from "./api";
import type { ApiResponse, ApiPagination, BorrowRecord } from "@/types";
import type { BorrowStatus } from "@/types"; // thêm vào types nếu chưa có

export const borrowService = {
  getAll: (status?: BorrowStatus) =>
    api.get<ApiResponse<BorrowRecord[]>>("/borrows", {
      params: status ? { status } : undefined,
    }),
};