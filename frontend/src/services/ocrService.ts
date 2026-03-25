import axiosInstance from "../lib/axiosInstance";
import { DigitalBookResponse } from "../types/digitalBook";

const BASE = "/ocr";

export const ocrService = {
  upload: async (
    files: File[],
    title: string,
    author: string
  ): Promise<DigitalBookResponse> => {
    const form = new FormData();
    files.forEach(file => {
      form.append("files", file);
    });
    form.append("title", title);
    form.append("author", author);

    const res = await axiosInstance.post<DigitalBookResponse>(
      `${BASE}/upload`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  getAll: async (): Promise<DigitalBookResponse[]> => {
    const res = await axiosInstance.get<DigitalBookResponse[]>(`${BASE}/books`);
    return res.data;
  },

  getById: async (id: number): Promise<DigitalBookResponse> => {
    const res = await axiosInstance.get<DigitalBookResponse>(`${BASE}/books/${id}`);
    return res.data;
  },

  search: async (keyword: string): Promise<DigitalBookResponse[]> => {
    const res = await axiosInstance.get<DigitalBookResponse[]>(
      `${BASE}/books/search`,
      { params: { keyword } }
    );
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE}/books/${id}`);
  },
};