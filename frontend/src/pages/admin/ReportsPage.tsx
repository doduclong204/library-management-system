import { MOCK_BOOKS } from "@/data/mockBooks";
import { DEMO_USERS } from "@/context/AuthContext";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const ReportsPage = () => {
  const allUsers = Object.values(DEMO_USERS).map(d => d.user);
  const allBorrows = allUsers.flatMap(u => u.borrowedBooks);

  const monthlyData = [
    { month: "T10/2025", borrowed: 15, returned: 12 },
    { month: "T11/2025", borrowed: 22, returned: 18 },
    { month: "T12/2025", borrowed: 18, returned: 20 },
    { month: "T1/2026", borrowed: 25, returned: 19 },
    { month: "T2/2026", borrowed: 12, returned: 9 },
  ];

  const popularBooks = MOCK_BOOKS.map(b => ({
    title: b.title.length > 20 ? b.title.slice(0, 20) + "…" : b.title,
    borrows: allBorrows.filter(br => br.bookId === b.id).length + Math.floor(Math.random() * 5),
  })).sort((a, b) => b.borrows - a.borrows).slice(0, 6);

  const genreStats = Object.entries(
    MOCK_BOOKS.reduce<Record<string, number>>((acc, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1;
      return acc;
    }, {})
  ).map(([genre, count]) => ({ genre, count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Báo cáo & Thống kê
        </h1>
        <p className="text-muted-foreground mt-1">Tổng quan hoạt động thư viện.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Lượt mượn/trả theo tháng</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="borrowed" stroke="hsl(217,91%,53%)" strokeWidth={2} name="Mượn" />
              <Line type="monotone" dataKey="returned" stroke="hsl(174,84%,29%)" strokeWidth={2} name="Trả" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Sách phổ biến nhất</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={popularBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis type="category" dataKey="title" width={120} className="text-xs" />
              <Tooltip />
              <Bar dataKey="borrows" fill="hsl(217,91%,53%)" radius={[0, 4, 4, 0]} name="Lượt mượn" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Phân bổ theo thể loại</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={genreStats}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="genre" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(174,84%,29%)" radius={[4, 4, 0, 0]} name="Số sách" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportsPage;
