import type { Book } from "@/types";
import { BookOpen, Star } from "lucide-react";

interface BookCardProps {
  book: Book;
  onAction?: (book: Book) => void;
  actionLabel?: string;
  onClick?: (book: Book) => void;
}

const BookCard = ({ book, onAction, actionLabel, onClick }: BookCardProps) => {
  return (
    <div
      className="glass-card overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => onClick?.(book)}
    >
      {/* Cover placeholder */}
      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-primary/30 group-hover:text-primary/50 transition-colors" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-xs text-muted-foreground mb-2">{book.author}</p>

        {/* Rating */}
        {book.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`w-3 h-3 ${i <= Math.round(book.rating!) ? "text-warning fill-warning" : "text-muted"}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{book.rating}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className={book.available ? "badge-available" : "badge-checked-out"}>
            {book.available ? "Còn sẵn" : "Đã mượn"}
          </span>
          {onAction && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(book); }}
              disabled={!book.available && actionLabel === "Mượn ngay"}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLabel || "Xem"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
