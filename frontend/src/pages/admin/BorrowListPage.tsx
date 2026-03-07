import { useState, useMemo } from "react";
import { MOCK_ALL_USERS } from "@/data/mockUsers";
import { MOCK_BORROW_TRANSACTIONS } from "@/data/mockBooks";
import { Search, Calendar, AlertTriangle, CheckCircle, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const DAILY_FINE_RATE = 5000;

type StatusFilter = "all" | "active" | "overdue" | "returned";

const BorrowListPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Build unified borrow list from all users
  const allBorrows = useMemo(() => {
    return MOCK_ALL_USERS.flatMap(user =>
      user.borrowedBooks.map(b => ({
        ...b,
        userName: user.name,
        userEmail: user.email,
        studentId: user.studentId,
      }))
    ).sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allBorrows.filter(b => {
      const matchText = !q ||
        b.userName.toLowerCase().includes(q) ||
        b.userEmail.toLowerCase().includes(q) ||
        b.bookTitle.toLowerCase().includes(q) ||
        (b.studentId || "").toLowerCase().includes(q);

      const isReturned = !!b.returnDate;
      const isOverdue = !isReturned && new Date(b.dueDate) < new Date();

      let matchStatus = true;
      if (statusFilter === "active") matchStatus = !isReturned && !isOverdue;
      if (statusFilter === "overdue") matchStatus = isOverdue;
      if (statusFilter === "returned") matchStatus = isReturned;

      return matchText && matchStatus;
    });
  }, [allBorrows, query, statusFilter]);

  const overdueCount = allBorrows.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length;
  const activeCount = allBorrows.filter(b => !b.returnDate).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <List className="w-6 h-6 text-primary" /> Danh sách mượn sách
        </h1>
        <p className="text-muted-foreground mt-1">
          Tổng cộng {allBorrows.length} giao dịch · {activeCount} đang mượn · {overdueCount} quá hạn
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm theo email, tên, MSSV, sách..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang mượn</SelectItem>
            <SelectItem value="overdue">Quá hạn</SelectItem>
            <SelectItem value="returned">Đã trả</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} kết quả</span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
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
            {filtered.map(b => {
              const isReturned = !!b.returnDate;
              const isOverdue = !isReturned && new Date(b.dueDate) < new Date();
              const daysOverdue = isOverdue
                ? Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000)
                : 0;
              const fine = daysOverdue * DAILY_FINE_RATE;

              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{b.userName}</p>
                      <p className="text-xs text-muted-foreground">{b.userEmail}</p>
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
                  <TableCell>
                    {isReturned ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                        <CheckCircle className="w-3 h-3" /> Đã trả
                      </Badge>
                    ) : isOverdue ? (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <AlertTriangle className="w-3 h-3" /> Quá hạn {daysOverdue}d
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Đang mượn</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {fine > 0 ? (
                      <span className="font-semibold text-destructive text-sm">
                        {fine.toLocaleString("vi-VN")}đ
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">Không tìm thấy giao dịch nào.</p>
        )}
      </div>
    </div>
  );
};

export default BorrowListPage;
