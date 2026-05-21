import type { User, BorrowRecord } from "@/types";

export const MOCK_ALL_USERS: User[] = [
  {
    id: "STU001", name: "Nguyễn Minh Anh", email: "minhanh@student.edu.vn", role: "user", studentId: "SV2024001",
    borrowedBooks: [
      { id: "BR001", bookId: "1", bookTitle: "The Great Gatsby", borrowDate: "2026-02-10", dueDate: "2026-03-10" },
      { id: "BR002", bookId: "3", bookTitle: "1984", borrowDate: "2026-02-15", dueDate: "2026-03-15" },
      { id: "BR003", bookId: "6", bookTitle: "Harry Potter and the Sorcerer's Stone", borrowDate: "2026-02-20", dueDate: "2026-02-27" },
      { id: "BR004", bookId: "5", bookTitle: "The Catcher in the Rye", borrowDate: "2026-01-10", dueDate: "2026-02-10", returnDate: "2026-02-08" },
    ],
  },
  {
    id: "STU002", name: "Trần Văn Bình", email: "vanbinh@student.edu.vn", role: "user", studentId: "SV2024002",
    borrowedBooks: [
      { id: "BR005", bookId: "8", bookTitle: "Brave New World", borrowDate: "2026-02-01", dueDate: "2026-02-20" },
      { id: "BR009", bookId: "7", bookTitle: "The Hobbit", borrowDate: "2026-01-05", dueDate: "2026-02-05", returnDate: "2026-02-03" },
    ],
  },
  {
    id: "STU003", name: "Lê Thị Cẩm", email: "thicam@student.edu.vn", role: "user", studentId: "SV2024003",
    borrowedBooks: [
      { id: "BR006", bookId: "15", bookTitle: "Sapiens", borrowDate: "2026-02-05", dueDate: "2026-03-05" },
    ],
  },
  {
    id: "STU004", name: "Phạm Đức Duy", email: "ducduy@student.edu.vn", role: "user", studentId: "SV2024004",
    borrowedBooks: [
      { id: "BR007", bookId: "19", bookTitle: "A Game of Thrones", borrowDate: "2026-01-20", dueDate: "2026-02-20" },
    ],
  },
  {
    id: "STU005", name: "Hoàng Thị Em", email: "hoangem@student.edu.vn", role: "user", studentId: "SV2024005",
    borrowedBooks: [
      { id: "BR008", bookId: "2", bookTitle: "To Kill a Mockingbird", borrowDate: "2026-01-15", dueDate: "2026-02-15", returnDate: "2026-02-14" },
    ],
  },
  {
    id: "STU006", name: "Ngô Quang Hải", email: "quanghai@student.edu.vn", role: "user", studentId: "SV2024006",
    borrowedBooks: [
      { id: "BR010", bookId: "10", bookTitle: "The Lord of the Rings", borrowDate: "2026-02-18", dueDate: "2026-03-18" },
      { id: "BR011", bookId: "13", bookTitle: "Dune", borrowDate: "2026-02-22", dueDate: "2026-03-22" },
    ],
  },
  {
    id: "STU007", name: "Võ Thị Giang", email: "thigiang@student.edu.vn", role: "user", studentId: "SV2024007",
    borrowedBooks: [],
  },
  {
    id: "STU008", name: "Đặng Hữu Phước", email: "huuphuoc@student.edu.vn", role: "user", studentId: "SV2024008",
    borrowedBooks: [
      { id: "BR012", bookId: "22", bookTitle: "Atomic Habits", borrowDate: "2026-02-25", dueDate: "2026-03-25" },
    ],
  },
  {
    id: "STU009", name: "Bùi Thanh Tâm", email: "thanhtam@student.edu.vn", role: "user", studentId: "SV2024009",
    borrowedBooks: [
      { id: "BR013", bookId: "4", bookTitle: "Pride and Prejudice", borrowDate: "2026-01-28", dueDate: "2026-02-25" },
      { id: "BR014", bookId: "12", bookTitle: "Jane Eyre", borrowDate: "2026-02-10", dueDate: "2026-03-10" },
    ],
  },
  {
    id: "STU010", name: "Lý Minh Tuấn", email: "minhtuan@student.edu.vn", role: "user", studentId: "SV2024010",
    borrowedBooks: [],
  },
  {
    id: "STU011", name: "Mai Hồng Ngọc", email: "hongngoc@student.edu.vn", role: "user", studentId: "SV2024011",
    borrowedBooks: [
      { id: "BR015", bookId: "14", bookTitle: "The Alchemist", borrowDate: "2026-02-12", dueDate: "2026-03-12" },
      { id: "BR016", bookId: "23", bookTitle: "Truyện Kiều", borrowDate: "2026-02-01", dueDate: "2026-02-15" },
    ],
  },
  {
    id: "LIB001", name: "Trần Thị Phượng", email: "librarian@library.com", role: "librarian",
    borrowedBooks: [],
  },
  {
    id: "LIB002", name: "Nguyễn Văn Hùng", email: "hung.nv@library.com", role: "librarian",
    borrowedBooks: [],
  },
];
