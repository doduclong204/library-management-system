import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowRecordApi } from "@/services/borrowRecordService";
import { paymentApi, type CreatePaymentResponse } from "@/services/paymentApi";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Search,
  Loader2,
  QrCode,
  ShieldAlert,
  Banknote,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 10;

const vnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const Pagination = ({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <span className="text-xs text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
      </span>
      <Button
        size="icon"
        variant="outline"
        className="w-7 h-7"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="w-7 h-7"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

interface PaymentModalProps {
  borrowRecordIds?: number[];
  onClose: () => void;
  onConfirmed: () => void;
}

const PaymentModal = ({ borrowRecordIds, onClose, onConfirmed }: PaymentModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"loading" | "showQR" | "confirming" | "done">("loading");
  const [qrData, setQrData] = useState<CreatePaymentResponse | null>(null);

  const { data: qrResult, error: qrError } = useQuery({
    queryKey: ["create-payment", borrowRecordIds],
    queryFn: async () => {
      const res = await paymentApi.create({ borrowRecordIds });
      return res.data;
    },
    enabled: step === "loading" && !!borrowRecordIds && borrowRecordIds.length > 0,
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

  const confirmMutation = useMutation({
    mutationFn: () => paymentApi.confirm(qrData!.paymentCode),
    onSuccess: () => {
      setStep("done");
      toast({ title: "Đã xác nhận thu tiền", description: "Khoản phạt đã được ghi nhận." });
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

        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang tạo mã QR...</p>
          </div>
        )}

        {(step === "showQR" || step === "confirming") && qrData && (
          <div className="flex flex-col items-center gap-4">
            <img src={qrData.qrUrl} className="w-52 h-52 rounded-lg border object-contain" />
            <div className="w-full bg-muted/50 px-4 py-3 space-y-2 text-sm rounded-lg">
              <div className="flex justify-between">
                <span>Ngân hàng</span>
                <span>{qrData.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span>Số tài khoản</span>
                <span>{qrData.accountNumber}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Số tiền</span>
                <span className="text-destructive font-semibold">{vnd(Number(qrData.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Nội dung</span>
                <code>{qrData.paymentCode}</code>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => { setStep("confirming"); confirmMutation.mutate(); }}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Xác nhận đã thu tiền
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle className="w-8 h-8 text-success" />
            <p className="text-success font-medium">Đã ghi nhận thanh toán</p>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface RefundModalProps {
  borrowRecordIds: number[];
  totalRefund: number;
  userName: string;
  onClose: () => void;
  onConfirmed: () => void;
}

const RefundModal = ({ borrowRecordIds, totalRefund, userName, onClose, onConfirmed }: RefundModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [done, setDone] = useState(false);

  const confirmAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(borrowRecordIds.map((id) => borrowRecordApi.confirmRefund(id)));
    },
    onSuccess: () => {
      setDone(true);
      toast({ title: "Đã xác nhận hoàn tiền ✅", description: "Cập nhật thành công." });
      queryClient.invalidateQueries({ queryKey: ["pending-refunds"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-refunds"] });
      onConfirmed();
    },
    onError: (err: any) => {
      toast({
        title: "Lỗi xác nhận",
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
            <Banknote className="w-5 h-5 text-blue-500" />
            Xác nhận hoàn tiền
          </DialogTitle>
        </DialogHeader>

        {!done ? (
          <div className="flex flex-col gap-4">
            <div className="w-full bg-muted/50 px-4 py-3 space-y-2 text-sm rounded-lg">
              <div className="flex justify-between">
                <span>Sinh viên</span>
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span>Số sách</span>
                <span>{borrowRecordIds.length} cuốn</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Số tiền hoàn</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{vnd(totalRefund)}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Xác nhận rằng thư viện đã hoàn trả tiền cho sinh viên.
            </p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => confirmAllMutation.mutate()}
              disabled={confirmAllMutation.isPending}
            >
              {confirmAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Xác nhận đã hoàn tiền
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle className="w-8 h-8 text-blue-500" />
            <p className="text-blue-600 dark:text-blue-400 font-medium">Đã ghi nhận hoàn tiền</p>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

type Tab = "fines" | "refunds";

const FineManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("fines");
  const [finePage, setFinePage] = useState(1);
  const [refundPage, setRefundPage] = useState(1);
  const [payingConfig, setPayingConfig] = useState<{ ids?: number[] } | null>(null);
  const [refundConfig, setRefundConfig] = useState<{ ids: number[]; totalRefund: number; userName: string } | null>(null);

  const { data: overdueRecords = [], isLoading: isLoadingOverdue } = useQuery({
    queryKey: ["overdue-fines"],
    queryFn: async () => (await borrowRecordApi.getOverdue()).data ?? [],
  });

  const { data: paidRecords = [], isLoading: isLoadingPaid } = useQuery({
    queryKey: ["paid-fines"],
    queryFn: async () => (await borrowRecordApi.getPaidRecords()).data ?? [],
  });

  const { data: totalPaid = 0 } = useQuery({
    queryKey: ["paid-total"],
    queryFn: async () => (await borrowRecordApi.getPaidTotal()).data ?? 0,
  });

  const { data: pendingRefunds = [], isLoading: isLoadingPending } = useQuery({
    queryKey: ["pending-refunds"],
    queryFn: async () => {
      const res = await borrowRecordApi.getPendingRefunds();
      const d = res.data as any;
      return Array.isArray(d) ? d : (d?.data ?? []);
    },
  });

  const { data: confirmedRefunds = [], isLoading: isLoadingConfirmed } = useQuery({
    queryKey: ["confirmed-refunds"],
    queryFn: async () => {
      const res = await borrowRecordApi.getConfirmedRefunds();
      const d = res.data as any;
      return Array.isArray(d) ? d : (d?.data ?? []);
    },
  });

  const handlePaymentConfirmed = () => {
    setPayingConfig(null);
    queryClient.invalidateQueries({ queryKey: ["overdue-fines"] });
    queryClient.invalidateQueries({ queryKey: ["paid-fines"] });
    queryClient.invalidateQueries({ queryKey: ["paid-total"] });
  };

  const handleRefundConfirmed = () => {
    setRefundConfig(null);
  };

  const processFines = (records: any[], isPaid: boolean) => {
    const groups: Record<string, any> = {};
    records.forEach((r) => {
      const groupKey = `${r.borrowDate}-${r.patronName || r.userName}-${r.studentId || ""}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          borrowRecordIds: [r.borrowRecordId],
          studentId: r.studentId,
          userName: r.patronName || r.userName,
          books: [r.bookTitle],
          daysOverdue: r.overdueDays || 0,
          totalFine: r.estimatedFine || 0,
          paid: isPaid,
          paymentCode: r.paymentCode,
          confiscated: r.status === "confiscated",
          borrowDate: r.borrowDate,
        };
      } else {
        groups[groupKey].books.push(r.bookTitle);
        groups[groupKey].borrowRecordIds.push(r.borrowRecordId);
        groups[groupKey].totalFine += r.estimatedFine || 0;
        if ((r.overdueDays || 0) > groups[groupKey].daysOverdue) groups[groupKey].daysOverdue = r.overdueDays;
        if (r.status === "confiscated") groups[groupKey].confiscated = true;
      }
    });
    return Object.values(groups);
  };

  const processRefunds = (records: any[], isDone: boolean) => {
    const groups: Record<string, any> = {};
    records.forEach((r) => {
      const groupKey = `${r.borrowDate}-${r.patronName}-${r.studentId || ""}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          borrowRecordIds: [r.borrowRecordId],
          userName: r.patronName,
          studentId: r.studentId,
          books: [r.bookTitle],
          earlyDays: r.earlyDays || 0,
          totalRefund: r.refundAmount || 0,
          done: isDone,
          borrowDate: r.borrowDate,
        };
      } else {
        groups[groupKey].books.push(r.bookTitle);
        groups[groupKey].borrowRecordIds.push(r.borrowRecordId);
        groups[groupKey].totalRefund += r.refundAmount || 0;
        if ((r.earlyDays || 0) > groups[groupKey].earlyDays) groups[groupKey].earlyDays = r.earlyDays;
      }
    });
    return Object.values(groups);
  };

  const allFines = [
    ...processFines(overdueRecords, false),
    ...processFines(paidRecords, true),
  ].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime();
  });

  const allRefunds = [
    ...processRefunds(pendingRefunds, false),
    ...processRefunds(confirmedRefunds, true),
  ].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime();
  });

  const filteredFines = allFines.filter((f) => {
    const q = query.toLowerCase();
    return !q || f.userName.toLowerCase().includes(q) || f.studentId?.toLowerCase().includes(q) || f.books.some((b: string) => b.toLowerCase().includes(q));
  });

  const filteredRefunds = allRefunds.filter((r: any) => {
    const q = query.toLowerCase();
    return !q || r.userName?.toLowerCase().includes(q) || r.studentId?.toLowerCase().includes(q) || r.books.some((b: string) => b.toLowerCase().includes(q));
  });

  const pagedFines = filteredFines.slice((finePage - 1) * PAGE_SIZE, finePage * PAGE_SIZE);
  const pagedRefunds = filteredRefunds.slice((refundPage - 1) * PAGE_SIZE, refundPage * PAGE_SIZE);

  const totalUnpaid = allFines.filter((f) => !f.paid).reduce((s, f) => s + f.totalFine, 0);
  const isLoadingFines = isLoadingOverdue || isLoadingPaid;
  const isLoadingRefunds = isLoadingPending || isLoadingConfirmed;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Quản lý tiền phạt</h1>
        <p className="text-muted-foreground mt-1">Xem và xử lý các khoản phạt quá hạn.</p>
      </div>

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
            <p className="text-3xl font-bold text-success">{Number(totalPaid).toLocaleString("vi-VN")}đ</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab("fines"); setFinePage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "fines" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Tiền phạt
          {totalUnpaid > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5 py-0">
              {allFines.filter((f) => !f.paid).length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("refunds"); setRefundPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "refunds" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Hoàn tiền sinh viên
          {allRefunds.filter((r) => !r.done).length > 0 && (
            <Badge className="text-xs px-1.5 py-0 bg-blue-500 hover:bg-blue-500">
              {allRefunds.filter((r) => !r.done).length}
            </Badge>
          )}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFinePage(1); setRefundPage(1); }}
          placeholder="Tìm theo tên người dùng, sách, MSSV..."
          className="pl-10"
        />
      </div>

      {activeTab === "fines" && (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Sách</TableHead>
                <TableHead>Ngày quá hạn</TableHead>
                <TableHead>Tổng phạt</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingFines ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : pagedFines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    Không có khoản phạt nào.
                  </TableCell>
                </TableRow>
              ) : (
                pagedFines.map((f, index) => (
                  <TableRow key={f.paymentCode || index}>
                    <TableCell className="font-medium">
                      <div>{f.userName}</div>
                      {f.studentId && <span className="text-xs text-muted-foreground">{f.studentId}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px] space-y-1">
                        {f.books.map((title: string, i: number) => (
                          <div key={i} className="text-xs truncate text-muted-foreground">• {title}</div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="destructive" className="text-xs gap-0.5 w-fit">
                          <AlertTriangle className="w-3 h-3" /> {f.daysOverdue} ngày
                        </Badge>
                        {f.confiscated && (
                          <Badge variant="outline" className="text-xs gap-0.5 w-fit border-orange-400 text-orange-600">
                            <ShieldAlert className="w-3 h-3" /> Đã thu hồi
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-destructive">
                      {f.totalFine.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell className="text-right">
                      {f.paid ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                          <CheckCircle className="w-3 h-3" /> Đã xong
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => setPayingConfig({ ids: f.borrowRecordIds })}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Thanh toán
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="px-4 pb-3">
            <Pagination page={finePage} total={filteredFines.length} pageSize={PAGE_SIZE} onChange={setFinePage} />
          </div>
        </div>
      )}

      {activeTab === "refunds" && (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Sách</TableHead>
                <TableHead>Trả sớm</TableHead>
                <TableHead>Số tiền hoàn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRefunds ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : pagedRefunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    Không có khoản hoàn tiền nào.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRefunds.map((r: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div>{r.userName}</div>
                      {r.studentId && <span className="text-xs text-muted-foreground">{r.studentId}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[220px] space-y-1">
                        {r.books.map((title: string, i: number) => (
                          <div key={i} className="text-xs truncate text-muted-foreground">• {title}</div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs gap-0.5 w-fit border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                        <Banknote className="w-3 h-3" /> {r.earlyDays} ngày
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                      {vnd(Number(r.totalRefund))}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.done ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800 gap-1">
                          <CheckCircle className="w-3 h-3" /> Đã hoàn
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
                          onClick={() =>
                            setRefundConfig({
                              ids: r.borrowRecordIds,
                              totalRefund: r.totalRefund,
                              userName: r.userName,
                            })
                          }
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Hoàn tiền
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="px-4 pb-3">
            <Pagination page={refundPage} total={filteredRefunds.length} pageSize={PAGE_SIZE} onChange={setRefundPage} />
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Xử lý trả sách và thu phạt tại trang <strong>Trả sách</strong>.
      </p>

      {payingConfig !== null && (
        <PaymentModal
          borrowRecordIds={payingConfig.ids}
          onClose={() => setPayingConfig(null)}
          onConfirmed={handlePaymentConfirmed}
        />
      )}

      {refundConfig !== null && (
        <RefundModal
          borrowRecordIds={refundConfig.ids}
          totalRefund={refundConfig.totalRefund}
          userName={refundConfig.userName}
          onClose={() => setRefundConfig(null)}
          onConfirmed={handleRefundConfirmed}
        />
      )}
    </div>
  );
};

export default FineManagement;