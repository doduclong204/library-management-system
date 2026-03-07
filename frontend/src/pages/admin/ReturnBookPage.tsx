import { useState, useRef, useEffect } from "react";
import { MOCK_BOOKS, MOCK_BORROW_TRANSACTIONS } from "@/data/mockBooks";
import { useToast } from "@/hooks/use-toast";
import {
  Undo2, ScanLine, Camera, CameraOff, CheckCircle, AlertTriangle,
  Calendar as CalendarIcon, User, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const DAILY_FINE_RATE = 5000;

const ReturnBookPage = () => {
  const [bookQuery, setBookQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [fineResult, setFineResult] = useState<number | null>(null);
  const [borrowInfo, setBorrowInfo] = useState<typeof MOCK_BORROW_TRANSACTIONS[0] | null>(null);
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

  const selectedBook = MOCK_BOOKS.find(b => b.id === selectedBookId);

  // When a book is selected, find its active borrow record
  useEffect(() => {
    if (selectedBookId) {
      const tx = MOCK_BORROW_TRANSACTIONS.find(t => t.bookId === selectedBookId && !t.returnDate);
      setBorrowInfo(tx || null);
    } else {
      setBorrowInfo(null);
    }
  }, [selectedBookId]);

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
          const borrowedBooks = MOCK_BOOKS.filter(b => !b.available);
          const randomBook = borrowedBooks.length > 0 ? borrowedBooks[Math.floor(Math.random() * borrowedBooks.length)] : MOCK_BOOKS[0];
          setScanResult(randomBook.isbn);
          setBookQuery(randomBook.title);
          setSelectedBookId(randomBook.id);
          setFineResult(null);
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

  const handleReturn = () => {
    if (!selectedBookId) {
      toast({ title: "Thiếu thông tin", description: "Chọn sách cần trả.", variant: "destructive" });
      return;
    }
    const dueDate = borrowInfo ? new Date(borrowInfo.dueDate) : new Date("2026-02-20");
    const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / 86400000));
    const fine = daysOverdue * DAILY_FINE_RATE;
    setFineResult(fine);
    toast({
      title: "Trả sách thành công! ✅",
      description: fine > 0
        ? `Phạt: ${fine.toLocaleString("vi-VN")}đ (${daysOverdue} ngày quá hạn × 5.000đ)`
        : "Không có phạt. Trả đúng hạn!",
    });
  };

  const handleIsbnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && bookQuery.length > 3) {
      const found = MOCK_BOOKS.find(b => b.isbn.includes(bookQuery) || b.title.toLowerCase().includes(bookQuery.toLowerCase()));
      if (found) {
        setSelectedBookId(found.id);
        setBookQuery(found.title);
        setFineResult(null);
        toast({ title: "Đã tìm thấy", description: `${found.title} (${found.isbn})` });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Undo2 className="w-6 h-6 text-primary" /> Trả sách
        </h1>
        <p className="text-muted-foreground mt-1">
          Quét barcode hoặc nhập ISBN để xử lý trả sách. Phạt quá hạn: 5.000đ/ngày.
        </p>
      </div>

      {/* Scanner */}
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
            onChange={e => { setBookQuery(e.target.value); setSelectedBookId(""); setFineResult(null); }}
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
                  onClick={() => { setSelectedBookId(b.id); setBookQuery(b.title); setFineResult(null); }}
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
            <button onClick={() => { setSelectedBookId(""); setBookQuery(""); setScanResult(""); setFineResult(null); setBorrowInfo(null); }} className="ml-auto text-xs text-muted-foreground underline">Xóa</button>
          </div>
        )}

        {scanResult && <p className="mt-1 text-xs text-muted-foreground">Barcode: {scanResult}</p>}
      </div>

      {/* Borrow info display */}
      {borrowInfo && (
        <div className="glass-card p-5 max-w-xl space-y-2">
          <h3 className="text-sm font-semibold mb-2">Thông tin phiếu mượn</h3>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Người mượn: <strong>{borrowInfo.userName}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Ngày mượn: {borrowInfo.borrowDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>Hạn trả: <strong>{borrowInfo.dueDate}</strong></span>
            {new Date(borrowInfo.dueDate) < new Date() && (
              <Badge variant="destructive" className="text-xs">Quá hạn</Badge>
            )}
          </div>
        </div>
      )}

      {/* Return form */}
      <div className="glass-card p-5 max-w-xl space-y-4">
        <div>
          <Label>Ngày trả</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-1.5">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(returnDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={returnDate} onSelect={d => d && setReturnDate(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleReturn} className="w-full gap-2 text-base py-3" size="lg" disabled={!selectedBookId}>
          <Undo2 className="w-5 h-5" /> Xử lý trả sách
        </Button>

        {fineResult !== null && (
          <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${fineResult > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
            {fineResult > 0 ? (
              <><AlertTriangle className="w-5 h-5" /> Phạt quá hạn: {fineResult.toLocaleString("vi-VN")}đ</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Không phạt — trả đúng hạn!</>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnBookPage;
