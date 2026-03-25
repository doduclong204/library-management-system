export interface DigitalBookPage {
  pageNumber: number;
  extractedText: string;
  imagePath: string;
  accuracyPercent: number;
}

export interface DigitalBookResponse {
  id: number;
  title: string;
  author: string;
  ocrDate: string;
  pages: DigitalBookPage[];
}