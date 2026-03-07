import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_BOOKS, RECOMMENDATIONS } from "@/data/mockBooks";
import BookCard from "@/components/BookCard";
import BookDetailModal from "@/components/BookDetailModal";
import { BookOpen, Clock, DollarSign, Calendar } from "lucide-react";
import type { Book } from "@/types";

const DAILY_FINE_RATE = 5000; // VND

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const activeLoans = user?.borrowedBooks?.filter(b => !b.returnDate) ?? [];
  const overdueLoans = activeLoans.filter(b => new Date(b.dueDate) < new Date());
  const dueSoon = activeLoans.filter(b => {
    const days = Math.ceil((new Date(b.dueDate).getTime() - new Date().getTime()) / 86400000);
    return days >= 0 && days <= 3;
  });

  const totalFines = overdueLoans.reduce((sum, b) => {
    const days = Math.max(0, Math.floor((new Date().getTime() - new Date(b.dueDate).getTime()) / 86400000));
    return sum + days * DAILY_FINE_RATE;
  }, 0);

  // Recommendations based on borrowed genres
  const borrowedIds = user?.borrowedBooks?.map(b => b.bookId) ?? [];
  const borrowedBooks = MOCK_BOOKS.filter(b => borrowedIds.includes(b.id));
  const borrowedGenres = [...new Set(borrowedBooks.map(b => b.genre))];
  const recommended = borrowedGenres.length > 0
    ? [...new Set(borrowedGenres.flatMap(g => RECOMMENDATIONS[g] ?? []))]
        .filter(id => !borrowedIds.includes(id))
        .map(id => MOCK_BOOKS.find(b => b.id === id)!)
        .filter(Boolean)
        .slice(0, 6)
    : MOCK_BOOKS.filter(b => b.available).slice(0, 6);

  const recentActivity = [...(user?.borrowedBooks ?? [])].sort((a, b) =>
    new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
  ).slice(0, 3);

  const stats = [
    {
      label: "Sách đang mượn",
      value: activeLoans.length,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Sắp đến hạn",
      value: dueSoon.length,
      icon: Clock,
      color: dueSoon.length > 0 ? "text-destructive" : "text-muted-foreground",
      bg: dueSoon.length > 0 ? "bg-destructive/10" : "bg-muted",
    },
    {
      label: "Tiền phạt còn nợ",
      value: totalFines > 0 ? `${totalFines.toLocaleString("vi-VN")}đ` : "0đ",
      icon: DollarSign,
      color: totalFines > 0 ? "text-warning" : "text-success",
      bg: totalFines > 0 ? "bg-warning/10" : "bg-success/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="page-header">Xin chào, {user?.name?.split(" ").pop()}! 👋</h1>
        <p className="text-muted-foreground mt-1">Chào mừng quay lại thư viện.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Gợi ý cho bạn</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recommended.map(book => (
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

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <div className="glass-card divide-y divide-border">
          {recentActivity.map(record => (
            <div key={record.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{record.bookTitle}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Mượn ngày {record.borrowDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {record.returnDate ? (
                  <span className="badge-available">Đã trả</span>
                ) : new Date(record.dueDate) < new Date() ? (
                  <span className="badge-overdue">Quá hạn</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Hạn trả: {record.dueDate}</span>
                )}
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
          )}
        </div>
      </div>

      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};

export default Dashboard;
