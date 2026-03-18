import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { borrowApi, patronApi, bookApi } from "@/services/apiServices";
import type { PatronSearchResult, BorrowRequest, BorrowResponse, Book } from "@/types";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import {
  BookOpen, ScanLine, Camera, CameraOff, CheckCircle,
  User, Calendar as CalendarIcon, UserPlus, Mail, Loader2, Upload, X, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

const BorrowManagement = () => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [bookQuery, setBookQuery] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const [emailQuery, setEmailQuery] = useState("");
  const [matchedPatrons, setMatchedPatrons] = useState<PatronSearchResult[]>([]);
  const [selectedPatron, setSelectedPatron] = useState<PatronSearchResult | null>(null);
  const [showNewPatronForm, setShowNewPatronForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");

  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14));
  const [cameraOn, setCameraOn] = useState(false);
  const [isSearchingPatron, setIsSearchingPatron] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const patronSearchTimer = useRef<ReturnType<typeof setTimeout>>();
  const { toast } = useToast();

  const fetchBooks = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const res = await bookApi.getAll({ pageSize: 200 });
      setAllBooks(res.data.data?.result ?? []);
    } catch {
      setAllBooks([]);
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const matchedBooks = bookQuery.length > 1
    ? allBooks.filter(b =>
        !selectedBooks.find(s => s.id === b.id) && (
          b.title.toLowerCase().includes(bookQuery.toLowerCase()) ||
          b.isbn.toLowerCase().includes(bookQuery.toLowerCase())
        )
      ).slice(0, 6)
    : allBooks.filter(b => !selectedBooks.find(s => s.id === b.id)).slice(0, 6);

  useEffect(() => {
    if (emailQuery.length < 3 || selectedPatron) {
      setMatchedPatrons([]);
      setShowNewPatronForm(false);
      return;
    }
    clearTimeout(patronSearchTimer.current);
    patronSearchTimer.current = setTimeout(async () => {
      setIsSearchingPatron(true);
      try {
        const res = await patronApi.search(emailQuery);
        const results = res.data.data ?? [];
        setMatchedPatrons(results);
        if (results.length === 1) {
          setSelectedPatron(results[0]);
          setEmailQuery(results[0].email);
          setMatchedPatrons([]);
          setShowNewPatronForm(false);
        } else if (results.length === 0) {
          setShowNewPatronForm(true);
        } else {
          setShowNewPatronForm(false);
        }
      } catch {
        setMatchedPatrons([]);
      } finally {
        setIsSearchingPatron(false);
      }
    }, 400);
  }, [emailQuery]);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOn(false);
  };

  const toggleCamera = async () => {
    if (cameraOn) { stopCamera(); return; }
    try {
      const reader = new BrowserMultiFormatReader();
      setCameraOn(true);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = devices.find(d => d.label.toLowerCase().includes("back"))?.deviceId
        ?? devices[0]?.deviceId;
      if (!videoRef.current) return;
      const controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          stopCamera();
          setBookQuery(result.getText());
          toast({ title: "Đã quét barcode!", description: result.getText() });
        }
        if (err && !(err instanceof NotFoundException)) console.error(err);
      });
      controlsRef.current = controls;
    } catch {
      stopCamera();
      toast({ title: "Không thể mở camera", variant: "destructive" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new BrowserMultiFormatReader();
      const imgUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(imgUrl);
      URL.revokeObjectURL(imgUrl);
      setBookQuery(result.getText());
      toast({ title: "Đã đọc barcode!", description: result.getText() });
    } catch {
      toast({ title: "Không đọc được barcode", variant: "destructive" });
    }
    e.target.value = "";
  };

  useEffect(() => { return () => { stopCamera(); }; }, []);

  const addBook = (book: Book) => {
    if (book.available_copies <= 0) {
      toast({ title: "Sách đã hết", description: `${book.title} không còn bản sao trống.`, variant: "destructive" });
      return;
    }
    setSelectedBooks(prev => [...prev, book]);
    setBookQuery("");
    setShowBookDropdown(false);
  };

  const removeBook = (bookId: number) => {
    setSelectedBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const handleBorrow = async () => {
    if (selectedBooks.length === 0 || !selectedPatron || !dueDate) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn ít nhất 1 sách và người mượn.", variant: "destructive" });
      return;
    }

    const payload: BorrowRequest = {
      email: selectedPatron.email,
      fullName: selectedPatron.fullName,
      studentId: selectedPatron.studentId,
      bookCopyIds: selectedBooks.map(b => b.id),
      dueDate: format(dueDate, "yyyy-MM-dd"),
    };

    setIsSubmitting(true);
    try {
      const res = await borrowApi.borrow(payload);
      const results = Array.isArray(res.data) ? res.data : [res.data?.data ?? res.data] as BorrowResponse[];
      toast({
        title: "Mượn sách thành công! ✅",
        description: `${results.length} cuốn → ${selectedPatron.fullName}. Hạn trả: ${format(dueDate, "dd/MM/yyyy")}`,
      });

      await fetchBooks();
      setSelectedBooks([]);
      setBookQuery("");
      setSelectedPatron(null);
      setEmailQuery("");
      setMatchedPatrons([]);
      setDueDate(addDays(new Date(), 14));
      setNewName("");
      setNewStudentId("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? "Đã xảy ra lỗi";
      toast({ title: "Mượn sách thất bại", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Cho mượn sách
        </h1>
        <p className="text-muted-foreground mt-1">Chọn nhiều sách cùng lúc để tạo 1 phiếu mượn.</p>
      </div>

      {/* Book search */}
      <div className="glass-card p-5 max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-primary" /> Chọn sách
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
              <Upload className="w-4 h-4" /> Tải ảnh
            </Button>
            <Button variant="outline" size="sm" onClick={toggleCamera} className="gap-1.5">
              {cameraOn
                ? <><CameraOff className="w-4 h-4" /> Tắt camera</>
                : <><Camera className="w-4 h-4" /> Bật camera</>}
            </Button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        {cameraOn && (
          <div className="relative mb-4 rounded-lg overflow-hidden bg-foreground/5 aspect-video max-w-md">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-32 border-2 border-primary/80 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {isLoadingBooks && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          <Input
            value={bookQuery}
            onChange={e => setBookQuery(e.target.value)}
            onFocus={() => setShowBookDropdown(true)}
            onBlur={() => setTimeout(() => setShowBookDropdown(false), 150)}
            placeholder="Nhập ISBN hoặc tên sách để tìm..."
            className="pl-10"
          />
        </div>

        {/* Dropdown */}
        {showBookDropdown && (
          <ul className="mt-2 border border-border rounded-lg overflow-hidden shadow-md max-h-64 overflow-y-auto">
            {matchedBooks.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                Không tìm thấy sách phù hợp
              </li>
            ) : (
              <>
                {bookQuery.length <= 1 && (
                  <li className="px-4 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border">
                    Danh sách sách — gõ để lọc
                  </li>
                )}
                {matchedBooks.map(b => (
                  <li key={b.id}>
                    <button
                      onMouseDown={() => addBook(b)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between text-sm gap-3"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{b.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {b.isbn} · {b.authors?.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={b.available_copies > 0 ? "outline" : "secondary"}
                          className={cn(b.available_copies > 0 ? "bg-success/10 text-success border-success/20" : "")}
                        >
                          {b.available_copies > 0 ? `Còn ${b.available_copies}` : "Hết"}
                        </Badge>
                        {b.available_copies > 0 && (
                          <span className="text-primary">
                            <Plus className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}

        {/* Danh sách sách đã chọn */}
        {selectedBooks.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Đã chọn {selectedBooks.length} cuốn:
            </p>
            {selectedBooks.map(b => (
              <div key={b.id} className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg text-sm border border-primary/10">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{b.title}</span>
                  <span className="text-xs text-muted-foreground">{b.isbn}</span>
                </div>
                <button
                  onClick={() => removeBook(b.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patron + dueDate + submit */}
      <div className="glass-card p-5 max-w-xl space-y-4">
        <div>
          <Label className="flex items-center gap-2 mb-1.5">
            <Mail className="w-4 h-4" /> Tìm người mượn (theo email)
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {isSearchingPatron && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
            <Input
              value={emailQuery}
              onChange={e => { setEmailQuery(e.target.value); setSelectedPatron(null); }}
              placeholder="Nhập email Gmail để tìm..."
              className="pl-10"
            />
          </div>

          {matchedPatrons.length > 0 && !selectedPatron && (
            <ul className="mt-2 border border-border rounded-lg overflow-hidden">
              {matchedPatrons.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      setSelectedPatron(p);
                      setEmailQuery(p.email);
                      setMatchedPatrons([]);
                      setShowNewPatronForm(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm"
                  >
                    <span className="font-medium">{p.fullName}</span>
                    <span className="text-muted-foreground ml-2">{p.email}</span>
                    {p.studentId && <span className="text-muted-foreground ml-2">· {p.studentId}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedPatron && (
            <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {selectedPatron.fullName} ({selectedPatron.email})
              <button
                onClick={() => { setSelectedPatron(null); setEmailQuery(""); }}
                className="ml-auto text-xs text-muted-foreground underline"
              >
                Xóa
              </button>
            </div>
          )}

          {showNewPatronForm && (
            <div className="mt-3 p-4 border border-dashed border-primary/30 rounded-lg bg-primary/5 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Độc giả mới — Nhập thông tin
              </p>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={emailQuery} readOnly className="bg-muted/50 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tên đầy đủ *</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nguyễn Văn A" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">MSSV (tùy chọn)</Label>
                <Input value={newStudentId} onChange={e => setNewStudentId(e.target.value)} placeholder="SV2024..." className="mt-1" />
              </div>
              <Button size="sm" onClick={() => {
                if (!emailQuery.includes("@") || !newName.trim()) {
                  toast({ title: "Thiếu thông tin", variant: "destructive" }); return;
                }
                setSelectedPatron({ id: 0, email: emailQuery, fullName: newName, studentId: newStudentId || undefined });
                setShowNewPatronForm(false);
              }} className="gap-2">
                <UserPlus className="w-4 h-4" /> Xác nhận thêm
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label>Hạn trả (mặc định +14 ngày)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1.5")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dueDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={d => d && setDueDate(d)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Summary */}
        {selectedBooks.length > 0 && selectedPatron && (
          <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1 border border-border">
            <p className="font-medium">Tóm tắt phiếu mượn:</p>
            <p className="text-muted-foreground">👤 {selectedPatron.fullName}</p>
            <p className="text-muted-foreground">📚 {selectedBooks.length} cuốn: {selectedBooks.map(b => b.title).join(", ")}</p>
            <p className="text-muted-foreground">📅 Hạn trả: {format(dueDate, "dd/MM/yyyy")}</p>
          </div>
        )}

        <Button
          onClick={handleBorrow}
          className="w-full gap-2 text-base py-3"
          size="lg"
          disabled={selectedBooks.length === 0 || !selectedPatron || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
          {selectedBooks.length > 1
            ? `Xử lý mượn ${selectedBooks.length} sách`
            : "Xử lý mượn sách"}
        </Button>
      </div>
    </div>
  );
};

export default BorrowManagement;