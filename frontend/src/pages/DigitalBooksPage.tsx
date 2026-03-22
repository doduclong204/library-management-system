// src/pages/DigitalBooksPage.tsx

import { useState, useEffect } from "react";
import { Search, FileText, BookOpen, X, Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";

interface DigitalBook {
  id: number;
  title: string;
  author: string;
  extractedText: string;
  imagePath: string;
  ocrDate: string;
  accuracyPercent: number;
}

const DigitalBooksPage = () => {
  const [books, setBooks]           = useState<DigitalBook[]>([]);
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(true);
  const [viewingBook, setViewingBook] = useState<DigitalBook | null>(null);

  // ── Load dữ liệu thật từ backend ──────────────────────
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<DigitalBook[]>("/ocr/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Không thể tải sách số:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Tìm kiếm ──────────────────────────────────────────
  const handleSearch = async (value: string) => {
    setQuery(value);
    try {
      if (value.trim()) {
        const res = await axiosInstance.get<DigitalBook[]>("/ocr/books/search", {
          params: { keyword: value }
        });
        setBooks(res.data);
      } else {
        fetchBooks();
      }
    } catch (err) {
      console.error("Tìm kiếm thất bại:", err);
    }
  };

  // ── Format date ────────────────────────────────────────
  const fmtDate = (iso: string) => iso?.split("T")[0] ?? "—";

  // ── Truncate text ──────────────────────────────────────
  const truncate = (str: string, n = 120) =>
    str?.length > n ? str.slice(0, n) + "…" : str ?? "";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Sách số
        </h1>
        <p className="text-muted-foreground mt-1">
          Đọc online các bản scan sách cổ đã được số hóa. Không cần đăng nhập.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm sách số theo tên, tác giả hoặc nội dung..."
          className="pl-11"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-muted-foreground py-12">
          Đang tải sách số...
        </div>
      )}

      {/* Results grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book => (
            <div key={book.id} className="glass-card p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-20 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-muted-foreground">{book.author || "Không rõ tác giả"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    OCR: {fmtDate(book.ocrDate)} · {book.accuracyPercent}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">
                {truncate(book.extractedText)}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingBook(book)}
                className="w-full gap-2"
              >
                <Eye className="w-4 h-4" /> Đọc online
              </Button>
            </div>
          ))}

          {books.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              {query ? "Không tìm thấy sách số phù hợp." : "Chưa có sách số nào."}
            </div>
          )}
        </div>
      )}

      {/* Reader Modal */}
      {viewingBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingBook(null)}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">{viewingBook.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {viewingBook.author || "Không rõ tác giả"} · OCR {fmtDate(viewingBook.ocrDate)} · {viewingBook.accuracyPercent}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" title="Phóng to">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Thu nhỏ">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => setViewingBook(null)}
                  className="p-2 rounded hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-muted/30 rounded-lg p-6 border border-border min-h-[400px]">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-4 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Nội dung sách số (OCR)
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif">
                  {viewingBook.extractedText || "Không có nội dung."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="gap-1" disabled>
                <ChevronLeft className="w-4 h-4" /> Trang trước
              </Button>
              <span className="text-xs text-muted-foreground">Trang 1 / 1</span>
              <Button variant="ghost" size="sm" className="gap-1" disabled>
                Trang sau <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalBooksPage;