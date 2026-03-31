export interface Book {
  id: number;
  isbn: string;
  title: string;
  image_url?: string;
  genre?: string;
  publication_year?: number;
  total_copies: number;
  available_copies: number;
  authors: string[];
  price?: number;
}

export interface BookRequest {
  isbn: string;
  title: string;
  image_url?: string;
  genre?: string;
  publication_year?: number;
  total_copies: number;
  author_ids?: number[];
  author_names?: string[];
  price?: number;
}

export interface User {
  _id: number;
  username: string;
  email: string;
  full_name: string;
  account_locked: boolean;
  role: "LIBRARIAN" | "USER";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  error?: string;
  data: T;
}

export interface ApiPagination<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
    totalPatrons?: number;
  };
  result: T[];
}

export interface Fine {
  id: string;
  userId: string;
  userName: string;
  bookTitle: string;
  daysOverdue: number;
  finePerDay: number;
  totalFine: number;
  paid: boolean;
}

export type BorrowStatus = "borrowed" | "returned" | "overdue" | "lost" | "confiscated";

export interface BorrowRecord {
  id: string;
  bookId?: string;
  bookTitle: string;
  barcode?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  userId?: string;
  userName?: string;
  email?: string;
  status?: BorrowStatus;
  sessionId?: string;
  bookPrice?: number;
  bookPaid?: boolean;
}

export interface BookReturnSearchResponse {
  borrowRecordId: number;
  isbn: string;
  bookTitle: string;
  imageUrl?: string;
  bookCopyId: number;
  barcode: string;
  patronName: string;
  patronEmail: string;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  isOverdue: boolean;
  overdueDays: number;
  estimatedFine: number;
  bookPrice?: number;
}

export interface ReturnBookResponse {
  borrowRecordId: number;
  isbn: string;
  bookTitle: string;
  bookCopyId: number;
  barcode: string;
  patronName: string;
  patronEmail: string;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  overdueDays: number;
  fineAmount: number;
  hasFinePending: boolean;
  hasRefund: boolean;   
  refundAmount: number;     
  earlyDays: number;
  message: string;
}

export interface ReturnBookRequest {
  isbn?: string;
  title?: string;
  barcode?: string;
  returnDate: string;
}

export interface BorrowResponse {
  id: number;
  userName: string;
  email: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  fine?: number;
}

export interface PatronSearchResult {
  id: number;
  email: string;
  fullName: string;
  studentId?: string;
}

export interface BookCopy {
  id: number;
  barcode: string;
  status: "available" | "borrowed" | "lost";
  bookId: number;
  bookTitle: string;
  isbn: string;
}

export interface BorrowRequest {
  email: string;
  fullName?: string;
  studentId?: string;
  bookCopyId?: number;
  bookCopyIds?: number[];
  librarianId?: number;
  dueDate: string;
}