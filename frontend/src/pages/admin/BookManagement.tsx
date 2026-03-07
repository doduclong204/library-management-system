import { useState } from "react";
import { MOCK_BOOKS } from "@/data/mockBooks";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Search, X, Save, BookOpen } from "lucide-react";
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
import type { Book } from "@/types";

const GENRES = ["Classic", "Fantasy", "Dystopian", "Romance", "Science Fiction", "Fiction", "Non-Fiction", "Philosophy", "Satire"];

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const { toast } = useToast();

  // Form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [genre, setGenre] = useState("Classic");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [publisher, setPublisher] = useState("");

  const filtered = books.filter(b => {
    const q = query.toLowerCase();
    const matchText = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q);
    const matchGenre = genreFilter === "all" || b.genre === genreFilter;
    return matchText && matchGenre;
  });

  const resetForm = () => {
    setTitle(""); setAuthor(""); setIsbn(""); setGenre("Classic"); setYear(""); setDescription(""); setPublisher("");
  };

  const openAdd = () => {
    setEditingId(null); resetForm(); setFormOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingId(book.id);
    setTitle(book.title); setAuthor(book.author); setIsbn(book.isbn); setGenre(book.genre);
    setYear(String(book.year)); setDescription(book.description || ""); setPublisher(book.publisher || "");
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!title || !author || !isbn) return;
    if (editingId) {
      setBooks(books.map(b => b.id === editingId ? { ...b, title, author, isbn, genre, year: parseInt(year) || b.year, description, publisher } : b));
      toast({ title: "Đã cập nhật", description: `"${title}" đã được cập nhật.` });
    } else {
      const book: Book = { id: String(Date.now()), title, author, isbn, genre, year: parseInt(year) || 2024, available: true, description, publisher };
      setBooks([book, ...books]);
      toast({ title: "Đã thêm sách", description: `"${title}" đã được thêm vào thư viện.` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteBook) return;
    setBooks(books.filter(b => b.id !== deleteBook.id));
    toast({ title: "Đã xóa", description: `"${deleteBook.title}" đã bị xóa.` });
    setDeleteBook(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Quản lý sách
          </h1>
          <p className="text-muted-foreground mt-1">Thêm, sửa, xóa sách trong thư viện. ({books.length} sách)</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm sách
        </Button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm sách..." className="pl-10" />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Thể loại" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thể loại</SelectItem>
            {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} kết quả</span>
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
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(book => (
              <TableRow key={book.id}>
                <TableCell>
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">{book.author}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{book.author}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">{book.isbn}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{book.genre}</Badge></TableCell>
                <TableCell>
                  <Badge variant={book.available ? "outline" : "secondary"} className={book.available ? "bg-success/10 text-success border-success/20" : ""}>
                    {book.available ? "Còn sẵn" : "Đã mượn"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(book)} title="Sửa"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteBook(book)} title="Xóa" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">Không tìm thấy sách.</p>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa sách" : "Thêm sách mới"}</DialogTitle>
            <DialogDescription>{editingId ? "Cập nhật thông tin sách." : "Điền thông tin sách để thêm vào thư viện."}</DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Tiêu đề *</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Tác giả *</Label><Input value={author} onChange={e => setAuthor(e.target.value)} className="mt-1.5" /></div>
            <div><Label>ISBN *</Label><Input value={isbn} onChange={e => setIsbn(e.target.value)} className="mt-1.5" /></div>
            <div>
              <Label>Thể loại</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Năm xuất bản</Label><Input type="number" value={year} onChange={e => setYear(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Nhà xuất bản</Label><Input value={publisher} onChange={e => setPublisher(e.target.value)} className="mt-1.5" /></div>
            <div className="sm:col-span-2">
              <Label>Mô tả</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1.5 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!title || !author || !isbn} className="gap-2">
              <Save className="w-4 h-4" /> {editingId ? "Cập nhật" : "Lưu sách"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteBook} onOpenChange={open => { if (!open) setDeleteBook(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sách</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa "{deleteBook?.title}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookManagement;
