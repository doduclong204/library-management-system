import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_BOOKS, RECOMMENDATIONS } from "@/data/mockBooks";
import BookCard from "@/components/BookCard";
import { BookOpen, Star, Calendar, Building, Hash, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@/types";

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const book = MOCK_BOOKS.find(b => b.id === id);

  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">Không tìm thấy sách.</p>
        <button onClick={() => navigate("/")} className="btn-primary mt-4">Về trang chủ</button>
      </div>
    );
  }

  // Related books by genre
  const relatedIds = RECOMMENDATIONS[book.genre] ?? [];
  const relatedBooks = relatedIds
    .filter(rid => rid !== book.id)
    .map(rid => MOCK_BOOKS.find(b => b.id === rid)!)
    .filter(Boolean)
    .slice(0, 4);

  const handleBorrow = () => {
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Email không hợp lệ.");
      return;
    }

    setBorrowing(true);
    // Simulate API call
    setTimeout(() => {
      setBorrowing(false);
      setBorrowed(true);
      toast({
        title: "Mượn sách thành công!",
        description: `"${book.title}" đã được ghi nhận. Hạn trả: 14 ngày. Email xác nhận sẽ gửi đến ${email}.`,
      });
    }, 1000);
  };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  return (
    <div className="space-y-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cover */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-primary/30" />
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">{book.author}</p>
          </div>

          {book.rating && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i <= Math.round(book.rating!) ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">{book.rating}/5</span>
            </div>
          )}

          <div className={`inline-flex text-sm font-medium px-3 py-1.5 rounded-full ${book.available && !borrowed ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"}`}>
            {book.available && !borrowed ? "Còn sẵn" : "Đang mượn"}
          </div>

          {book.description && (
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="w-4 h-4 flex-shrink-0" /> ISBN: {book.isbn}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" /> Năm: {book.year}
            </div>
            {book.publisher && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="w-4 h-4 flex-shrink-0" /> {book.publisher}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4 flex-shrink-0" /> {book.genre}
            </div>
          </div>

          {/* Borrow button */}
          {book.available && !borrowed && (
            <button
              onClick={() => setBorrowModalOpen(true)}
              className="btn-primary text-base py-3 px-8"
            >
              📚 Mượn ngay
            </button>
          )}

          {borrowed && (
            <div className="glass-card p-4 border-l-4 border-success flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Đã mượn thành công!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hạn trả: {dueDate.toLocaleDateString("vi-VN")} · Email xác nhận đã gửi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Sách gợi ý cùng thể loại</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedBooks.map(rb => (
              <BookCard key={rb.id} book={rb} onClick={(b) => navigate(`/books/${b.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Borrow modal */}
      {borrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setBorrowModalOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-lg shadow-xl max-w-md w-full animate-slide-up p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Mượn sách</h3>
            <p className="text-sm text-muted-foreground mb-4">
              "{book.title}" — Nhập email để xác nhận mượn sách.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email của bạn</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="ten.ban@gmail.com"
                    className="input-field pl-10"
                    autoFocus
                  />
                </div>
                {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
              </div>

              <div className="glass-card p-3 text-sm">
                <p className="text-muted-foreground">
                  📅 Hạn trả: <span className="font-medium text-foreground">{dueDate.toLocaleDateString("vi-VN")}</span> (14 ngày)
                </p>
                <p className="text-muted-foreground mt-1">
                  💰 Phạt quá hạn: <span className="font-medium text-foreground">5.000đ/ngày</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setBorrowModalOpen(false)}
                  className="btn-outline flex-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleBorrow}
                  disabled={borrowing}
                  className="btn-primary flex-1"
                >
                  {borrowing ? "Đang xử lý..." : "Xác nhận mượn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage;
