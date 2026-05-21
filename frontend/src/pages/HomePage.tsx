import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/services/apiServices";
import BookCard from "@/components/BookCard";
import { Search, BookOpen, Users, Sparkles, Clock, Loader2 } from "lucide-react";
import type { Book } from "@/types";

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Lấy toàn bộ sách từ API — lấy trang đầu, pageSize lớn để hiển thị
  const { data, isLoading } = useQuery({
    queryKey: ["books-home"],
    queryFn: async () => {
      const res = await bookApi.getAll({ page: 1, size: 20 });
      return res.data.data; // { meta, result }
    },
  });

  const books: Book[] = data?.result ?? [];

  // Sách nổi bật: còn sách để mượn
  const featuredBooks = books.filter(b => (b.available_copies ?? 0) > 0).slice(0, 8);

  // Đang được mượn nhiều: hết sách
  const borrowedBooks = books.filter(b => (b.available_copies ?? 0) === 0).slice(0, 4);

  // Thống kê
  const totalBooks = data?.meta?.total ?? 0;
  const availableBooks = books.filter(b => (b.available_copies ?? 0) > 0).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-8 sm:py-12">
        <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-5">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Thư viện Trung tâm Thành phố
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Tìm kiếm, khám phá và mượn sách dễ dàng
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sách theo tên, tác giả, ISBN..."
              className="w-full pl-12 pr-28 py-4 rounded-xl border border-input bg-card text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-6 py-2.5 rounded-lg"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
        <div className="text-center p-4 glass-card">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalBooks}</p>
          <p className="text-xs text-muted-foreground">Tổng sách</p>
        </div>
        <div className="text-center p-4 glass-card">
          <Sparkles className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold">{availableBooks}</p>
          <p className="text-xs text-muted-foreground">Còn sẵn</p>
        </div>
        <div className="text-center p-4 glass-card">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{data?.meta?.totalPatrons || 0}</p>
          <p className="text-xs text-muted-foreground">Độc giả</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Sách nổi bật */}
      {!isLoading && featuredBooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sách nổi bật</h2>
            <button
              onClick={() => navigate("/search")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={(b) => navigate(`/books/${b.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Đang được mượn nhiều */}
      {!isLoading && borrowedBooks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Đang được mượn nhiều
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {borrowedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={(b) => navigate(`/books/${b.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;