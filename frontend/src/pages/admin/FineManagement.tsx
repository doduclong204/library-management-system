import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { borrowRecordApi } from "@/services/borrowRecordService";
import { DollarSign, AlertTriangle, CheckCircle, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const FINE_PER_DAY = 5000;

const FineManagement = () => {
  const [query, setQuery] = useState("");

  const { data: overdueRecords = [], isLoading } = useQuery({
    queryKey: ["overdue-fines"],
    queryFn: async () => {
      const res = await borrowRecordApi.getOverdue();
      return res.data ?? [];
    },
  });

  const fines = overdueRecords.map(r => ({
    id: String(r.borrowRecordId),
    userName: r.patronName,
    studentId: r.studentId,
    bookTitle: r.bookTitle,
    barcode: r.barcode,
    daysOverdue: r.overdueDays,
    finePerDay: FINE_PER_DAY,
    totalFine: r.estimatedFine,
  }));

  const filtered = fines.filter(f => {
    const q = query.toLowerCase();
    return !q || f.userName.toLowerCase().includes(q) || f.bookTitle.toLowerCase().includes(q) || (f.studentId?.toLowerCase().includes(q));
  });

  const totalUnpaid = filtered.reduce((s, f) => s + f.totalFine, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Quản lý tiền phạt</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách sách quá hạn chưa trả. Tiền phạt tự động tính: {FINE_PER_DAY.toLocaleString("vi-VN")}đ/ngày.
        </p>
      </div>

      {/* Summary card */}
      <div className={`glass-card p-6 flex items-center gap-4 border-l-4 ${totalUnpaid > 0 ? "border-destructive" : "border-success"}`}>
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${totalUnpaid > 0 ? "bg-destructive/10" : "bg-success/10"}`}>
          <DollarSign className={`w-7 h-7 ${totalUnpaid > 0 ? "text-destructive" : "text-success"}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tổng tiền phạt ước tính (chưa trả)</p>
          <p className={`text-3xl font-bold ${totalUnpaid > 0 ? "text-destructive" : "text-success"}`}>
            {totalUnpaid.toLocaleString("vi-VN")}đ
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fines.length} phiếu mượn quá hạn
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm theo tên, sách, MSSV..." className="pl-10" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người mượn</TableHead>
              <TableHead>Sách</TableHead>
              <TableHead>Ngày quá hạn</TableHead>
              <TableHead>Phạt/ngày</TableHead>
              <TableHead>Tổng phạt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  Không có khoản phạt nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">
                    <div>{f.userName}</div>
                    {f.studentId && <span className="text-xs text-muted-foreground">{f.studentId}</span>}
                  </TableCell>
                  <TableCell>{f.bookTitle}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> {f.daysOverdue} ngày
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.finePerDay.toLocaleString("vi-VN")}đ</TableCell>
                  <TableCell className="font-semibold text-destructive">{f.totalFine.toLocaleString("vi-VN")}đ</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        Xử lý trả sách và thu phạt tại trang <strong>Trả sách</strong>.
      </p>
    </div>
  );
};

export default FineManagement;
