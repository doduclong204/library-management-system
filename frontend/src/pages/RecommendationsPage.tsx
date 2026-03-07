import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_BOOKS, RECOMMENDATIONS } from "@/data/mockBooks";
import BookCard from "@/components/BookCard";
import BookDetailModal from "@/components/BookDetailModal";
import { Sparkles } from "lucide-react";
import type { Book } from "@/types";

const RecommendationsPage = () => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const borrowedIds = user?.borrowedBooks?.map(b => b.bookId) ?? [];
  const borrowedBooks = MOCK_BOOKS.filter(b => borrowedIds.includes(b.id));
  const borrowedGenres = [...new Set(borrowedBooks.map(b => b.genre))];

  const recommended = borrowedGenres.length > 0
    ? [...new Set(borrowedGenres.flatMap(g => RECOMMENDATIONS[g] ?? []))]
        .filter(id => !borrowedIds.includes(id))
        .map(id => MOCK_BOOKS.find(b => b.id === id)!)
        .filter(Boolean)
    : MOCK_BOOKS.filter(b => b.available).slice(0, 6);

  // Group by genre for "Nếu bạn thích..." sections
  const genreGroups = borrowedGenres.map(genre => ({
    genre,
    reason: `Cùng thể loại ${genre}`,
    books: (RECOMMENDATIONS[genre] ?? [])
      .filter(id => !borrowedIds.includes(id))
      .map(id => MOCK_BOOKS.find(b => b.id === id)!)
      .filter(Boolean),
  })).filter(g => g.books.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-secondary" /> Gợi ý sách
        </h1>
        <p className="text-muted-foreground mt-1">
          {borrowedGenres.length > 0
            ? `Dựa trên sở thích đọc ${borrowedGenres.join(", ")} của bạn.`
            : "Những cuốn sách phổ biến để bạn bắt đầu."}
        </p>
      </div>

      {genreGroups.length > 0 ? (
        genreGroups.map(({ genre, reason, books }) => (
          <div key={genre}>
            <h2 className="text-base font-semibold mb-1">
              Nếu bạn thích {borrowedBooks.find(b => b.genre === genre)?.title}...
            </h2>
            <p className="text-xs text-muted-foreground mb-3">{reason}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={setSelectedBook}
                  onAction={book.available ? () => {} : undefined}
                  actionLabel="Mượn ngay"
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommended.map(book => (
            <BookCard key={book.id} book={book} onClick={setSelectedBook} />
          ))}
        </div>
      )}

      {recommended.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Chưa có gợi ý. Hãy mượn sách trước!</p>
      )}

      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};

export default RecommendationsPage;
