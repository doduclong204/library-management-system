import { useState } from "react";
import { MOCK_ALL_USERS } from "@/data/mockUsers";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const DAILY_FINE_RATE = 5000;

const FineManagement = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const initialFines = MOCK_ALL_USERS.flatMap(u =>
    u.borrowedBooks
      .filter(b => !b.returnDate && new Date(b.dueDate) < new Date())
      .map(b => {
        const days = Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000);
        return {
          id: b.id, userId: u.id, userName: u.name,
          bookTitle: b.bookTitle, daysOverdue: days,
          finePerDay: DAILY_FINE_RATE, totalFine: days * DAILY_FINE_RATE, paid: false,
        };
      })
  );

  const [fines, setFines] = useState(initialFines);
  const totalUnpaid = fines.filter(f => !f.paid).reduce((s, f) => s + f.totalFine, 0);
  const totalPaid = fines.filter(f => f.paid).reduce((s, f) => s + f.totalFine, 0);

  const handlePay = (id: string) => {
    setFines(fines.map(f => f.id === id ? { ...f, paid: true } : f));
    toast({ title: "Đã thanh toán", description: "Khoản phạt đã được xác nhận." });
  };

  const filtered = fines.filter(f => {
    const q = query.toLowerCase();
    return !q || f.userName.toLowerCase().includes(q) || f.bookTitle.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Quản lý tiền phạt</h1>
        <p className="text-muted-foreground mt-1">Xem và xử lý các khoản phạt quá hạn.</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={`glass-card p-6 flex items-center gap-4 border-l-4 ${totalUnpaid > 0 ? "border-destructive" : "border-success"}`}>
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${totalUnpaid > 0 ? "bg-destructive/10" : "bg-success/10"}`}>
            <DollarSign className={`w-7 h-7 ${totalUnpaid > 0 ? "text-destructive" : "text-success"}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
            <p className={`text-3xl font-bold ${totalUnpaid > 0 ? "text-destructive" : "text-success"}`}>
              {totalUnpaid.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-success">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-success/10">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
            <p className="text-3xl font-bold text-success">{totalPaid.toLocaleString("vi-VN")}đ</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm theo tên người dùng, sách..." className="pl-10" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Sách</TableHead>
              <TableHead>Ngày quá hạn</TableHead>
              <TableHead>Phạt/ngày</TableHead>
              <TableHead>Tổng phạt</TableHead>
              <TableHead className="text-right">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.userName}</TableCell>
                <TableCell>{f.bookTitle}</TableCell>
                <TableCell>
                  <Badge variant="destructive" className="text-xs gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> {f.daysOverdue} ngày
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{f.finePerDay.toLocaleString("vi-VN")}đ</TableCell>
                <TableCell className="font-semibold text-destructive">{f.totalFine.toLocaleString("vi-VN")}đ</TableCell>
                <TableCell className="text-right">
                  {f.paid ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                      <CheckCircle className="w-3 h-3" /> Đã thanh toán
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => handlePay(f.id)}>Xác nhận TT</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">Không có khoản phạt nào.</p>
        )}
      </div>
    </div>
  );
};

export default FineManagement;
