//book
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
}

export interface BookRequest {
  isbn: string;
  title: string;
  image_url?: string;
  genre?: string;
  publication_year?: number;
  total_copies: number;
  author_ids: number[];
}

export interface User {
  _id: number;
  username: string;
  email: string;
  full_name: string;
  account_locked: boolean;
  role: "LIBRARIAN" | "USER";
}

//auth, login
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

//phantrang
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

//borrow
export type BorrowStatus = "borrowed" | "returned" | "overdue" | "lost";

export interface BorrowRecord {
  id: string;
  bookId?: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  userId?: string;
  userName?: string;
  email?: string;
  status?: BorrowStatus;
}

// return book
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
  message: string;
}

export interface ReturnBookRequest {
  isbn?: string;
  title?: string;
  barcode?: string;
  returnDate: string;
}