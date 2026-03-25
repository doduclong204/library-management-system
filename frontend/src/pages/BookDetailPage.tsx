import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/services/apiServices";
import BookCard from "@/components/BookCard";
import {
  BookOpen, Star, Calendar, Building, Hash,
  ArrowLeft, Loader2, Package,
} from "lucide-react";
import type { Book } from "@/types";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy chi tiết sách theo ID
  const { data: bookData, isLoading, isError } = useQuery({
    queryKey: ["book-detail", id],
    queryFn: async () => {
      const res = await bookApi.getById(Number(id));
      return res.data.data;
    },
    enabled: !!id,
  });

  // Lấy sách cùng thể loại để gợi ý
  const { data: relatedData } = useQuery({
    queryKey: ["books-related", bookData?.genre],
    queryFn: async () => {
      const res = await bookApi.getAll({ genre: bookData!.genre, size: 5 });
      return res.data.data?.result ?? [];
    },
    // Chỉ fetch khi đã có thể loại
    enabled: !!bookData?.genre,
  });

  // Lọc bỏ chính cuốn sách đang xem
  const relatedBooks: Book[] = (relatedData ?? [])
    .filter((b: Book) => String(b.id) !== String(id))
    .slice(0, 4);

  const authorStr = Array.isArray(bookData?.authors)
    ? bookData.authors.join(", ")
    : "";

  const isAvailable = (bookData?.available_copies ?? 0) > 0;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Không tìm thấy ──
  if (isError || !bookData) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">Không tìm thấy sách.</p>
        <button onClick={() => navigate("/")} className="btn-primary mt-4">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ảnh bìa */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            {bookData.image_url ? (
              <img
                src={
                  bookData.image_url.startsWith("http")
                    ? bookData.image_url
                    : `http://localhost:8080/api/v1${bookData.image_url.replace("/api/v1", "")}`
                }
                alt={bookData.title}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <BookOpen className="w-20 h-20 text-primary/30" />
            )}
          </div>
        </div>

        {/* Thông tin */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{bookData.title}</h1>
            {authorStr && (
              <p className="text-lg text-muted-foreground mt-1">{authorStr}</p>
            )}
          </div>

          {/* Trạng thái số lượng */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
              isAvailable
                ? "bg-success/10 text-success border border-success/20"
                : "bg-warning/10 text-warning border border-warning/20"
            }`}>
              <Package className="w-4 h-4" />
              {isAvailable
                ? `Còn ${bookData.available_copies} / ${bookData.total_copies} cuốn`
                : "Hiện đang mượn hết"}
            </span>
          </div>

          {/* Mô tả */}
          {bookData.genre && (
            <p className="text-muted-foreground leading-relaxed">
              {bookData.genre}
            </p>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="w-4 h-4 flex-shrink-0" />
              ISBN: {bookData.isbn}
            </div>
            {bookData.publication_year && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                Năm: {bookData.publication_year}
              </div>
            )}
            {bookData.genre && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                Thể loại: {bookData.genre}
              </div>
            )}
          </div>

          {/* Ghi chú cho độc giả */}
          <div className="glass-card p-4 text-sm text-muted-foreground border-l-4 border-primary/30">
            📌 Để mượn sách, vui lòng đến quầy thủ thư hoặc liên hệ nhân viên thư viện.
          </div>
        </div>
      </div>

      {/* Sách gợi ý cùng thể loại */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Sách gợi ý cùng thể loại</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedBooks.map(rb => (
              <BookCard
                key={rb.id}
                book={rb}
                onClick={(b) => navigate(`/books/${b.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage;