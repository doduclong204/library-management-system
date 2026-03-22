// src/services/ocrService.ts

import axiosInstance from "../lib/axiosInstance";
import { DigitalBookResponse } from "../types/digitalBook";

const BASE = "/ocr";

export const ocrService = {
  /** Upload ảnh + OCR */
  upload: async (
    file: File,
    title: string,
    author: string
  ): Promise<DigitalBookResponse> => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("author", author);

    const res = await axiosInstance.post<DigitalBookResponse>(
      `${BASE}/upload`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  /** Lấy toàn bộ kho sách số */
  getAll: async (): Promise<DigitalBookResponse[]> => {
    const res = await axiosInstance.get<DigitalBookResponse[]>(`${BASE}/books`);
    return res.data;
  },

  /** Xem chi tiết + full text */
  getById: async (id: number): Promise<DigitalBookResponse> => {
    const res = await axiosInstance.get<DigitalBookResponse>(`${BASE}/books/${id}`);
    return res.data;
  },

  /** Tìm kiếm full-text */
  search: async (keyword: string): Promise<DigitalBookResponse[]> => {
    const res = await axiosInstance.get<DigitalBookResponse[]>(
      `${BASE}/books/search`,
      { params: { keyword } }
    );
    return res.data;
  },

  /** Xoá */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE}/books/${id}`);
  },
};