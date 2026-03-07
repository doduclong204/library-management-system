import { useState } from "react";
import { DIGITAL_BOOKS } from "@/data/mockBooks";
import { ScanLine, Upload, FileText, Plus, Eye, Edit, Trash2, Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type DigitalBook = typeof DIGITAL_BOOKS[0];

const OCRPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [digitalBooks, setDigitalBooks] = useState<DigitalBook[]>(DIGITAL_BOOKS);
  const [viewBook, setViewBook] = useState<DigitalBook | null>(null);
  const [deleteBook, setDeleteBook] = useState<DigitalBook | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setProcessing(true);
    setTimeout(() => {
      setResult(
        `[Kết quả OCR — Mô phỏng]\n\nTrang trích từ "Khảo luận về Khoa học Thư viện" (1887)\n\n` +
        `"Việc phân loại sách cẩn thận là nền tảng mà trên đó một thư viện lớn được xây dựng. ` +
        `Mỗi cuốn sách phải được ghi chép chính xác — tiêu đề, tác giả, ngày xuất bản và tình trạng — ` +
        `để các học giả của các thế hệ tương lai có thể tìm thấy trong những bức tường này kiến thức mà họ tìm kiếm."\n\n` +
        `— Trích xuất từ: ${file.name}`
      );
      setProcessing(false);
      toast({ title: "OCR hoàn tất", description: "Văn bản đã được trích xuất từ hình ảnh." });
    }, 2000);
  };

  const handleAddToLibrary = () => {
    if (!result) return;
    const newBook: DigitalBook = {
      id: `d${digitalBooks.length + 1}`,
      title: `Tài liệu OCR - ${file?.name || "unknown"}`,
      author: "Chưa xác định",
      year: new Date().getFullYear(),
      ocrDate: new Date().toISOString().split("T")[0],
      accuracy: Math.floor(Math.random() * 10) + 88,
      ocrText: result,
    };
    setDigitalBooks([newBook, ...digitalBooks]);
    setResult(null); setFile(null); setPreview(null);
    toast({ title: "Đã thêm vào thư viện số", description: "Sách đã được lưu vào kho sách số." });
  };

  const handleDeleteDigital = () => {
    if (!deleteBook) return;
    setDigitalBooks(digitalBooks.filter(b => b.id !== deleteBook.id));
    setDeleteBook(null);
    toast({ title: "Đã xóa", description: "Sách số đã được xóa." });
  };

  const filteredDigital = digitalBooks.filter(b => {
    const q = searchQuery.toLowerCase();
    return !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.ocrText.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-primary" /> OCR Upload
        </h1>
        <p className="text-muted-foreground mt-1">Tải lên hình ảnh sách cổ để trích xuất văn bản có thể tìm kiếm.</p>
      </div>

      {/* Upload area */}
      <div className="glass-card p-6 max-w-2xl">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="ocr-upload" />
          <label htmlFor="ocr-upload" className="cursor-pointer space-y-3 block">
            {preview ? (
              <img src={preview} alt="Upload preview" className="max-h-64 mx-auto rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nhấp để tải lên trang sách đã quét</p>
                <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG, TIFF</p>
              </>
            )}
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> {file.name}
            </p>
            <Button onClick={handleProcess} disabled={processing} className="gap-2">
              <ScanLine className="w-4 h-4" />
              {processing ? "Đang xử lý…" : "Trích xuất văn bản"}
            </Button>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-5 bg-muted rounded-lg">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Văn bản đã trích xuất
              </h3>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed">{result}</pre>
            </div>
            <Button onClick={handleAddToLibrary} variant="secondary" className="gap-2">
              <Plus className="w-4 h-4" /> Thêm vào thư viện sách số
            </Button>
          </div>
        )}
      </div>

      {/* Digital Books List */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" /> Kho sách số ({digitalBooks.length})
          </h2>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm sách số..." className="pl-10" />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="hidden sm:table-cell">Tác giả</TableHead>
                <TableHead className="hidden md:table-cell">Nội dung trích</TableHead>
                <TableHead>Ngày OCR</TableHead>
                <TableHead>Độ chính xác</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDigital.map(book => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{book.author}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{book.author}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">{book.ocrText}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{book.ocrDate}</TableCell>
                  <TableCell>
                    <Badge variant={book.accuracy >= 90 ? "default" : "secondary"} className="text-xs">
                      {book.accuracy}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewBook(book)} title="Xem"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteBook(book)} title="Xóa" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDigital.length === 0 && (
            <p className="text-center py-8 text-sm text-muted-foreground">Không tìm thấy sách số.</p>
          )}
        </div>
      </div>

      {/* View dialog */}
      <Dialog open={!!viewBook} onOpenChange={open => { if (!open) setViewBook(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewBook?.title}</DialogTitle>
            <DialogDescription>{viewBook?.author} · {viewBook?.year} · Độ chính xác: {viewBook?.accuracy}%</DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-md p-5 border border-border">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Nội dung OCR
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewBook?.ocrText}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteBook} onOpenChange={open => { if (!open) setDeleteBook(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sách số</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa "{deleteBook?.title}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDigital} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OCRPage;
