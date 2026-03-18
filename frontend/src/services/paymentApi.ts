// ============================================================
// src/services/paymentApi.ts
// API calls cho chức năng thanh toán tiền phạt bằng QR VietQR
// ============================================================

import api from "./api"; // axios instance đã cấu hình sẵn

// --- Kiểu dữ liệu ---

/** Dữ liệu trả về từ API tạo QR */
export interface CreatePaymentResponse {
  paymentCode: string;    // Mã giao dịch (ví dụ: "FINE-A3F8")
  amount: number;         // Số tiền phạt (VND)
  qrUrl: string;          // URL ảnh QR — dùng trực tiếp trong <img src={qrUrl}>
  bankName: string;       // Mã ngân hàng (ví dụ: "MB")
  accountNumber: string;  // Số tài khoản
  accountName: string;    // Tên tài khoản
}

// --- API functions ---

export const paymentApi = {

  /**
   * Tạo QR thanh toán cho một bản ghi tiền phạt.
   *
   * @param borrowRecordId - ID của borrow_record cần thanh toán
   * @returns thông tin QR (url, số tiền, mã giao dịch)
   */
  create: (borrowRecordId: number) =>
    api.post<CreatePaymentResponse>("/payments/create", { borrowRecordId }),

  /**
   * Thủ thư xác nhận đã thu tiền.
   * Gọi sau khi người dùng đã chuyển tiền và thủ thư kiểm tra xong.
   *
   * @param paymentCode - Mã giao dịch nhận được từ bước tạo QR
   */
  confirm: (paymentCode: string) =>
    api.post<void>("/payments/confirm", { paymentCode }),
};