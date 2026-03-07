import { useState, useMemo } from "react";
import { MOCK_ALL_USERS } from "@/data/mockUsers";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import {
  Users, Search, Shield, Plus, Edit, Eye, Trash2,
  BookOpen, AlertTriangle, ChevronLeft, ChevronRight, X, Calendar
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const DAILY_FINE_RATE = 5000;
const PAGE_SIZE = 8;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(MOCK_ALL_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  // Dialogs
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [viewBorrowsUser, setViewBorrowsUser] = useState<User | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"user" | "librarian">("user");
  const [formStudentId, setFormStudentId] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(u => {
      const matchText = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.studentId || "").toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchText && matchRole;
    });
  }, [users, query, roleFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getOverdueCount = (user: User) => {
    return user.borrowedBooks.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length;
  };

  const getActiveCount = (user: User) => {
    return user.borrowedBooks.filter(b => !b.returnDate).length;
  };

  // Add user
  const openAdd = () => {
    setFormName(""); setFormEmail(""); setFormRole("user"); setFormStudentId(""); setFormPassword("");
    setAddOpen(true);
  };
  const handleAdd = () => {
    if (!formName || !formEmail) return;
    const newUser: User = {
      id: `STU${String(users.length + 1).padStart(3, "0")}`,
      name: formName, email: formEmail, role: formRole,
      studentId: formRole === "user" ? formStudentId : undefined,
      borrowedBooks: [],
    };
    setUsers([newUser, ...users]);
    setAddOpen(false);
    toast({ title: "Đã thêm người dùng", description: `${formName} đã được thêm vào hệ thống.` });
  };

  // Edit user
  const openEdit = (u: User) => {
    setEditUser(u);
    setFormName(u.name); setFormEmail(u.email); setFormRole(u.role); setFormStudentId(u.studentId || "");
    setEditOpen(true);
  };
  const handleEdit = () => {
    if (!editUser) return;
    setUsers(users.map(u => u.id === editUser.id ? { ...u, name: formName, email: formEmail, role: formRole, studentId: formRole === "user" ? formStudentId : undefined } : u));
    setEditOpen(false);
    toast({ title: "Đã cập nhật", description: `Thông tin ${formName} đã được cập nhật.` });
  };

  // Delete user
  const handleDelete = () => {
    if (!deleteUser) return;
    setUsers(users.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
    toast({ title: "Đã xóa", description: `${deleteUser.name} đã bị xóa khỏi hệ thống.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-1">Danh sách và quản lý người dùng thư viện.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm người dùng
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm theo tên, email, MSSV..." className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="user">Sinh viên</SelectItem>
            <SelectItem value="librarian">Thủ thư</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} người dùng</span>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead className="hidden sm:table-cell">Email / MSSV</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Đang mượn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(user => {
              const activeCount = getActiveCount(user);
              const overdueCount = getOverdueCount(user);
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <p className="text-sm">{user.email}</p>
                    {user.studentId && <p className="text-xs text-muted-foreground">{user.studentId}</p>}
                    {!user.studentId && <p className="text-xs text-muted-foreground">{user.id}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "librarian" ? "default" : "secondary"} className="gap-1">
                      {user.role === "librarian" && <Shield className="w-3 h-3" />}
                      {user.role === "librarian" ? "Thủ thư" : "Sinh viên"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activeCount === 0 ? (
                      <span className="text-sm text-muted-foreground">0</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">{activeCount} sách</Badge>
                        {overdueCount > 0 && (
                          <Badge variant="destructive" className="text-xs gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> {overdueCount} quá hạn
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Sửa">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setViewBorrowsUser(user)} title="Xem mượn">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteUser(user)} title="Xóa" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {paginated.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">Không tìm thấy người dùng.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>Tạo tài khoản mới cho sinh viên hoặc thủ thư.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Họ tên</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nguyễn Văn A" /></div>
            <div><Label>Email</Label><Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@student.edu.vn" /></div>
            <div><Label>Mật khẩu</Label><Input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder="••••••" /></div>
            <div>
              <Label>Vai trò</Label>
              <Select value={formRole} onValueChange={v => setFormRole(v as "user" | "librarian")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Sinh viên</SelectItem>
                  <SelectItem value="librarian">Thủ thư</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formRole === "user" && (
              <div><Label>MSSV</Label><Input value={formStudentId} onChange={e => setFormStudentId(e.target.value)} placeholder="SV2024XXX" /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Hủy</Button>
            <Button onClick={handleAdd} disabled={!formName || !formEmail}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho {editUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Họ tên</Label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
            <div>
              <Label>Vai trò</Label>
              <Select value={formRole} onValueChange={v => setFormRole(v as "user" | "librarian")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Sinh viên</SelectItem>
                  <SelectItem value="librarian">Thủ thư</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formRole === "user" && (
              <div><Label>MSSV</Label><Input value={formStudentId} onChange={e => setFormStudentId(e.target.value)} /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button onClick={handleEdit}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteUser} onOpenChange={open => { if (!open) setDeleteUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa <strong>{deleteUser?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Borrows Sheet */}
      <Sheet open={!!viewBorrowsUser} onOpenChange={open => { if (!open) setViewBorrowsUser(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Sách mượn - {viewBorrowsUser?.name}
            </SheetTitle>
            <SheetDescription>
              {viewBorrowsUser?.email} · {viewBorrowsUser?.studentId || viewBorrowsUser?.id}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {viewBorrowsUser?.borrowedBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có sách nào.</p>
            ) : (
              viewBorrowsUser?.borrowedBooks.map(b => {
                const isReturned = !!b.returnDate;
                const isOverdue = !isReturned && new Date(b.dueDate) < new Date();
                const daysOverdue = isOverdue ? Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000) : 0;
                const fine = daysOverdue * DAILY_FINE_RATE;
                return (
                  <div key={b.id} className="p-3 rounded-lg border border-border space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{b.bookTitle}</p>
                      {isReturned ? (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">Đã trả</Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive" className="text-xs gap-0.5"><AlertTriangle className="w-3 h-3" /> Quá hạn</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Đang mượn</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Mượn: {b.borrowDate}</span>
                      <span>Hạn: {b.dueDate}</span>
                      {b.returnDate && <span>Trả: {b.returnDate}</span>}
                    </div>
                    {isOverdue && (
                      <p className="text-xs text-destructive font-medium">
                        Quá hạn {daysOverdue} ngày · Phạt: {fine.toLocaleString("vi-VN")}đ
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserManagement;
