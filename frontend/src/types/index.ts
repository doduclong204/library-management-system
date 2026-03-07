export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  year: number;
  available: boolean;
  coverUrl?: string;
  description?: string;
  publisher?: string;
  rating?: number;
  quantity?: number;
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

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  userId?: string;
  userName?: string;
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

