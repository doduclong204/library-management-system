import type { Book } from "@/types";

export const MOCK_BOOKS: Book[] = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", genre: "Classic", year: 1925, available: false, description: "A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.", publisher: "Scribner", rating: 4.2 },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", genre: "Classic", year: 1960, available: true, description: "The unforgettable novel of a childhood in a sleepy Southern town.", publisher: "J. B. Lippincott & Co.", rating: 4.7 },
  { id: "3", title: "1984", author: "George Orwell", isbn: "978-0451524935", genre: "Dystopian", year: 1949, available: false, description: "A dystopian social science fiction novel and cautionary tale about totalitarianism.", publisher: "Secker & Warburg", rating: 4.5 },
  { id: "4", title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", genre: "Romance", year: 1813, available: true, description: "A romantic novel following the emotional development of Elizabeth Bennet.", publisher: "T. Egerton", rating: 4.6 },
  { id: "5", title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0316769488", genre: "Classic", year: 1951, available: true, description: "The story of Holden Caulfield's experiences in New York City.", publisher: "Little, Brown", rating: 3.8 },
  { id: "6", title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", isbn: "978-0590353427", genre: "Fantasy", year: 1997, available: true, description: "A young wizard discovers his magical heritage on his eleventh birthday.", publisher: "Bloomsbury", rating: 4.8 },
  { id: "7", title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227", genre: "Fantasy", year: 1937, available: true, description: "Bilbo Baggins embarks on an unexpected journey with dwarves.", publisher: "George Allen & Unwin", rating: 4.6 },
  { id: "8", title: "Brave New World", author: "Aldous Huxley", isbn: "978-0060850524", genre: "Dystopian", year: 1932, available: false, description: "A futuristic World State of genetically modified citizens.", publisher: "Chatto & Windus", rating: 4.3 },
  { id: "9", title: "Percy Jackson & The Lightning Thief", author: "Rick Riordan", isbn: "978-0786838653", genre: "Fantasy", year: 2005, available: true, description: "A teenager discovers he is the son of Poseidon and sets out on a quest.", publisher: "Miramax Books", rating: 4.4 },
  { id: "10", title: "The Lord of the Rings", author: "J.R.R. Tolkien", isbn: "978-0618640157", genre: "Fantasy", year: 1954, available: true, description: "An epic high-fantasy novel about the quest to destroy the One Ring.", publisher: "George Allen & Unwin", rating: 4.9 },
  { id: "11", title: "Fahrenheit 451", author: "Ray Bradbury", isbn: "978-1451673319", genre: "Dystopian", year: 1953, available: true, description: "A future society where books are outlawed and firemen burn them.", publisher: "Ballantine Books", rating: 4.1 },
  { id: "12", title: "Jane Eyre", author: "Charlotte Brontë", isbn: "978-0141441146", genre: "Classic", year: 1847, available: true, description: "An orphaned girl grows up to become a governess at Thornfield Hall.", publisher: "Smith, Elder & Co.", rating: 4.4 },
  { id: "13", title: "Dune", author: "Frank Herbert", isbn: "978-0441172719", genre: "Science Fiction", year: 1965, available: true, description: "Set in the distant future, the saga of Paul Atreides on the desert planet Arrakis.", publisher: "Chilton Books", rating: 4.7 },
  { id: "14", title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0062315007", genre: "Fiction", year: 1988, available: true, description: "A young Andalusian shepherd follows his dream to find treasure in Egypt.", publisher: "HarperOne", rating: 4.2 },
  { id: "15", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbn: "978-0062316097", genre: "Non-Fiction", year: 2011, available: false, description: "An exploration of the history of humankind from ancient times to the present.", publisher: "Harper", rating: 4.5 },
  { id: "16", title: "The Art of War", author: "Sun Tzu", isbn: "978-1599869773", genre: "Philosophy", year: -500, available: true, description: "An ancient Chinese military treatise on strategy and tactics.", publisher: "Various", rating: 4.3 },
  { id: "17", title: "Crime and Punishment", author: "Fyodor Dostoevsky", isbn: "978-0486415871", genre: "Classic", year: 1866, available: true, description: "A psychological novel exploring morality through the story of a murderer.", publisher: "The Russian Messenger", rating: 4.6 },
  { id: "18", title: "The Hunger Games", author: "Suzanne Collins", isbn: "978-0439023481", genre: "Dystopian", year: 2008, available: true, description: "In a dystopian future, teens fight to the death in a televised event.", publisher: "Scholastic", rating: 4.3 },
  { id: "19", title: "A Game of Thrones", author: "George R.R. Martin", isbn: "978-0553103540", genre: "Fantasy", year: 1996, available: false, description: "Noble families wage war for control of the Iron Throne.", publisher: "Bantam Spectra", rating: 4.5 },
  { id: "20", title: "Educated", author: "Tara Westover", isbn: "978-0399590504", genre: "Non-Fiction", year: 2018, available: true, description: "A memoir about a woman who leaves her survivalist family to pursue education.", publisher: "Random House", rating: 4.7 },
  { id: "21", title: "The Name of the Wind", author: "Patrick Rothfuss", isbn: "978-0756404741", genre: "Fantasy", year: 2007, available: true, description: "A legendary hero tells the story of his life to a chronicler.", publisher: "DAW Books", rating: 4.6 },
  { id: "22", title: "Atomic Habits", author: "James Clear", isbn: "978-0735211292", genre: "Non-Fiction", year: 2018, available: true, description: "Practical strategies for forming good habits and breaking bad ones.", publisher: "Avery", rating: 4.8 },
  { id: "23", title: "Truyện Kiều", author: "Nguyễn Du", isbn: "978-6041234567", genre: "Classic", year: 1820, available: true, description: "Kiệt tác văn học Việt Nam kể về cuộc đời nàng Kiều.", publisher: "NXB Văn học", rating: 4.9 },
  { id: "24", title: "Số Đỏ", author: "Vũ Trọng Phụng", isbn: "978-6041234568", genre: "Satire", year: 1936, available: true, description: "Tiểu thuyết châm biếm xã hội Việt Nam đầu thế kỷ 20.", publisher: "NXB Văn học", rating: 4.5 },
];

export const DIGITAL_BOOKS = [
  { id: "d1", title: "Khảo luận về Khoa học Thư viện", author: "Nguyễn Văn Minh", year: 1887, ocrDate: "2025-11-15", accuracy: 94, ocrText: "Việc phân loại sách cẩn thận là nền tảng mà trên đó một thư viện lớn được xây dựng. Mỗi cuốn sách phải được ghi chép chính xác — tiêu đề, tác giả, ngày xuất bản và tình trạng — để các học giả của các thế hệ tương lai có thể tìm thấy trong những bức tường này kiến thức mà họ tìm kiếm." },
  { id: "d2", title: "Lịch sử Sài Gòn cổ", author: "Trần Thanh Long", year: 1912, ocrDate: "2025-12-03", accuracy: 89, ocrText: "Sài Gòn, thành phố trẻ trung và sôi động, mang trong mình những dấu ấn lịch sử sâu đậm từ thời kỳ Pháp thuộc. Những con phố rợp bóng cây, những tòa nhà kiến trúc thuộc địa vẫn còn đứng vững qua bao thăng trầm của thời gian." },
  { id: "d3", title: "Cổ thư Y học phương Đông", author: "Lê Hữu Trác", year: 1770, ocrDate: "2025-12-20", accuracy: 82, ocrText: "Y học cổ truyền phương Đông lấy nguyên lý âm dương ngũ hành làm nền tảng. Việc chẩn đoán bệnh dựa trên bốn phương pháp: vọng, văn, vấn, thiết — tức là nhìn, nghe, hỏi và bắt mạch." },
  { id: "d4", title: "Địa lý Đông Dương", author: "Pierre Gourou", year: 1936, ocrDate: "2026-01-10", accuracy: 91, ocrText: "Đông Dương thuộc Pháp bao gồm năm xứ: Tonkin, Annam, Cochinchine, Cambodge và Laos. Vùng đất này có khí hậu nhiệt đới gió mùa, với hai mùa rõ rệt: mùa khô và mùa mưa." },
  { id: "d5", title: "Phật giáo Việt Nam thời Lý-Trần", author: "Thích Nhất Hạnh", year: 1967, ocrDate: "2026-01-25", accuracy: 96, ocrText: "Thời kỳ Lý-Trần là giai đoạn hưng thịnh nhất của Phật giáo Việt Nam. Các vua Lý và Trần đều là những Phật tử thuần thành, đã xây dựng nhiều chùa tháp và ban hành nhiều chính sách hộ pháp." },
  { id: "d6", title: "Tục ngữ ca dao Việt Nam", author: "Vũ Ngọc Phan", year: 1956, ocrDate: "2026-02-05", accuracy: 88, ocrText: "Ca dao tục ngữ là kho tàng tri thức dân gian Việt Nam. Những câu nói ngắn gọn nhưng chứa đựng bài học sâu sắc về cuộc sống, tình yêu, lao động và thiên nhiên." },
  { id: "d7", title: "Kiến trúc cổ Huế", author: "Phan Thuận An", year: 1982, ocrDate: "2026-02-15", accuracy: 93, ocrText: "Kinh thành Huế là quần thể di tích cung đình nhà Nguyễn được xây dựng trên diện tích hơn 500 hecta. Kiến trúc cung đình Huế mang đậm nét phong cách Á Đông kết hợp với ảnh hưởng của kiến trúc Pháp." },
];

export const RECOMMENDATIONS: Record<string, string[]> = {
  "Fantasy": ["6", "7", "9", "10", "19", "21"],
  "Classic": ["1", "2", "4", "5", "12", "17", "23"],
  "Dystopian": ["3", "8", "11", "18"],
  "Science Fiction": ["13"],
  "Non-Fiction": ["15", "20", "22"],
};

export const MOCK_BORROW_TRANSACTIONS = [
  { id: "TX001", bookId: "1", bookTitle: "The Great Gatsby", userId: "STU001", userName: "Nguyễn Minh Anh", borrowDate: "2026-02-10", dueDate: "2026-03-10", returnDate: null },
  { id: "TX002", bookId: "3", bookTitle: "1984", userId: "STU001", userName: "Nguyễn Minh Anh", borrowDate: "2026-02-15", dueDate: "2026-03-15", returnDate: null },
  { id: "TX003", bookId: "6", bookTitle: "Harry Potter and the Sorcerer's Stone", userId: "STU001", userName: "Nguyễn Minh Anh", borrowDate: "2026-02-20", dueDate: "2026-02-27", returnDate: null },
  { id: "TX004", bookId: "5", bookTitle: "The Catcher in the Rye", userId: "STU001", userName: "Nguyễn Minh Anh", borrowDate: "2026-01-10", dueDate: "2026-02-10", returnDate: "2026-02-08" },
  { id: "TX005", bookId: "8", bookTitle: "Brave New World", userId: "STU002", userName: "Trần Văn Bình", borrowDate: "2026-02-01", dueDate: "2026-02-20", returnDate: null },
  { id: "TX006", bookId: "15", bookTitle: "Sapiens", userId: "STU003", userName: "Lê Thị Cẩm", borrowDate: "2026-02-05", dueDate: "2026-03-05", returnDate: null },
  { id: "TX007", bookId: "19", bookTitle: "A Game of Thrones", userId: "STU004", userName: "Phạm Đức Duy", borrowDate: "2026-01-20", dueDate: "2026-02-20", returnDate: null },
  { id: "TX008", bookId: "2", bookTitle: "To Kill a Mockingbird", userId: "STU005", userName: "Hoàng Thị Em", borrowDate: "2026-01-15", dueDate: "2026-02-15", returnDate: "2026-02-14" },
  { id: "TX009", bookId: "7", bookTitle: "The Hobbit", userId: "STU002", userName: "Trần Văn Bình", borrowDate: "2026-01-05", dueDate: "2026-02-05", returnDate: "2026-02-03" },
  { id: "TX010", bookId: "10", bookTitle: "The Lord of the Rings", userId: "STU006", userName: "Ngô Quang Hải", borrowDate: "2026-02-18", dueDate: "2026-03-18", returnDate: null },
];
