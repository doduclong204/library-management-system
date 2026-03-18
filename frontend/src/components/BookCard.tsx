import type { Book } from "@/types";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
  onAction?: (book: Book) => void;
  actionLabel?: string;
  onClick?: (book: Book) => void;
}

const BookCard = ({ book, onAction, actionLabel, onClick }: BookCardProps) => {
  const isAvailable = (book.available_copies ?? 0) > 0;
  const authorStr = Array.isArray(book.authors)
    ? book.authors.join(", ")
    : (book as any).author ?? "";

  const imageUrl = book.image_url
    ? book.image_url.startsWith("http")
      ? book.image_url
      : `http://localhost:8080/api/v1${book.image_url.replace("/api/v1", "")}`
    : null;

  return (
    <div
      className="glass-card overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group flex flex-col"
      onClick={() => onClick?.(book)}
    >
      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <BookOpen className="w-14 h-14 text-primary/30 group-hover:text-primary/50 transition-colors" />
        )}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
          isAvailable
            ? "bg-emerald-500/90 text-white"
            : "bg-slate-500/80 text-white"
        }`}>
          {isAvailable ? `Còn ${book.available_copies}` : "Hết"}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
          {authorStr}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          {book.publication_year && (
            <span className="text-xs text-muted-foreground">{book.publication_year}</span>
          )}
          {book.genre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {book.genre}
            </span>
          )}
        </div>
        {onAction && (
          <button
            onClick={e => { e.stopPropagation(); onAction(book); }}
            disabled={!isAvailable && actionLabel === "Mượn ngay"}
            className="btn-primary text-xs py-1.5 px-3 mt-2 w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {actionLabel || "Xem"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;