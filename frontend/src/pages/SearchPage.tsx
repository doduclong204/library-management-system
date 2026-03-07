import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MOCK_BOOKS, DIGITAL_BOOKS } from "@/data/mockBooks";
import BookCard from "@/components/BookCard";
import { Search, FileText } from "lucide-react";
import type { Book } from "@/types";

const GENRES = ["Tất cả", "Classic", "Fantasy", "Dystopian", "Romance", "Science Fiction", "Non-Fiction", "Fiction", "Philosophy", "Satire"];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState("Tất cả");
  const [authorFilter, setAuthorFilter] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Content search: match in title, author, ISBN, description, AND digital book OCR text
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return MOCK_BOOKS.filter(b => {
      const matchText = !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        (b.description?.toLowerCase().includes(q));
      const matchGenre = genre === "Tất cả" || b.genre === genre;
      const matchAuthor = !authorFilter || b.author.toLowerCase().includes(authorFilter.toLowerCase());
      const matchAvail = !onlyAvailable || b.available;
      return matchText && matchGenre && matchAuthor && matchAvail;
    });
  }, [query, genre, authorFilter, onlyAvailable]);

  // Digital books matching content
  const digitalResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return DIGITAL_BOOKS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.ocrText.toLowerCase().includes(q)
    ).map(b => {
      const idx = b.ocrText.toLowerCase().indexOf(q);
      const start = Math.max(0, idx - 40);
      const end = Math.min(b.ocrText.length, idx + q.length + 40);
      const snippet = (start > 0 ? "..." : "") + b.ocrText.slice(start, end) + (end < b.ocrText.length ? "..." : "");
      return { ...b, snippet };
    });
  }, [query]);

  const handleBookClick = (book: Book) => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Tìm kiếm sách</h1>
        <p className="text-muted-foreground mt-1">Tìm sách theo tên, tác giả, ISBN hoặc nội dung.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm sách theo tên, tác giả, ISBN, nội dung OCR..."
          className="input-field pl-11 text-base py-3"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input-field w-auto"
        >
          {GENRES.map(g => <option key={g} value={g}>{g === "Tất cả" ? "📚 Tất cả thể loại" : g}</option>)}
        </select>

        <input
          type="text"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          placeholder="Lọc theo tác giả..."
          className="input-field w-auto max-w-[200px]"
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="w-4 h-4 rounded border-input accent-primary"
          />
          Chỉ sách còn sẵn
        </label>

        <span className="text-sm text-muted-foreground ml-auto">
          {results.length} sách{digitalResults.length > 0 ? ` · ${digitalResults.length} sách số` : ""}
        </span>
      </div>

      {/* Digital book content matches */}
      {digitalResults.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Kết quả từ sách số (OCR)
          </h2>
          <div className="space-y-2">
            {digitalResults.map(db => (
              <div key={db.id} className="glass-card p-4 flex items-start gap-3">
                <div className="w-10 h-14 rounded bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-secondary/50" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{db.title}</p>
                  <p className="text-xs text-muted-foreground">{db.author} · {db.year}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">"{db.snippet}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map(book => (
          <BookCard key={book.id} book={book} onClick={handleBookClick} />
        ))}
      </div>

      {results.length === 0 && digitalResults.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Không tìm thấy sách.</p>
          <p className="text-sm mt-1">Thử điều chỉnh từ khóa tìm kiếm.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
