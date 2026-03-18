import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { borrowApi, patronApi, bookApi } from "@/services/apiServices";
import type { PatronSearchResult, BorrowRequest, BorrowResponse, Book } from "@/types";
import {
  BookOpen, ScanLine, Camera, CameraOff, CheckCircle,
  User, Calendar as CalendarIcon, UserPlus, Mail, Loader2
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
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
  const streamRef = useRef<MediaStream | null>(null);
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

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const matchedBooks = bookQuery.length > 1
    ? allBooks.filter(b =>
        b.title.toLowerCase().includes(bookQuery.toLowerCase()) ||
        b.isbn.toLowerCase().includes(bookQuery.toLowerCase())
      ).slice(0, 6)
    : allBooks.slice(0, 6);

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

  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      toast({ title: "Không thể mở camera", variant: "destructive" });
    }
  };

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleBorrow = async () => {
    if (!selectedBook || !selectedPatron || !dueDate) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn sách và người mượn.", variant: "destructive" });
      return;
    }

    const payload: BorrowRequest = {
      email: selectedPatron.email,
      fullName: selectedPatron.fullName,
      studentId: selectedPatron.studentId,
      bookCopyId: selectedBook.id,
      dueDate: format(dueDate, "yyyy-MM-dd"),
    };

    setIsSubmitting(true);
    try {
      const res = await borrowApi.borrow(payload);
      const result = (res.data?.data ?? res.data) as BorrowResponse;
      toast({
        title: "Mượn sách thành công! ✅",
        description: `${result.bookTitle} → ${result.userName}. Hạn trả: ${format(dueDate, "dd/MM/yyyy")}`,
      });

      // Reload lại danh sách sách để cập nhật available_copies
      await fetchBooks();

      setSelectedBook(null); setBookQuery("");
      setSelectedPatron(null); setEmailQuery("");
      setMatchedPatrons([]);
      setDueDate(addDays(new Date(), 14));
      setNewName(""); setNewStudentId("");
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
        <p className="text-muted-foreground mt-1">Quét barcode hoặc tìm sách để xử lý mượn.</p>
      </div>

      <div className="glass-card p-5 max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-primary" /> Quét Barcode / ISBN
          </h3>
          <Button variant="outline" size="sm" onClick={toggleCamera} className="gap-1.5">
            {cameraOn
              ? <><CameraOff className="w-4 h-4" /> Tắt camera</>
              : <><Camera className="w-4 h-4" /> Bật camera</>}
          </Button>
        </div>

        {cameraOn && (
          <div className="relative mb-4 rounded-lg overflow-hidden bg-foreground/5 aspect-video max-w-md">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-32 border-2 border-primary/60 rounded-lg animate-pulse" />
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
            onChange={e => { setBookQuery(e.target.value); setSelectedBook(null); }}
            onFocus={() => setShowBookDropdown(true)}
            onBlur={() => setTimeout(() => setShowBookDropdown(false), 150)}
            placeholder="Nhập ISBN hoặc tên sách để tìm..."
            className="pl-10"
          />
        </div>

        {showBookDropdown && !selectedBook && (
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
                      onMouseDown={() => {
                        setSelectedBook(b);
                        setBookQuery(b.title);
                        setShowBookDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between text-sm gap-3"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{b.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {b.isbn} · {b.authors?.join(", ")}
                        </span>
                      </div>
                      <Badge
                        variant={b.available_copies > 0 ? "outline" : "secondary"}
                        className={cn(
                          "shrink-0",
                          b.available_copies > 0 ? "bg-success/10 text-success border-success/20" : ""
                        )}
                      >
                        {b.available_copies > 0 ? `Còn ${b.available_copies}` : "Hết"}
                      </Badge>
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}

        {selectedBook && (
          <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col min-w-0">
              <strong className="truncate">{selectedBook.title}</strong>
              <span className="text-xs text-muted-foreground">
                {selectedBook.isbn} · {selectedBook.authors?.join(", ")}
              </span>
            </div>
            <button
              onClick={() => { setSelectedBook(null); setBookQuery(""); }}
              className="ml-auto text-xs text-muted-foreground underline shrink-0"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

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

        <Button
          onClick={handleBorrow}
          className="w-full gap-2 text-base py-3"
          size="lg"
          disabled={!selectedBook || !selectedPatron || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
          Xử lý mượn sách
        </Button>
      </div>
    </div>
  );
};

export default BorrowManagement;