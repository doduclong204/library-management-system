import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, BookOpen, Calendar, DollarSign, AlertTriangle, Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAILY_FINE_RATE = 5000;

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");

  if (!user) return null;

  const overdueBooks = user.borrowedBooks.filter(b => !b.returnDate && new Date(b.dueDate) < new Date());
  const totalFines = overdueBooks.reduce((sum, b) => {
    const days = Math.max(0, Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000));
    return sum + days * DAILY_FINE_RATE;
  }, 0);

  const handleSave = () => {
    if (!name.trim()) return;
    updateUser({ name: name.trim() });
    setEditing(false);
    toast({ title: "Đã cập nhật", description: "Thông tin cá nhân đã được lưu." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-header">Hồ sơ cá nhân</h1>

      <div className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input value={name} onChange={e => setName(e.target.value)} className="input-field max-w-xs" />
                <button onClick={handleSave} className="btn-primary flex items-center gap-1 text-xs py-2 px-3">
                  <Save className="w-3.5 h-3.5" /> Lưu
                </button>
                <button onClick={() => { setEditing(false); setName(user.name); }} className="btn-outline text-xs py-2 px-3">Hủy</button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {user.name}
                  <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-muted transition-colors">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.studentId && <p className="text-xs text-muted-foreground">MSSV: {user.studentId}</p>}
              </div>
            )}
            <span className="inline-block mt-1 text-xs font-medium uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {user.role === "user" ? "Sinh viên" : "Thủ thư"}
            </span>
          </div>
        </div>
      </div>

      {totalFines > 0 && (
        <div className="glass-card p-5 border-l-4 border-destructive">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm mb-2">
            <AlertTriangle className="w-5 h-5" />
            Tiền phạt chưa thanh toán: {totalFines.toLocaleString("vi-VN")}đ
          </div>
          <ul className="space-y-1">
            {overdueBooks.map(b => {
              const days = Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000);
              return (
                <li key={b.id} className="text-sm text-muted-foreground flex justify-between">
                  <span>"{b.bookTitle}" — quá hạn {days} ngày</span>
                  <span className="font-medium text-destructive">{(days * DAILY_FINE_RATE).toLocaleString("vi-VN")}đ</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Sách đã mượn
        </h2>
        {user.borrowedBooks.length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa mượn sách nào.</p>
        ) : (
          <div className="glass-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Sách</th>
                  <th className="table-header">Ngày mượn</th>
                  <th className="table-header">Hạn trả</th>
                  <th className="table-header">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {user.borrowedBooks.map(record => {
                  const overdue = !record.returnDate && new Date(record.dueDate) < new Date();
                  const days = Math.floor((Date.now() - new Date(record.dueDate).getTime()) / 86400000);
                  return (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                      <td className="table-cell font-medium">{record.bookTitle}</td>
                      <td className="table-cell text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{record.borrowDate}</div>
                      </td>
                      <td className="table-cell text-muted-foreground">{record.dueDate}</td>
                      <td className="table-cell">
                        {record.returnDate ? (
                          <span className="badge-available">Đã trả</span>
                        ) : overdue ? (
                          <span className="badge-overdue flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Quá hạn — {(days * DAILY_FINE_RATE).toLocaleString("vi-VN")}đ
                          </span>
                        ) : (
                          <span className="badge-available">Đang mượn</span>
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
    </div>
  );
};

export default UserProfile;
