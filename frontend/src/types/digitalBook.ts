// src/types/digitalBook.ts

export interface DigitalBookResponse {
  id: number;
  title: string;
  author: string;
  extractedText: string;
  imagePath: string;
  ocrDate: string;       // ISO string từ backend
  accuracyPercent: number;
}

export interface DigitalBookRequest {
  title: string;
  author?: string;
}