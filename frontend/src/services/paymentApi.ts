import api from "./api";

export interface CreatePaymentResponse {
  paymentCode: string;
  amount: number;
  qrUrl: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface CreatePaymentRequest {
  borrowRecordId?: number;
  borrowRecordIds?: number[];
}

export interface PaymentStatusResponse {
  paymentCode: string;
  status: "PENDING" | "PAID";
  paid: boolean;
  paidAt: string | null;
}

export const paymentApi = {
  // === Thanh toán tiền PHẠT ===
  create: (data: CreatePaymentRequest) => {
    const body = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
    );
    return api.post<CreatePaymentResponse>("/payments/create", body);
  },

  confirm: (paymentCode: string) =>
    api.post<void>("/payments/confirm", { paymentCode }),

  // === Thanh toán tiền SÁCH ===
  createBookPayment: (data: CreatePaymentRequest) => {
    const body = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
    );
    return api.post<CreatePaymentResponse>("/payments/book/create", body);
  },

  confirmBookPayment: (paymentCode: string) =>
    api.post<void>("/payments/book/confirm", { paymentCode }),

  // === Polling trạng thái ===
  getStatus: (paymentCode: string) =>
    api.get<PaymentStatusResponse>(`/payments/status/${paymentCode}`),
};