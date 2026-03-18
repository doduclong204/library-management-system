import { useState, useMemo, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle, List, BookX, Undo2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { borrowRecordApi, calculateFine } from "@/services/borrowRecordService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { BorrowRecord } from "@/types";

type StatusFilter = "all" | "borrowed" | "overdue" | "returned" | "lost";

const PAGE_SIZE = 5;

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "borrowed", label: "Đang mượn" },
  { value: "overdue", label: "Quá hạn" },
  { value: "returned", label: "Đã trả" },
  { value: "lost", label: "Mất sách" },
];

interface SessionGroup {
  sessionId: string;
  userName: string;
  email: string;
  borrowDate: string;
  records: BorrowRecord[];
}

const BorrowListPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [collapsedSessions, setCollapsedSessions] = useState<Set<string>>(new Set());

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowRecord | null>(null);
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [isReturning, setIsReturning] = useState(false);

  const { toast } = useToast();

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/borrows");
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setBorrows(data.sort((a: BorrowRecord, b: BorrowRecord) => Number(b.id) - Number(a.id)));
    } catch (err) {
      console.error("Lỗi tải danh sách mượn:", err);
      setError("Không thể tải danh sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrows(); }, []);
  useEffect(() => { setPage(1); }, [query, statusFilter]);

  const sessionGroups = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = borrows.filter(b => {
      const matchText = !q ||
        (b.userName ?? "").toLowerCase().includes(q) ||
        (b.email ?? "").toLowerCase().includes(q) ||
        (b.bookTitle ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchText && matchStatus;
    });

    const map = new Map<string, SessionGroup>();
    for (const b of filtered) {
      const key = b.sessionId ?? `solo-${b.id}`;
      if (!map.has(key)) {
        map.set(key, {
          sessionId: key,
          userName: b.userName ?? "—",
          email: b.email ?? "",
          borrowDate: b.borrowDate ?? "",
          records: [],
        });
      }
      map.get(key)!.records.push(b);
    }

    return Array.from(map.values()).sort((a, b) =>
      new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
    );
  }, [borrows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(sessionGroups.length / PAGE_SIZE));
  const paginatedGroups = sessionGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    total: borrows.length,
    borrowed: borrows.filter(b => b.status === "borrowed").length,
    overdue: borrows.filter(b => b.status === "overdue").length,
    returned: borrows.filter(b => b.status === "returned").length,
    lost: borrows.filter(b => b.status === "lost").length,
  }), [borrows]);

  const toggleSession = (sessionId: string) => {
    setCollapsedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const openReturnModal = (b: BorrowRecord) => {
    setSelectedBorrow(b);
    setReturnDate(new Date());
    setReturnModalOpen(true);
  };

  const handleReturn = async () => {
    if (!selectedBorrow) return;
    setIsReturning(true);
    try {
      const searchRes = await borrowRecordApi.search({ title: selectedBorrow.bookTitle });
      const records = searchRes.data ?? [];
      const match = records.find(r =>
        r.patronEmail === selectedBorrow.email &&
        r.bookTitle === selectedBorrow.bookTitle
      );
      if (!match) throw new Error("Không tìm thấy barcode của bản sao sách");

      const res = await borrowRecordApi.returnBook({
        barcode: match.barcode,
        returnDate: format(returnDate, "yyyy-MM-dd"),
      });
      const result = res.data;
      toast({
        title: "Trả sách thành công! ✅",
        description: result.hasFinePending
          ? `Phạt: ${result.fineAmount.toLocaleString("vi-VN")}đ (${result.overdueDays} ngày quá hạn)`
          : "Không có phạt. Trả đúng hạn!",
      });
      setReturnModalOpen(false);
      setSelectedBorrow(null);
      await fetchBorrows();
    } catch (err: unknown) {
      toast({
        title: "Lỗi trả sách",
        description: (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? (err as Error)?.message ?? "Đã xảy ra lỗi",
        variant: "destructive",
      });
    } finally {
      setIsReturning(false);
    }
  };

  const handleReturnAll = async (group: SessionGroup) => {
    const activeRecords = group.records.filter(r => r.status === "borrowed" || r.status === "overdue");
    if (activeRecords.length === 0) return;
    setIsReturning(true);
    try {
      for (const b of activeRecords) {
        const searchRes = await borrowRecordApi.search({ title: b.bookTitle });
        const records = searchRes.data ?? [];
        const match = records.find(r =>
          r.patronEmail === b.email &&
          r.bookTitle === b.bookTitle
        );
        if (!match) continue;
        await borrowRecordApi.returnBook({
          barcode: match.barcode,
          returnDate: format(new Date(), "yyyy-MM-dd"),
        });
      }
      toast({
        title: "Trả hết thành công! ✅",
        description: `Đã trả ${activeRecords.length} cuốn cho ${group.userName}.`,
      });
      await fetchBorrows();
    } catch (err: unknown) {
      toast({
        title: "Lỗi trả sách",
        description: (err as Error)?.message ?? "Đã xảy ra lỗi",
        variant: "destructive",
      });
    } finally {
      setIsReturning(false);
    }
  };

  const fine = selectedBorrow
    ? calculateFine(String(selectedBorrow.dueDate ?? "").slice(0, 10), format(returnDate, "yyyy-MM-dd"))
    : 0;

  const renderBadge = (b: BorrowRecord) => {
    const daysOverdue = b.status === "overdue"
      ? Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000)
      : 0;
    switch (b.status) {
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Đã trả
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3" /> Quá hạn {daysOverdue}d
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <BookX className="w-3 h-3" /> Mất sách
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Đang mượn
          </span>
        );
    }
  };

  const getSessionStatusSummary = (records: BorrowRecord[]) => {
    const hasOverdue = records.some(r => r.status === "overdue");
    const allReturned = records.every(r => r.status === "returned");
    const activeCnt = records.filter(r => r.status === "borrowed" || r.status === "overdue").length;
    if (allReturned) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3 h-3" /> Đã trả hết
      </span>
    );
    if (hasOverdue) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-3 h-3" /> Có sách quá hạn
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
        {activeCnt} sách đang mượn
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <List className="w-6 h-6 text-primary" /> Danh sách mượn sách
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Quản lý toàn bộ phiếu mượn — trả trực tiếp từ danh sách.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng giao dịch", value: counts.total, color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Đang mượn", value: counts.borrowed, color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Quá hạn", value: counts.overdue, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Đã trả", value: counts.returned, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{sessionGroups.length} phiếu mượn</span>
      </div>

      {/* Session Groups */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 gap-2 text-destructive">
            <AlertTriangle className="w-8 h-8" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchBorrows}>Thử lại</Button>
          </div>
        ) : paginatedGroups.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <List className="w-8 h-8 opacity-30" />
            <p className="text-sm">Không tìm thấy phiếu mượn nào.</p>
          </div>
        ) : (
          paginatedGroups.map(group => {
            const isCollapsed = collapsedSessions.has(group.sessionId);
            const hasActive = group.records.some(r => r.status === "borrowed" || r.status === "overdue");
            return (
              <div key={group.sessionId} className="glass-card overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border">
                  <button
                    onClick={() => toggleSession(group.sessionId)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{group.userName}</p>
                      <p className="text-xs text-muted-foreground">{group.email} · {group.borrowDate}</p>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      {getSessionStatusSummary(group.records)}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {group.records.length} cuốn
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasActive && (
                      <Button
                        size="sm"
                        onClick={() => handleReturnAll(group)}
                        disabled={isReturning}
                        className="gap-1.5 text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Undo2 className="w-3 h-3" /> Trả hết
                      </Button>
                    )}
                    <button onClick={() => toggleSession(group.sessionId)} className="p-1">
                      {isCollapsed
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        : <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      }
                    </button>
                  </div>
                </div>

                {/* Records */}
                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {group.records.map(b => (
                      <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{b.bookTitle}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Mượn: {b.borrowDate} · Hạn: {b.dueDate}
                            {b.returnDate && ` · Trả: ${b.returnDate}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {(b.fine ?? 0) > 0 && (
                            <span className="text-xs font-semibold text-red-600">
                              {Number(b.fine).toLocaleString("vi-VN")}đ
                            </span>
                          )}
                          {renderBadge(b)}
                          {(b.status === "borrowed" || b.status === "overdue") && (
                            <Button
                              size="sm"
                              onClick={() => openReturnModal(b)}
                              className="gap-1.5 text-xs bg-primary text-white hover:bg-primary/90 shadow-sm h-7"
                            >
                              <Undo2 className="w-3 h-3" /> Trả
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Trang {page} / {totalPages} · {sessionGroups.length} phiếu mượn
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p as number)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal trả sách */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Undo2 className="w-5 h-5 text-primary" /> Xác nhận trả sách
            </DialogTitle>
          </DialogHeader>

          {selectedBorrow && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người mượn</span>
                  <span className="font-semibold">{selectedBorrow.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sách</span>
                  <span className="font-semibold text-right max-w-[200px]">{selectedBorrow.bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày mượn</span>
                  <span>{selectedBorrow.borrowDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hạn trả</span>
                  <span className="font-medium">{selectedBorrow.dueDate}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1.5">Ngày trả thực tế</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(returnDate, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={d => d && setReturnDate(d)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {fine > 0 ? (
                <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Tiền phạt
                  </span>
                  <span>{fine.toLocaleString("vi-VN")}đ</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium">
                  <CheckCircle className="w-4 h-4" /> Trả đúng hạn — không có phạt
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Hủy</Button>
            <Button onClick={handleReturn} disabled={isReturning} className="gap-2 bg-primary text-white">
              <Undo2 className="w-4 h-4" />
              {isReturning ? "Đang xử lý..." : "Xác nhận trả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BorrowListPage;