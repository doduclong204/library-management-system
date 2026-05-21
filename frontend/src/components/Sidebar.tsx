import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Home, BookOpen, DollarSign, LogOut, X,
  ArrowLeftRight, ScanLine, List, ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(prev => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  const adminLinks = [
    { to: "/admin", icon: Home, label: "Dashboard" },
    { to: "/admin/books", icon: BookOpen, label: "Quản lý sách" },
    { to: "/admin/borrow", icon: ArrowLeftRight, label: "Mượn sách" },
    { to: "/admin/borrow-list", icon: List, label: "Danh sách mượn" },
    { to: "/admin/fines", icon: DollarSign, label: "Quản lý tiền phạt" },
    { to: "/admin/ocr", icon: ScanLine, label: "OCR sách hiếm" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navContent = (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quản trị Thư viện
          </span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {adminLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}
            end={to === "/admin"}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-60 bg-card border-r border-border flex flex-col
        transition-transform duration-300
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <button onClick={() => setOpen(false)} className="lg:hidden absolute top-3 right-3 p-1 rounded hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
        {navContent}
      </aside>
    </>
  );
};

export default Sidebar;