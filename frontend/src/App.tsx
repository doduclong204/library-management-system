import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Layouts
import PublicLayout from "@/components/PublicLayout";
import Layout from "@/components/Layout";

// Public pages
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import BookDetailPage from "@/pages/BookDetailPage";
import DigitalBooksPage from "@/pages/DigitalBooksPage";
import LoginPage from "@/pages/LoginPage";

// Admin pages (protected + role)
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BookManagement from "@/pages/admin/BookManagement";
import BorrowManagement from "@/pages/admin/BorrowManagement";
import ReturnBookPage from "@/pages/admin/ReturnBookPage";
import BorrowListPage from "@/pages/admin/BorrowListPage";
import FineManagement from "@/pages/admin/FineManagement";
import OCRPage from "@/pages/OCRPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/** Public pages wrapped in PublicLayout */
const PublicRoute = ({ children }: { children: React.ReactNode }) => (
  <PublicLayout>{children}</PublicLayout>
);

/** Admin-only routes */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "librarian") return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => (
  <Routes>
    {/* ===== PUBLIC (no login) ===== */}
    <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
    <Route path="/search" element={<PublicRoute><SearchPage /></PublicRoute>} />
    <Route path="/books/:id" element={<PublicRoute><BookDetailPage /></PublicRoute>} />
    <Route path="/digital-books" element={<PublicRoute><DigitalBooksPage /></PublicRoute>} />

    {/* ===== AUTH ===== */}
    <Route path="/login" element={<LoginPage />} />

    {/* ===== ADMIN (protected + librarian) ===== */}
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/books" element={<AdminRoute><BookManagement /></AdminRoute>} />
    <Route path="/admin/borrow" element={<AdminRoute><BorrowManagement /></AdminRoute>} />
    <Route path="/admin/return" element={<AdminRoute><ReturnBookPage /></AdminRoute>} />
    <Route path="/admin/borrow-list" element={<AdminRoute><BorrowListPage /></AdminRoute>} />
    <Route path="/admin/fines" element={<AdminRoute><FineManagement /></AdminRoute>} />
    <Route path="/admin/ocr" element={<AdminRoute><OCRPage /></AdminRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
