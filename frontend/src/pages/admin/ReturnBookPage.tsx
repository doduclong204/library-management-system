import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { borrowRecordApi, calculateFine } from "@/services/borrowRecordService";
import type { BookReturnSearchResponse, ReturnBookResponse } from "@/types";
import { format } from "date-fns";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import {
  Undo2, ScanLine, Camera, CameraOff, CheckCircle,
  AlertTriangle, Calendar as CalendarIcon, User, Clock, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ReturnBookPage = () => {
  const [query, setQuery] = useState("");
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [searchResults, setSearchResults] = useState<BookReturnSearchResponse[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BookReturnSearchResponse | null>(null);
  const [returnResult, setReturnResult] = useState<ReturnBookResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    if (selectedRecord) return;
    if (query.length < 2) { setSearchResults([]); return; }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => handleSearch(query), 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [query, selectedRecord]);

  // Cleanup camera khi unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOn(false);
    setIsScanning(false);
  };

  const handleSearch = async (value: string) => {
    setIsSearching(true);
    try {
      const isBarcode = /^BC\d+$/i.test(value);
      const isIsbn = /^[0-9\-]{5,}$/.test(value);
      const params = isBarcode ? { barcode: value } : isIsbn ? { isbn: value } : { title: value };
      const res = await borrowRecordApi.search(params);
      setSearchResults(res.data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleScannedValue = useCallback((scannedText: string) => {
    stopCamera();
    setQuery(scannedText);
    setSelectedRecord(null);
    setReturnResult(null);
    toast({ title: "Đã quét barcode!", description: scannedText });
    handleSearch(scannedText);
  }, []);

  const toggleCamera = async () => {
    if (cameraOn) { stopCamera(); return; }
    try {
      const reader = new BrowserMultiFormatReader();
      setCameraOn(true);
      setIsScanning(true);

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = devices.find(d => d.label.toLowerCase().includes("back"))?.deviceId
        ?? devices[0]?.deviceId;

      if (!videoRef.current) return;

      const controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          handleScannedValue(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error("Scan error:", err);
        }
      });
      controlsRef.current = controls;
    } catch {
      stopCamera();
      toast({ title: "Không thể mở camera", description: "Hãy thử nhập thủ công hoặc upload ảnh.", variant: "destructive" });
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
      handleScannedValue(result.getText());
    } catch {
      toast({ title: "Không đọc được barcode", description: "Ảnh không rõ hoặc không có barcode.", variant: "destructive" });
    }
    e.target.value = "";
  };

  const handleSelectRecord = (record: BookReturnSearchResponse) => {
    setSelectedRecord(record);
    setQuery(record.bookTitle);
    setSearchResults([]);
    setReturnResult(null);
  };

  const handleClear = () => {
    setSelectedRecord(null);
    setQuery("");
    setSearchResults([]);
    setReturnResult(null);
  };

  const handleReturn = async () => {
    if (!selectedRecord) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn sách cần trả.", variant: "destructive" });
      return;
    }
    setIsReturning(true);
    try {
      const res = await borrowRecordApi.returnBook({
        barcode: selectedRecord.barcode,
        returnDate: format(returnDate, "yyyy-MM-dd"),
      });
      const result = res.data;
      setReturnResult(result);
      toast({
        title: "Trả sách thành công! ✅",
        description: result.hasFinePending
          ? `Phạt: ${result.fineAmount.toLocaleString("vi-VN")}đ (${result.overdueDays} ngày quá hạn)`
          : "Không có phạt. Trả đúng hạn!",
      });
      setSelectedRecord(null);
      setQuery("");
    } catch (err: any) {
      toast({
        title: "Lỗi xử lý trả sách",
        description: err?.response?.data?.message ?? "Đã xảy ra lỗi, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsReturning(false);
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

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
            {isScanning && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                  Đang quét... Hướng camera vào barcode
                </span>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedRecord(null); setReturnResult(null); }}
            placeholder="Nhập ISBN, barcode hoặc tên sách..."
            className="pl-10"
          />
        </div>

        {isSearching && (
          <p className="mt-2 text-xs text-muted-foreground px-1">Đang tìm kiếm...</p>
        )}

        {searchResults.length > 0 && !selectedRecord && (
          <ul className="mt-2 border border-border rounded-lg overflow-y-auto max-h-[220px]">
            {searchResults.map(r => (
              <li key={r.borrowRecordId} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => handleSelectRecord(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{r.bookTitle}</span>
                    <span className="text-muted-foreground text-xs">{r.barcode} · {r.patronName}</span>
                  </div>
                  {r.isOverdue && (
                    <Badge variant="destructive" className="text-xs shrink-0 ml-2">Quá hạn</Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedRecord && (
          <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            Đã chọn: <strong>{selectedRecord.bookTitle}</strong> ({selectedRecord.barcode})
            <button onClick={handleClear} className="ml-auto text-xs text-muted-foreground underline">
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* Thông tin phiếu mượn */}
      {selectedRecord && (
        <div className="glass-card p-5 max-w-xl space-y-2">
          <h3 className="text-sm font-semibold mb-2">Thông tin phiếu mượn</h3>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Người mượn: <strong>{selectedRecord.patronName}</strong></span>
            {selectedRecord.studentId && (
              <span className="text-muted-foreground">({selectedRecord.studentId})</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Ngày mượn: {selectedRecord.borrowDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>Hạn trả: <strong>{selectedRecord.dueDate}</strong></span>
            {selectedRecord.isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Quá hạn {selectedRecord.overdueDays} ngày
              </Badge>
            )}
          </div>
          {selectedRecord && (() => {
            const dueStr = String(selectedRecord.dueDate ?? "").slice(0, 10);
            const retStr = format(returnDate, "yyyy-MM-dd");
            const fine = calculateFine(dueStr, retStr);
            return fine > 0 ? (
              <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                <AlertTriangle className="w-4 h-4" />
                Phạt (nếu trả ngày {format(returnDate, "dd/MM/yyyy")}): {fine.toLocaleString("vi-VN")}đ
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Form trả sách */}
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
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={d => d && setReturnDate(d)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={handleReturn}
          className="w-full gap-2 text-base py-3"
          size="lg"
          disabled={!selectedRecord || isReturning}
        >
          <Undo2 className="w-5 h-5" />
          {isReturning ? "Đang xử lý..." : "Xử lý trả sách"}
        </Button>

        {returnResult && (
          <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
            returnResult.hasFinePending ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
          }`}>
            {returnResult.hasFinePending ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                Phạt quá hạn: {returnResult.fineAmount.toLocaleString("vi-VN")}đ
                ({returnResult.overdueDays} ngày × 5.000đ)
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Không phạt — trả đúng hạn!
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnBookPage;