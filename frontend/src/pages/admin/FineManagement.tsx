import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowRecordApi } from "@/services/borrowRecordService";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, AlertTriangle, CheckCircle, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const FINE_PER_DAY = 5000;

const FineManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  const { data: overdueRecords = [], isLoading: isLoadingOverdue } = useQuery({
    queryKey: ["overdue-fines"],
    queryFn: async () => {
      const res = await borrowRecordApi.getOverdue();
      return res.data ?? [];
    },
  });

  const { data: paidRecords = [], isLoading: isLoadingPaid } = useQuery({
    queryKey: ["paid-fines"],
    queryFn: async () => {
      const res = await borrowRecordApi.getPaidRecords();
      return res.data ?? [];
    },
  });

  const { data: totalPaid = 0 } = useQuery({
    queryKey: ["paid-total"],
    queryFn: async () => {
      const res = await borrowRecordApi.getPaidTotal();
      return res.data ?? 0;
    },
  });

  const payMutation = useMutation({
    mutationFn: (id: number) => borrowRecordApi.payFine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overdue-fines"] });
      queryClient.invalidateQueries({ queryKey: ["paid-fines"] });
      queryClient.invalidateQueries({ queryKey: ["paid-total"] });
      toast({ title: "Đã thanh toán", description: "Khoản phạt đã được xác nhận." });
    },
    onError: (err: any) => {
      toast({
        title: "Lỗi",
        description: err?.response?.data?.message ?? "Thanh toán thất bại.",
        variant: "destructive",
      });
    },
  });

  const unpaidFines = overdueRecords.map(r => ({
    id: r.borrowRecordId,
    userName: r.patronName,
    studentId: r.studentId,
    bookTitle: r.bookTitle,
    daysOverdue: r.overdueDays,
    finePerDay: FINE_PER_DAY,
    totalFine: r.estimatedFine,
    paid: false,
  }));

  const paidFines = paidRecords.map(r => ({
    id: r.borrowRecordId,
    userName: r.patronName,
    studentId: r.studentId,
    bookTitle: r.bookTitle,
    daysOverdue: r.overdueDays,
    finePerDay: FINE_PER_DAY,
    totalFine: r.estimatedFine,
    paid: true,
  }));

  const allFines = [...unpaidFines, ...paidFines];

  const filtered = allFines.filter(f => {
    const q = query.toLowerCase();
    return !q || f.userName.toLowerCase().includes(q) || f.bookTitle.toLowerCase().includes(q) || f.studentId?.toLowerCase().includes(q);
  });

  const totalUnpaid = unpaidFines.reduce((s, f) => s + f.totalFine, 0);
  const isLoading = isLoadingOverdue || isLoadingPaid;

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
            <p className="text-3xl font-bold text-success">
              {Number(totalPaid).toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm theo tên người dùng, sách, MSSV..."
          className="pl-10"
        />
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
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
                  <TableCell className="text-right">
                    {f.paid ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                        <CheckCircle className="w-3 h-3" /> Đã thanh toán
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => payMutation.mutate(f.id)}
                        disabled={payMutation.isPending}
                      >
                        {payMutation.isPending && payMutation.variables === f.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : "Xác nhận TT"}
                      </Button>
                    )}
                  </TableCell>
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