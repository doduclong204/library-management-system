import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", studentId: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (!form.studentId.trim()) e.studentId = "Vui lòng nhập mã sinh viên";
    if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Mật khẩu không khớp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Đăng ký thành công!", description: "Vui lòng đăng nhập với tài khoản mới." });
      navigate("/login");
      setLoading(false);
    }, 800);
  };

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`input-field ${errors[key] ? "border-destructive" : ""}`}
        placeholder={placeholder}
      />
      {errors[key] && <p className="text-xs text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Đăng ký tài khoản</h1>
          <p className="text-muted-foreground mt-1">Tạo tài khoản sinh viên mới</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field("name", "Họ và tên", "text", "Nguyễn Văn A")}
            {field("email", "Email", "email", "email@student.edu.vn")}
            {field("studentId", "Mã sinh viên", "text", "SV2024001")}
            {field("password", "Mật khẩu", "password", "••••••••")}
            {field("confirmPassword", "Xác nhận mật khẩu", "password", "••••••••")}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              {loading ? "Đang xử lý…" : "Đăng ký"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
