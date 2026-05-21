import type { Book } from "@/types";
import { X, BookOpen, Star, Calendar, Building, Hash } from "lucide-react";

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
}

const BookDetailModal = ({ book, onClose }: BookDetailModalProps) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Cover */}
        <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-t-lg">
          <BookOpen className="w-16 h-16 text-primary/30" />
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{book.title}</h2>
            <p className="text-muted-foreground">{book.author}</p>
          </div>

          {book.rating && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(book.rating!) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">{book.rating}/5</span>
            </div>
          )}

          <div className={book.available ? "badge-available" : "badge-checked-out"}>
            {book.available ? "Còn sẵn" : "Đã mượn"}
          </div>

          {book.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="w-4 h-4" /> ISBN: {book.isbn}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" /> Năm: {book.year}
            </div>
            {book.publisher && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="w-4 h-4" /> {book.publisher}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" /> {book.genre}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
