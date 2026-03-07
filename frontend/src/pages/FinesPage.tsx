import { useAuth } from "@/context/AuthContext";
import { DollarSign, AlertTriangle } from "lucide-react";

const DAILY_FINE_RATE = 5000;

const FinesPage = () => {
  const { user } = useAuth();

  const overdueBooks = (user?.borrowedBooks ?? []).filter(b => {
    if (b.returnDate) return false;
    return new Date(b.dueDate) < new Date();
  });

  const fineDetails = overdueBooks.map(b => {
    const daysOverdue = Math.floor((new Date().getTime() - new Date(b.dueDate).getTime()) / 86400000);
    return { ...b, daysOverdue, fine: daysOverdue * DAILY_FINE_RATE };
  });

  const totalFines = fineDetails.reduce((sum, b) => sum + b.fine, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Tiền phạt</h1>
        <p className="text-muted-foreground mt-1">Chi tiết tiền phạt sách quá hạn.</p>
      </div>

      {/* Summary card */}
      <div className={`glass-card p-6 flex items-center gap-4 ${totalFines > 0 ? "border-l-4 border-destructive" : "border-l-4 border-success"}`}>
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${totalFines > 0 ? "bg-destructive/10" : "bg-success/10"}`}>
          <DollarSign className={`w-7 h-7 ${totalFines > 0 ? "text-destructive" : "text-success"}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tổng tiền phạt</p>
          <p className={`text-3xl font-bold ${totalFines > 0 ? "text-destructive" : "text-success"}`}>
            {totalFines.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {fineDetails.length > 0 ? (
        <div className="glass-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Sách</th>
                <th className="table-header">Hạn trả</th>
                <th className="table-header">Số ngày quá hạn</th>
                <th className="table-header">Phạt/ngày</th>
                <th className="table-header text-right">Tổng phạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fineDetails.map(b => (
                <tr key={b.id}>
                  <td className="table-cell font-medium">{b.bookTitle}</td>
                  <td className="table-cell text-muted-foreground">{b.dueDate}</td>
                  <td className="table-cell">
                    <span className="badge-overdue flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" /> {b.daysOverdue} ngày
                    </span>
                  </td>
                  <td className="table-cell text-muted-foreground">{DAILY_FINE_RATE.toLocaleString("vi-VN")}đ</td>
                  <td className="table-cell text-right font-semibold text-destructive">{b.fine.toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">🎉 Không có sách quá hạn!</p>
          <p className="text-sm mt-1">Bạn không có khoản phạt nào.</p>
        </div>
      )}

      {totalFines > 0 && (
        <p className="text-sm text-muted-foreground text-center italic">
          Liên hệ thủ thư để thanh toán tiền phạt.
        </p>
      )}
    </div>
  );
};

export default FinesPage;
