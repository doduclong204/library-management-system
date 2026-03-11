import api from "./api";
import type { BookReturnSearchResponse, ReturnBookResponse, ReturnBookRequest } from "@/types";

export const borrowRecordApi = {
  search: (params: { isbn?: string; title?: string; barcode?: string }) =>
    api.get<BookReturnSearchResponse[]>("/borrow-records/search", { params }),

  returnBook: (data: ReturnBookRequest) =>
    api.post<ReturnBookResponse>("/borrow-records/return", data),
};