import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowRecordApi } from "@/services/borrowRecordService";
import { paymentApi, type CreatePaymentResponse } from "@/services/paymentApi";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign, AlertTriangle, CheckCircle, Search,
  Loader2, QrCode, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const FINE_PER_DAY = 5000;

// ─── Format tiền VND ────────────────────────────────────────────
const vnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

// ─── PaymentModal ───────────────────────────────────────────────
// Component hiển thị QR VietQR và nút xác nhận thanh toán
interface PaymentModalProps {
  borrowRecordId: number;       // ID borrow_record cần thanh toán
  onClose: () => void;           // Đóng modal
  onConfirmed: () => void;        // Callback khi xác nhận xong
}

const PaymentModal = ({ borrowRecordId, onClose, onConfirmed }: PaymentModalProps) => {
  const { toast } = useToast();

  // Bước hiện tại: loading → showQR → confirming → done
  const [step, setStep] = useState<"loading" | "showQR" | "confirming" | "done">("loading");
  const [qrData, setQrData] = useState<CreatePaymentResponse | null>(null);

  // Gọi API tạo QR ngay khi modal mở
  // TanStack Query v5 đã bỏ onSuccess/onError trong useQuery → dùng useEffect thay thế
  const { data: qrResult, error: qrError } = useQuery({
    queryKey: ["create-payment", borrowRecordId],
    queryFn: async () => {
      const res = await paymentApi.create(borrowRecordId);
      return res.data;
    },
    enabled: step === "loading",
    retry: false,
  });

  useEffect(() => {
    if (qrResult && step === "loading") {
      setQrData(qrResult);
      setStep("showQR");
    }
  }, [qrResult]);

  useEffect(() => {
    if (qrError && step === "loading") {
      toast({
        title: "Không thể tạo QR",
        description: (qrError as any)?.response?.data?.message ?? "Vui lòng thử lại.",
        variant: "destructive",
      });
      onClose();
    }
  }, [qrError]);

  // Mutation xác nhận đã thu tiền
  // useMutation vẫn hỗ trợ onSuccess/onError trong v5
  const confirmMutation = useMutation({
    mutationFn: () => paymentApi.confirm(qrData!.paymentCode),
    onSuccess: () => {
      setStep("done");
      toast({ title: "Thanh toán thành công!", description: "Khoản phạt đã được xác nhận." });
      onConfirmed();
    },
    onError: (err: any) => {
      toast({
        title: "Xác nhận thất bại",
        description: err?.response?.data?.message ?? "Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Thanh toán tiền phạt
          </DialogTitle>
        </DialogHeader>

        {/* ── Đang tải ── */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang tạo mã QR...</p>
          </div>
        )}

        {/* ── Hiển thị QR ── */}
        {(step === "showQR" || step === "confirming") && qrData && (
          <div className="flex flex-col items-center gap-4">
            {/* Ảnh QR từ VietQR — dùng trực tiếp bằng <img> */}
            <img
              src={qrData.qrUrl}
              alt="QR VietQR thanh toán"
              className="w-52 h-52 rounded-lg border border-border object-contain"
            />

            {/* Thông tin chuyển khoản */}
            <div className="w-full rounded-lg bg-muted/50 px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngân hàng</span>
                <span className="font-medium">{qrData.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tài khoản</span>
                <span className="font-medium">{qrData.accountNumber}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-1">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-semibold text-destructive">{vnd(Number(qrData.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nội dung CK</span>
                <code className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-mono">
                  {qrData.paymentCode}
                </code>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Sau khi người dùng quét QR và chuyển khoản,
              bấm <strong>Xác nhận</strong> để cập nhật trạng thái.
            </p>

            {/* Nút xác nhận */}
            <Button
              className="w-full gap-2"
              onClick={() => {
                setStep("confirming");
                confirmMutation.mutate();
              }}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Xác nhận đã thanh toán
            </Button>
          </div>
        )}

        {/* ── Thành công ── */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="font-medium text-success">Thanh toán thành công!</p>
            <p className="text-sm text-muted-foreground text-center">
              Khoản phạt đã được ghi nhận và cập nhật.
            </p>
            <Button variant="outline" className="mt-2" onClick={onClose}>
              Đóng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── FineManagement ─────────────────────────────────────────────
const FineManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  // ID borrow_record đang mở modal thanh toán (null = đóng modal)
  const [payingRecordId, setPayingRecordId] = useState<number | null>(null);

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

  // Refresh tất cả query sau khi xác nhận thanh toán thành công
  const handlePaymentConfirmed = () => {
    setPayingRecordId(null);
    queryClient.invalidateQueries({ queryKey: ["overdue-fines"] });
    queryClient.invalidateQueries({ queryKey: ["paid-fines"] });
    queryClient.invalidateQueries({ queryKey: ["paid-total"] });
  };

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
    return (
      !q ||
      f.userName.toLowerCase().includes(q) ||
      f.bookTitle.toLowerCase().includes(q) ||
      f.studentId?.toLowerCase().includes(q)
    );
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
              <TableHead className="text-right">Thao tác</TableHead>
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
                    {f.studentId && (
                      <span className="text-xs text-muted-foreground">{f.studentId}</span>
                    )}
                  </TableCell>
                  <TableCell>{f.bookTitle}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> {f.daysOverdue} ngày
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.finePerDay.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell className="font-semibold text-destructive">
                    {f.totalFine.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell className="text-right">
                    {f.paid ? (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20 gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Đã thanh toán
                      </Badge>
                    ) : (
                      /* Nút mở modal QR thanh toán */
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => setPayingRecordId(f.id)}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Thanh toán QR
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

      {/* Modal QR — chỉ render khi đã chọn 1 bản ghi */}
      {payingRecordId !== null && (
        <PaymentModal
          borrowRecordId={payingRecordId}
          onClose={() => setPayingRecordId(null)}
          onConfirmed={handlePaymentConfirmed}
        />
      )}
    </div>
  );
};

export default FineManagement;