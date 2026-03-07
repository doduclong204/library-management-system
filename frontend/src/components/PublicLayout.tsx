import { ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";

const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <PublicNavbar />
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {children}
    </main>
    <footer className="border-t border-border py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Thư viện Trung tâm Thành phố · Hệ thống Quản lý Thư viện</p>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
