import api from "./api";
import type { BookReturnSearchResponse, ReturnBookResponse, ReturnBookRequest } from "@/types";

const FINE_PER_DAY = 5000;

/** Tính tiền phạt theo ngày quá hạn (đồng bộ với backend) */
export function calculateFine(dueDateStr: string, returnDateStr: string): number {
  const due = new Date(dueDateStr);
  const ret = new Date(returnDateStr);
  const days = Math.max(0, Math.floor((ret.getTime() - due.getTime()) / 86400000));
  return days * FINE_PER_DAY;
}

export const borrowRecordApi = {
  search: (params: { isbn?: string; title?: string; barcode?: string }) =>
    api.get<BookReturnSearchResponse[]>("/borrow-records/search", { params }),

  returnBook: (data: ReturnBookRequest) =>
    api.post<ReturnBookResponse>("/borrow-records/return", data),

  getOverdue: () =>
    api.get<BookReturnSearchResponse[]>("/borrow-records/overdue"),
};