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

export const paymentApi = {
  create: (data: CreatePaymentRequest) => {
    const body = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
    );
    return api.post<CreatePaymentResponse>("/payments/create", body);
  },

  confirm: (paymentCode: string) =>
    api.post<void>("/payments/confirm", { paymentCode }),
};