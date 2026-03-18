import { useState, useMemo, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle, List, BookX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import api from "@/services/api";
import type { BorrowRecord } from "@/types";

type StatusFilter = "all" | "borrowed" | "overdue" | "returned" | "lost";

const BorrowListPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/borrows");
        // Hỗ trợ cả 2 dạng response: plain array hoặc wrapped { data: [...] }
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
setBorrows(data.sort((a: BorrowRecord, b: BorrowRecord) => Number(b.id) - Number(a.id)));
      } catch (err) {
        console.error("Lỗi tải danh sách mượn:", err);
        setError("Không thể tải danh sách. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return borrows.filter(b => {
      const matchText = !q ||
        (b.userName ?? "").toLowerCase().includes(q) ||
        (b.email ?? "").toLowerCase().includes(q) ||
        (b.bookTitle ?? "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        b.status === statusFilter;

      return matchText && matchStatus;
    });
  }, [borrows, query, statusFilter]);

  const counts = useMemo(() => ({
    total: borrows.length,
    borrowed: borrows.filter(b => b.status === "borrowed").length,
    overdue: borrows.filter(b => b.status === "overdue").length,
    lost: borrows.filter(b => b.status === "lost").length,
  }), [borrows]);

  const renderBadge = (b: BorrowRecord) => {
    const daysOverdue = b.status === "overdue"
      ? Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000)
      : 0;

    switch (b.status) {
      case "returned":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
            <CheckCircle className="w-3 h-3" /> Đã trả
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" /> Quá hạn {daysOverdue}d
          </Badge>
        );
      case "lost":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 gap-1 text-xs">
            <BookX className="w-3 h-3" /> Mất sách
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">Đang mượn</Badge>
        );
    }
  };

  const renderFine = (b: BorrowRecord) => {
    const amount = b.fine ?? 0;
    if (amount > 0) {
      return (
        <span className="font-semibold text-destructive text-sm">
          {Number(amount).toLocaleString("vi-VN")}đ
        </span>
      );
    }
    return <span className="text-muted-foreground text-sm">—</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <List className="w-6 h-6 text-primary" /> Danh sách mượn sách
        </h1>
        <p className="text-muted-foreground mt-1">
          Tổng cộng {counts.total} giao dịch · {counts.borrowed} đang mượn · {counts.overdue} quá hạn · {counts.lost} mất sách
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email, tên sách..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="borrowed">Đang mượn</SelectItem>
            <SelectItem value="overdue">Quá hạn</SelectItem>
            <SelectItem value="returned">Đã trả</SelectItem>
            <SelectItem value="lost">Mất sách</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} kết quả</span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-center py-12 text-sm text-destructive">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người mượn</TableHead>
                <TableHead>Sách</TableHead>
                <TableHead className="hidden md:table-cell">Ngày mượn</TableHead>
                <TableHead>Hạn trả</TableHead>
                <TableHead className="hidden sm:table-cell">Ngày trả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Phạt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{b.userName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{b.email ?? ""}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{b.bookTitle}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {b.borrowDate}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.dueDate}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {b.returnDate || "—"}
                  </TableCell>
                  <TableCell>{renderBadge(b)}</TableCell>
                  <TableCell className="text-right">{renderFine(b)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">Không tìm thấy giao dịch nào.</p>
        )}
      </div>
    </div>
  );
};

export default BorrowListPage;