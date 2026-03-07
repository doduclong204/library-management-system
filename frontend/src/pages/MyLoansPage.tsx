import { useAuth } from "@/context/AuthContext";
import { BookOpen, Calendar, AlertTriangle } from "lucide-react";

const DAILY_FINE_RATE = 5000;

const MyLoansPage = () => {
  const { user } = useAuth();
  const activeLoans = user?.borrowedBooks?.filter(b => !b.returnDate) ?? [];
  const returnedLoans = user?.borrowedBooks?.filter(b => b.returnDate) ?? [];

  const getDaysInfo = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / 86400000);
    return diff;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Sách của tôi</h1>
        <p className="text-muted-foreground mt-1">Danh sách sách đang mượn và lịch sử.</p>
      </div>

      {/* Active loans */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Đang mượn ({activeLoans.length})</h2>
        {activeLoans.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn chưa mượn sách nào.</p>
        ) : (
          <div className="space-y-3">
            {activeLoans.map(loan => {
              const daysLeft = getDaysInfo(loan.dueDate);
              const isOverdue = daysLeft < 0;
              const isDueSoon = daysLeft >= 0 && daysLeft <= 3;
              const fine = isOverdue ? Math.abs(daysLeft) * DAILY_FINE_RATE : 0;

              return (
                <div key={loan.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-16 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{loan.bookTitle}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> Mượn: {loan.borrowDate} · Hạn: {loan.dueDate}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {isOverdue ? (
                      <div>
                        <span className="badge-overdue flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Quá hạn {Math.abs(daysLeft)} ngày
                        </span>
                        <p className="text-xs text-destructive font-medium mt-1">{fine.toLocaleString("vi-VN")}đ phạt</p>
                      </div>
                    ) : isDueSoon ? (
                      <span className="badge-checked-out">Còn {daysLeft} ngày</span>
                    ) : (
                      <span className="badge-available">Còn {daysLeft} ngày</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      {returnedLoans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Lịch sử</h2>
          <div className="glass-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Sách</th>
                  <th className="table-header">Ngày mượn</th>
                  <th className="table-header">Ngày trả</th>
                  <th className="table-header">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {returnedLoans.map(loan => (
                  <tr key={loan.id}>
                    <td className="table-cell font-medium">{loan.bookTitle}</td>
                    <td className="table-cell text-muted-foreground">{loan.borrowDate}</td>
                    <td className="table-cell text-muted-foreground">{loan.returnDate}</td>
                    <td className="table-cell"><span className="badge-available">Đã trả</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLoansPage;
