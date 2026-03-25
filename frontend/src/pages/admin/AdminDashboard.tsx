import { useState, useEffect, useCallback } from "react";
import { bookApi, borrowApi } from "@/services/apiServices";
import { borrowRecordApi } from "@/services/borrowRecordService";
import {
  BookOpen, AlertTriangle, DollarSign, TrendingUp, RefreshCw, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Book, BorrowRecord, BookReturnSearchResponse } from "@/types";

const COLORS = [
  "hsl(217,91%,53%)", "hsl(174,84%,29%)", "hsl(38,92%,50%)",
  "hsl(0,72%,51%)",   "hsl(270,60%,50%)", "hsl(150,60%,40%)",
  "hsl(30,80%,50%)",  "hsl(200,70%,50%)",
];

const CardSkeleton = () => (
  <div className="stat-card flex items-center gap-3">
    <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
    <div className="space-y-1.5">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <Skeleton className="w-full rounded-lg" style={{ height }} />
);

const AdminDashboard = () => {
  const { toast } = useToast();

  const [books,   setBooks]   = useState<Book[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [overdue, setOverdue] = useState<BookReturnSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, br, ov] = await Promise.all([
        bookApi.getAll({ pageSize: 1000 }),
        borrowApi.getAll({ pageSize: 1000 }),
        borrowRecordApi.getOverdue(),
      ]);
      setBooks(b.data?.data?.result ?? []);
      setBorrows(Array.isArray(br.data) ? br.data : br.data?.data?.result ?? []);
      setOverdue(Array.isArray(ov.data) ? ov.data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(msg);
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeLoans = borrows.filter(b => !b.returnDate);
  const totalFines  = overdue.reduce((s, b) => s + Number(b.estimatedFine ?? 0), 0);

  const monthlyData = (() => {
    const map: Record<string, { borrowed: number; returned: number }> = {};
    borrows.forEach(b => {
      const key = new Date(b.borrowDate).toLocaleDateString("vi-VN", { month: "2-digit", year: "2-digit" });
      if (!map[key]) map[key] = { borrowed: 0, returned: 0 };
      map[key].borrowed++;
      if (b.returnDate) map[key].returned++;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({ month, ...v }));
  })();

  const popularBooks = (() => {
    const map: Record<string, number> = {};
    borrows.forEach(b => { map[b.bookTitle] = (map[b.bookTitle] || 0) + 1; });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, borrows: count }));
  })();

  const genreData = (() => {
    const map: Record<string, number> = {};
    books.forEach(b => { if (b.genre) map[b.genre] = (map[b.genre] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const statCards = [
    { label: "Tổng sách",    value: books.length,                              icon: BookOpen,      color: "text-primary",     bg: "bg-primary/10" },
    { label: "Đang mượn",    value: activeLoans.length,                        icon: TrendingUp,    color: "text-secondary",   bg: "bg-secondary/10" },
    { label: "Quá hạn",      value: overdue.length,                            icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Phạt chưa TT", value: `${totalFines.toLocaleString("vi-VN")}đ`, icon: DollarSign,    color: "text-warning",     bg: "bg-warning/10" },
  ];

  const handleExport = () => {
    const header = "Tháng,Lượt mượn,Lượt trả\n";
    const body   = monthlyData.map(r => `${r.month},${r.borrowed},${r.returned}`).join("\n");
    const blob   = new Blob([header + body], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "library-report.csv" }).click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã xuất CSV", description: "File báo cáo đã được tải xuống." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header">Dashboard Quản trị</h1>
          <p className="text-muted-foreground mt-1">Tổng quan hệ thống thư viện.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !monthlyData.length} className="gap-1.5">
            <Download className="w-4 h-4" /> Xuất CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Lượt mượn / trả theo tháng</h3>
        {loading ? <ChartSkeleton height={300} /> : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Line type="monotone" dataKey="borrowed" stroke="hsl(217,91%,53%)" strokeWidth={2.5} dot={{ r: 4 }} name="Mượn" />
              <Line type="monotone" dataKey="returned" stroke="hsl(174,84%,29%)" strokeWidth={2.5} dot={{ r: 4 }} name="Trả" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Top 10 sách phổ biến</h3>
          {loading ? <ChartSkeleton height={320} /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={popularBooks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="title" width={110} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="borrows" fill="hsl(217,91%,53%)" radius={[0, 4, 4, 0]} name="Lượt mượn" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Phân bổ thể loại</h3>
          {loading ? <ChartSkeleton height={320} /> : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={100} innerRadius={50}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Sách quá hạn gần đây</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có sách quá hạn. 🎉</p>
        ) : (
          <div className="space-y-2">
            {overdue.map(b => (
              <div key={b.borrowRecordId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{b.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    Hạn: {String(b.dueDate)}{b.patronName ? ` · ${b.patronName}` : ""}
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {b.overdueDays} ngày · {Number(b.estimatedFine).toLocaleString("vi-VN")}đ
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;