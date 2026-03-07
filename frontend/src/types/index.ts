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
  id: string;
  name: string;
  email: string;
  role: "librarian" | "user";
  studentId?: string;
  avatar?: string;
  borrowedBooks: BorrowRecord[];
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

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

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
