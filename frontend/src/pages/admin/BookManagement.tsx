import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi } from "@/services/apiServices";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Search, Save, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Book, BookRequest } from "@/types";

const GENRES = ["Classic", "Fantasy", "Dystopian", "Romance", "Science Fiction", "Fiction", "Non-Fiction", "Philosophy", "Satire"];

const EMPTY_FORM: BookRequest = {
  isbn: "",
  title: "",
  genre: "Fiction",
  publication_year: new Date().getFullYear(),
  total_copies: 1,
  author_ids: [],
};

const BookManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Bộ lọc
  const [keyword, setKeyword] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookRequest>(EMPTY_FORM);
  const [authorInput, setAuthorInput] = useState(""); // nhập author_ids dạng "1,2,3"

  // ==================== QUERIES ====================
  const { data, isLoading } = useQuery({
    queryKey: ["books", page, keyword, genreFilter],
    queryFn: () =>
      bookApi.getAll({
        page,
        size: 10,
        keyword,
        genre: genreFilter === "all" ? "" : genreFilter,
      }).then(r => r.data.data),
  });

  const books = data?.result ?? [];
  const meta = data?.meta;

  // ==================== MUTATIONS ====================
  const createMutation = useMutation({
    mutationFn: bookApi.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Đã thêm sách", description: `"${res.data.data.title}" đã được thêm.` });
      setFormOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Lỗi", description: err?.response?.data?.message ?? "Thêm sách thất bại.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookRequest }) => bookApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Đã cập nhật", description: `"${res.data.data.title}" đã được cập nhật.` });
      setFormOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Lỗi", description: err?.response?.data?.message ?? "Cập nhật thất bại.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Đã xóa", description: `"${deleteBook?.title}" đã bị xóa.` });
      setDeleteBook(null);
    },
    onError: (err: any) => {
      toast({ title: "Lỗi", description: err?.response?.data?.message ?? "Xóa thất bại.", variant: "destructive" });
      setDeleteBook(null);
    },
  });

  // ==================== HANDLERS ====================
  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setAuthorInput("");
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((book: Book) => {
    setEditingId(book.id);
    setForm({
      isbn: book.isbn,
      title: book.title,
      genre: book.genre ?? "Fiction",
      publication_year: book.publication_year,
      total_copies: book.total_copies,
      author_ids: [],
    });
    setAuthorInput(""); // author_ids không có trong response, để trống
    setFormOpen(true);
  }, []);

  const handleSave = () => {
    const authorIds = authorInput
      .split(",")
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));

    const payload: BookRequest = { ...form, author_ids: authorIds };

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Quản lý sách
          </h1>
          <p className="text-muted-foreground mt-1">
            Thêm, sửa, xóa sách trong thư viện.{meta ? ` (${meta.total} sách)` : ""}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm sách
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Tìm theo tiêu đề, ISBN, tác giả..."
            className="pl-10"
          />
        </div>
        <Select value={genreFilter} onValueChange={v => { setGenreFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Thể loại" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thể loại</SelectItem>
            {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        {meta && (
          <span className="text-sm text-muted-foreground ml-auto">{meta.total} kết quả</span>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="hidden sm:table-cell">Tác giả</TableHead>
              <TableHead className="hidden md:table-cell">ISBN</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Tình trạng</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  Không tìm thấy sách.
                </TableCell>
              </TableRow>
            ) : (
              books.map(book => (
                <TableRow key={book.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{book.title}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">{book.authors.join(", ")}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {book.authors.join(", ") || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                    {book.isbn}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{book.genre ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={book.available_copies > 0 ? "outline" : "secondary"}
                      className={book.available_copies > 0 ? "bg-success/10 text-success border-success/20" : ""}
                    >
                      {book.available_copies > 0 ? `Còn ${book.available_copies}/${book.total_copies}` : "Hết sẵn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(book)} title="Sửa">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setDeleteBook(book)}
                        title="Xóa"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Trước
          </Button>
          <span className="text-sm flex items-center px-2">
            Trang {meta.current} / {meta.pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa sách" : "Thêm sách mới"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Cập nhật thông tin sách." : "Điền thông tin sách để thêm vào thư viện."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Tiêu đề *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>ISBN *</Label>
              <Input value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Số lượng *</Label>
              <Input
                type="number" min={1}
                value={form.total_copies}
                onChange={e => setForm(f => ({ ...f, total_copies: parseInt(e.target.value) || 1 }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Thể loại</Label>
              <Select value={form.genre ?? "Fiction"} onValueChange={v => setForm(f => ({ ...f, genre: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Năm xuất bản</Label>
              <Input
                type="number"
                value={form.publication_year ?? ""}
                onChange={e => setForm(f => ({ ...f, publication_year: parseInt(e.target.value) || undefined }))}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>ID tác giả (cách nhau bởi dấu phẩy)</Label>
              <Input
                value={authorInput}
                onChange={e => setAuthorInput(e.target.value)}
                placeholder="Ví dụ: 1, 2, 3"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>Hủy</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.isbn || isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? "Cập nhật" : "Lưu sách"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteBook} onOpenChange={open => { if (!open) setDeleteBook(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sách</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa "{deleteBook?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBook && deleteMutation.mutate(deleteBook.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookManagement;