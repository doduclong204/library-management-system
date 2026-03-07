import { useState } from "react";
import { MOCK_BOOKS } from "@/data/mockBooks";
import { MOCK_ALL_USERS } from "@/data/mockUsers";
import { BookOpen, Users, AlertTriangle, DollarSign, TrendingUp, RefreshCw, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const DAILY_FINE_RATE = 5000;

const AdminDashboard = () => {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const allUsers = MOCK_ALL_USERS;
  const allBorrows = allUsers.flatMap(u => u.borrowedBooks);
  const activeLoans = allBorrows.filter(b => !b.returnDate);
  const overdue = activeLoans.filter(b => new Date(b.dueDate) < new Date());
  const totalFines = overdue.reduce((s, b) => {
    const days = Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000);
    return s + days * DAILY_FINE_RATE;
  }, 0);
  const activeUsers = allUsers.filter(u => u.role === "user").length;

  const stats = [
    { label: "Tổng sách", value: MOCK_BOOKS.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Đang mượn", value: activeLoans.length, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Quá hạn", value: overdue.length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Phạt chưa TT", value: `${totalFines.toLocaleString("vi-VN")}đ`, icon: DollarSign, color: "text-warning", bg: "bg-warning/10" },
    { label: "Sinh viên", value: activeUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
  ];

  const monthlyData = [
    { month: "T9/25", borrowed: 18, returned: 14 },
    { month: "T10/25", borrowed: 25, returned: 20 },
    { month: "T11/25", borrowed: 22, returned: 18 },
    { month: "T12/25", borrowed: 30, returned: 25 },
    { month: "T1/26", borrowed: 28, returned: 22 },
    { month: "T2/26", borrowed: 15, returned: 10 },
  ];

  const popularBooks = [
    { title: "Harry Potter", borrows: 12 },
    { title: "1984", borrows: 9 },
    { title: "Sapiens", borrows: 8 },
    { title: "The Hobbit", borrows: 7 },
    { title: "Dune", borrows: 6 },
    { title: "Atomic Habits", borrows: 6 },
    { title: "Truyện Kiều", borrows: 5 },
    { title: "Gatsby", borrows: 5 },
    { title: "Percy Jackson", borrows: 4 },
    { title: "Pride & Prejudice", borrows: 4 },
  ];

  const genreData = Object.entries(
    MOCK_BOOKS.reduce<Record<string, number>>((acc, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = [
    "hsl(217,91%,53%)", "hsl(174,84%,29%)", "hsl(38,92%,50%)",
    "hsl(0,72%,51%)", "hsl(270,60%,50%)", "hsl(150,60%,40%)",
    "hsl(30,80%,50%)", "hsl(200,70%,50%)",
  ];

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    toast({ title: "Đã làm mới", description: "Dữ liệu dashboard đã được cập nhật." });
  };

  const handleExport = () => {
    const csvHeader = "Tháng,Lượt mượn,Lượt trả\n";
    const csvBody = monthlyData.map(r => `${r.month},${r.borrowed},${r.returned}`).join("\n");
    const blob = new Blob([csvHeader + csvBody], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "library-report.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã xuất CSV", description: "File báo cáo đã được tải xuống." });
  };

  return (
    <div className="space-y-6 animate-fade-in" key={refreshKey}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header">Dashboard Quản trị</h1>
          <p className="text-muted-foreground mt-1">Tổng quan hệ thống thư viện.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-4 h-4" /> Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
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

      {/* Line chart - monthly trends */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Lượt mượn / trả theo tháng</h3>
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
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart - popular books */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Top 10 sách phổ biến</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={popularBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis type="category" dataKey="title" width={110} className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="borrows" fill="hsl(217,91%,53%)" radius={[0, 4, 4, 0]} name="Lượt mượn" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - genre distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Phân bổ thể loại</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={genreData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ strokeWidth: 1 }}
              >
                {genreData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overdue list */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Sách quá hạn gần đây</h3>
        {overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có sách quá hạn. 🎉</p>
        ) : (
          <div className="space-y-2">
            {overdue.map(b => {
              const days = Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000);
              return (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.bookTitle}</p>
                    <p className="text-xs text-muted-foreground">Hạn: {b.dueDate} {b.userName && `· ${b.userName}`}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {days} ngày · {(days * DAILY_FINE_RATE).toLocaleString("vi-VN")}đ
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
