import { useAuth } from "@/context/AuthContext";
import { History, Calendar, BookOpen } from "lucide-react";

const BorrowHistoryPage = () => {
  const { user } = useAuth();
  const allRecords = [...(user?.borrowedBooks ?? [])].sort(
    (a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <History className="w-6 h-6 text-primary" /> Lịch sử mượn sách
        </h1>
        <p className="text-muted-foreground mt-1">Toàn bộ lịch sử mượn và trả sách của bạn.</p>
      </div>

      {allRecords.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Chưa có lịch sử mượn sách.</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Sách</th>
                <th className="table-header">Ngày mượn</th>
                <th className="table-header">Hạn trả</th>
                <th className="table-header">Ngày trả</th>
                <th className="table-header">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allRecords.map(record => {
                const isReturned = !!record.returnDate;
                const isOverdue = !isReturned && new Date(record.dueDate) < new Date();
                return (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary/50 flex-shrink-0" />
                        <span className="font-medium">{record.bookTitle}</span>
                      </div>
                    </td>
                    <td className="table-cell text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{record.borrowDate}</span>
                    </td>
                    <td className="table-cell text-muted-foreground">{record.dueDate}</td>
                    <td className="table-cell text-muted-foreground">{record.returnDate || "—"}</td>
                    <td className="table-cell">
                      {isReturned ? (
                        <span className="badge-available">Đã trả</span>
                      ) : isOverdue ? (
                        <span className="badge-overdue">Quá hạn</span>
                      ) : (
                        <span className="badge-checked-out">Đang mượn</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowHistoryPage;
