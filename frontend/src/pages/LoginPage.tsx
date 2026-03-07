import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, DEMO_USERS } from "@/context/AuthContext";
import { BookOpen, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const demo = DEMO_USERS[email];
      if (demo && demo.password === password) {
        login(demo.user, "demo-jwt-token");
        toast({ title: "Đăng nhập thành công!", description: `Xin chào ${demo.user.name}` });
        // Redirect based on role
        if (demo.user.role === "librarian") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast({ title: "Đăng nhập thất bại", description: "Sai thông tin. Thử tài khoản demo bên dưới.", variant: "destructive" });
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Đăng nhập Thủ thư</h1>
          <p className="text-muted-foreground mt-1">Hệ thống quản lý thư viện</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="email@library.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
              <LogIn className="w-4 h-4" />
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
        </div>

        <div className="mt-4 glass-card p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tài khoản demo</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Thủ thư (Admin)</p>
                <p className="text-muted-foreground text-xs">librarian@library.com / admin123</p>
              </div>
              <button type="button" onClick={() => { setEmail("librarian@library.com"); setPassword("admin123"); }} className="text-xs btn-outline py-1 px-2">
                Dùng
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Sinh viên</p>
                <p className="text-muted-foreground text-xs">student@library.com / student123</p>
              </div>
              <button type="button" onClick={() => { setEmail("student@library.com"); setPassword("student123"); }} className="text-xs btn-outline py-1 px-2">
                Dùng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
