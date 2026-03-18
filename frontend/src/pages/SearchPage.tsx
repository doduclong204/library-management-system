import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookApi } from "@/services/apiServices";
import BookCard from "@/components/BookCard";
import { Search, Loader2, SlidersHorizontal, X } from "lucide-react";
import type { Book } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

const GENRES = [
  "Tất cả", "Programming", "Software Engineering", "Satire",
  "Classic", "Fantasy", "Dystopian", "Romance", "Science Fiction",
  "Non-Fiction", "Fiction", "Philosophy",
];

const SORT_OPTIONS = [
  { value: "", label: "Mới nhất" },
  { value: "title_asc", label: "Tên A → Z" },
  { value: "title_desc", label: "Tên Z → A" },
  { value: "year_asc", label: "Năm cũ nhất" },
  { value: "year_desc", label: "Năm mới nhất" },
];

const PAGE_SIZE = 12;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "Tất cả");
  const [authorFilter, setAuthorFilter] = useState(searchParams.get("author") || "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("yearFrom") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("yearTo") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const debouncedAuthor = useDebounce(authorFilter, 400);
  const debouncedYearFrom = useDebounce(yearFrom, 400);
  const debouncedYearTo = useDebounce(yearTo, 400);

  const fetchBooks = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: p,
        size: PAGE_SIZE,
        keyword: debouncedQuery,
        genre: genre === "Tất cả" ? "" : genre,
        authorName: debouncedAuthor,
        sortBy,
      };
      if (debouncedYearFrom) params.yearFrom = Number(debouncedYearFrom);
      if (debouncedYearTo) params.yearTo = Number(debouncedYearTo);

      const res = await bookApi.getAll(params);
      const data = res.data.data;
      let result = data?.result ?? [];

      if (onlyAvailable) {
        result = result.filter(b => b.available_copies > 0);
      }

      setBooks(result);
      setTotal(data?.meta.total ?? 0);
      setTotalPages(data?.meta.pages ?? 1);
      setPage(p);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, genre, debouncedAuthor, debouncedYearFrom, debouncedYearTo, sortBy, onlyAvailable]);

  useEffect(() => {
    fetchBooks(1);
    const params: Record<string, string> = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (genre !== "Tất cả") params.genre = genre;
    if (debouncedAuthor) params.author = debouncedAuthor;
    if (debouncedYearFrom) params.yearFrom = debouncedYearFrom;
    if (debouncedYearTo) params.yearTo = debouncedYearTo;
    if (sortBy) params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, genre, debouncedAuthor, debouncedYearFrom, debouncedYearTo, sortBy, onlyAvailable]);

  const hasActiveFilters = genre !== "Tất cả" || authorFilter || yearFrom || yearTo || sortBy || onlyAvailable;

  const clearFilters = () => {
    setGenre("Tất cả");
    setAuthorFilter("");
    setYearFrom("");
    setYearTo("");
    setSortBy("");
    setOnlyAvailable(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Tìm kiếm sách</h1>
        <p className="text-muted-foreground mt-1">Tìm sách theo tên, tác giả, ISBN hoặc nội dung.</p>
      </div>

      {/* Wrapper chung — search bar + filter panel cùng width */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm sách theo tên, tác giả, ISBN, nội dung OCR..."
              className="input-field pl-11 text-base py-3 w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0 ${
              showFilters || hasActiveFilters
                ? "bg-primary text-white border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white" />}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="glass-card p-4 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Thể loại</label>
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="input-field w-full"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g === "Tất cả" ? "📚 Tất cả thể loại" : g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sắp xếp</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-field w-full"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tác giả</label>
                <input
                  type="text"
                  value={authorFilter}
                  onChange={e => setAuthorFilter(e.target.value)}
                  placeholder="Tìm theo tác giả..."
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Năm xuất bản</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={yearFrom}
                    onChange={e => setYearFrom(e.target.value)}
                    placeholder="Từ"
                    className="input-field w-full"
                    min={1000}
                    max={2100}
                  />
                  <span className="text-muted-foreground text-sm shrink-0">—</span>
                  <input
                    type="number"
                    value={yearTo}
                    onChange={e => setYearTo(e.target.value)}
                    placeholder="Đến"
                    className="input-field w-full"
                    min={1000}
                    max={2100}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                Chỉ sách còn sẵn
              </label>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" /> Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {loading ? "Đang tìm..." : `${total} sách`}
        </span>
        {hasActiveFilters && !showFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Không tìm thấy sách.</p>
          <p className="text-sm mt-1">Thử điều chỉnh từ khóa hoặc bộ lọc.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => fetchBooks(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => fetchBooks(p as number)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        page === p
                          ? "bg-primary text-white border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => fetchBooks(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;