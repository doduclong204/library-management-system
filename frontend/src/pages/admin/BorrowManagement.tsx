import { useState, useRef, useEffect } from "react";
import { MOCK_BOOKS } from "@/data/mockBooks";
import { MOCK_BORROWERS, type Borrower } from "@/data/mockBorrowers";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, ScanLine, Camera, CameraOff, CheckCircle,
  User, Calendar as CalendarIcon, UserPlus, Mail
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
  const [bookQuery, setBookQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showNewBorrowerForm, setShowNewBorrowerForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14));
  const [cameraOn, setCameraOn] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const matchedBooks = bookQuery.length > 1
    ? MOCK_BOOKS.filter(b =>
        b.title.toLowerCase().includes(bookQuery.toLowerCase()) ||
        b.isbn.includes(bookQuery)
      ).slice(0, 5)
    : [];

  const matchedBorrowers = emailQuery.length > 1
    ? MOCK_BORROWERS.filter(b =>
        b.email.toLowerCase().includes(emailQuery.toLowerCase()) ||
        b.name.toLowerCase().includes(emailQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const selectedBook = MOCK_BOOKS.find(b => b.id === selectedBookId);

  // When email search yields no results, show add-new form
  useEffect(() => {
    if (emailQuery.length > 2 && matchedBorrowers.length === 0 && !selectedBorrower) {
      setShowNewBorrowerForm(true);
    } else if (selectedBorrower || emailQuery.length <= 2) {
      setShowNewBorrowerForm(false);
    }
  }, [emailQuery, matchedBorrowers.length, selectedBorrower]);

  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraOn(true);
        setTimeout(() => {
          const randomBook = MOCK_BOOKS[Math.floor(Math.random() * MOCK_BOOKS.length)];
          setScanResult(randomBook.isbn);
          setBookQuery(randomBook.title);
          setSelectedBookId(randomBook.id);
          toast({ title: "Đã quét barcode!", description: `ISBN: ${randomBook.isbn} — ${randomBook.title}` });
          streamRef.current?.getTracks().forEach(t => t.stop());
          streamRef.current = null;
          setCameraOn(false);
        }, 3000);
      } catch {
        toast({ title: "Không thể mở camera", description: "Hãy thử nhập ISBN thủ công.", variant: "destructive" });
      }
    }
  };

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleIsbnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && bookQuery.length > 3) {
      const found = MOCK_BOOKS.find(b => b.isbn.includes(bookQuery) || b.title.toLowerCase().includes(bookQuery.toLowerCase()));
      if (found) {
        setSelectedBookId(found.id);
        setBookQuery(found.title);
        toast({ title: "Đã tìm thấy", description: `${found.title} (${found.isbn})` });
      }
    }
  };

  const handleSelectBorrower = (b: Borrower) => {
    setSelectedBorrower(b);
    setEmailQuery(b.email);
    setShowNewBorrowerForm(false);
  };

  const handleConfirmNewBorrower = () => {
    if (!emailQuery.includes("@") || !newName.trim()) {
      toast({ title: "Thiếu thông tin", description: "Email và tên là bắt buộc.", variant: "destructive" });
      return;
    }
    const newBorrower: Borrower = {
      id: `B${Date.now()}`,
      email: emailQuery.trim(),
      name: newName.trim(),
      studentId: newStudentId.trim() || undefined,
    };
    setSelectedBorrower(newBorrower);
    setShowNewBorrowerForm(false);
    toast({ title: "Đã thêm độc giả mới", description: `${newBorrower.name} (${newBorrower.email})` });
  };

  const handleBorrow = () => {
    if (!selectedBookId || !selectedBorrower || !dueDate) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn sách và người mượn.", variant: "destructive" });
      return;
    }
    toast({
      title: "Mượn sách thành công! ✅",
      description: `${selectedBook?.title} → ${selectedBorrower.name}. Hạn trả: ${format(dueDate, "dd/MM/yyyy")}`,
    });
    setSelectedBookId("");
    setSelectedBorrower(null);
    setBookQuery("");
    setEmailQuery("");
    setScanResult("");
    setDueDate(addDays(new Date(), 14));
    setNewName("");
    setNewStudentId("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Cho mượn sách
        </h1>
        <p className="text-muted-foreground mt-1">Quét barcode hoặc tìm sách để xử lý mượn.</p>
      </div>

      {/* Book scanner */}
      <div className="glass-card p-5 max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-primary" /> Quét Barcode / ISBN
          </h3>
          <Button variant="outline" size="sm" onClick={toggleCamera} className="gap-1.5">
            {cameraOn ? <><CameraOff className="w-4 h-4" /> Tắt camera</> : <><Camera className="w-4 h-4" /> Bật camera</>}
          </Button>
        </div>

        {cameraOn && (
          <div className="relative mb-4 rounded-lg overflow-hidden bg-foreground/5 aspect-video max-w-md">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-32 border-2 border-primary/60 rounded-lg animate-pulse" />
            </div>
            <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
              Đang quét... Hướng camera vào barcode
            </p>
          </div>
        )}

        <div className="relative">
          <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={bookQuery}
            onChange={e => { setBookQuery(e.target.value); setSelectedBookId(""); }}
            onKeyDown={handleIsbnKeyDown}
            placeholder="Nhập ISBN hoặc tên sách (Enter để tìm)..."
            className="pl-10"
          />
        </div>

        {matchedBooks.length > 0 && !selectedBookId && (
          <ul className="mt-2 border border-border rounded-lg overflow-hidden">
            {matchedBooks.map(b => (
              <li key={b.id}>
                <button
                  onClick={() => { setSelectedBookId(b.id); setBookQuery(b.title); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between text-sm"
                >
                  <span>{b.title} — <span className="text-muted-foreground">{b.author}</span></span>
                  <Badge variant={b.available ? "outline" : "secondary"} className={b.available ? "bg-success/10 text-success border-success/20" : ""}>
                    {b.available ? "Còn sẵn" : "Đã mượn"}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedBook && (
          <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            Đã chọn: <strong>{selectedBook.title}</strong> ({selectedBook.isbn})
            <button onClick={() => { setSelectedBookId(""); setBookQuery(""); setScanResult(""); }} className="ml-auto text-xs text-muted-foreground underline">Xóa</button>
          </div>
        )}

        {scanResult && <p className="mt-1 text-xs text-muted-foreground">Barcode: {scanResult}</p>}
      </div>

      {/* Borrower search by email */}
      <div className="glass-card p-5 max-w-xl space-y-4">
        <div>
          <Label className="flex items-center gap-2 mb-1.5">
            <Mail className="w-4 h-4" /> Tìm người mượn (theo email)
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={emailQuery}
              onChange={e => { setEmailQuery(e.target.value); setSelectedBorrower(null); }}
              placeholder="Nhập email Gmail để tìm..."
              className="pl-10"
            />
          </div>

          {matchedBorrowers.length > 0 && !selectedBorrower && (
            <ul className="mt-2 border border-border rounded-lg overflow-hidden">
              {matchedBorrowers.map(b => (
                <li key={b.id}>
                  <button
                    onClick={() => handleSelectBorrower(b)}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm"
                  >
                    <span className="font-medium">{b.name}</span>
                    <span className="text-muted-foreground ml-2">{b.email}</span>
                    {b.studentId && <span className="text-muted-foreground ml-2">· {b.studentId}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedBorrower && (
            <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {selectedBorrower.name} ({selectedBorrower.email})
              {selectedBorrower.studentId && <span className="text-muted-foreground">· {selectedBorrower.studentId}</span>}
              <button onClick={() => { setSelectedBorrower(null); setEmailQuery(""); }} className="ml-auto text-xs text-muted-foreground underline">Xóa</button>
            </div>
          )}

          {/* Inline new borrower form */}
          {showNewBorrowerForm && (
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
              <Button size="sm" onClick={handleConfirmNewBorrower} className="gap-2">
                <UserPlus className="w-4 h-4" /> Xác nhận thêm
              </Button>
            </div>
          )}
        </div>

        {/* Due date */}
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
              <Calendar mode="single" selected={dueDate} onSelect={d => d && setDueDate(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleBorrow} className="w-full gap-2 text-base py-3" size="lg" disabled={!selectedBookId || !selectedBorrower}>
          <BookOpen className="w-5 h-5" /> Xử lý mượn sách
        </Button>
      </div>
    </div>
  );
};

export default BorrowManagement;
