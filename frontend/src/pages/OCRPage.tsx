import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import {
  Eye,
  Trash2,
  Upload,
  Search,
  RefreshCw,
  X,
  FileText,
  Plus,
} from "lucide-react";
import { useOcr } from "@/hooks/useOcr";
import { ocrService } from "@/services/ocrService";
import { DigitalBookResponse } from "@/types/digitalBook";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  if (!iso) return "—";
  return iso.split("T")[0];
}

function truncate(str: string, n = 80): string {
  if (!str) return "—";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function accuracyColor(pct: number): string {
  if (pct >= 90) return "bg-green-500";
  if (pct >= 75) return "bg-blue-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

const getAvgAccuracy = (pages: any[] | undefined) => {
  if (!pages || pages.length === 0) return 0;
  const total = pages.reduce((sum, p) => sum + (p.accuracyPercent || 0), 0);
  return Math.round(total / pages.length);
};

// ─── AccuracyBadge ────────────────────────────────────────────────────────────
function AccuracyBadge({ pct }: { pct: number }) {
  return (
    <span
      className={`${accuracyColor(pct)} text-white text-xs font-semibold px-3 py-1 rounded-full`}
    >
      {pct}%
    </span>
  );
}

// ─── Modal xem nội dung ───────────────────────────────────────────────────────
function ModalView({
  book,
  onClose,
}: {
  book: DigitalBookResponse | null;
  onClose: () => void;
}) {
  if (!book) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{book.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>{book.author || "Không rõ tác giả"}</span>
              <span>·</span>
              <span>OCR {fmtDate(book.ocrDate)}</span>
              <span>·</span>
              <AccuracyBadge pct={getAvgAccuracy(book.pages)} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="space-y-6">
            {book.pages && book.pages.length > 0 ? (
              book.pages.map((p) => (
                <div key={p.pageNumber}>
                  <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-wider">
                    Trang {p.pageNumber} (Độ chính xác: {p.accuracyPercent}%)
                  </p>
                  <pre className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800 font-mono border border-gray-100">
                    {p.extractedText || "Không có nội dung."}
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 italic">
                Dữ liệu nội dung trống.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OcrPage ──────────────────────────────────────────────────────────────────
export default function OcrPage() {
  const { books, loading, uploading, error, upload, remove, search } = useOcr();

  // Upload form state - Chuyển sang mảng để nhận nhiều ảnh
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table state
  const [keyword, setKeyword] = useState("");
  const [viewBook, setViewBook] = useState<DigitalBookResponse | null>(null);

  // ── file pick (Hỗ trợ nhiều file) ──
  const pickFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (fileArray.length === 0) return;

      setFiles((prev) => [...prev, ...fileArray]);
      setFormError("");

      fileArray.forEach((f) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(f);
      });

      if (!title && fileArray.length > 0) {
        setTitle(
          fileArray[0].name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
        );
      }
    },
    [title],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) pickFiles(e.dataTransfer.files);
    },
    [pickFiles],
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) pickFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── submit ──
  const handleUpload = async () => {
    if (files.length === 0)
      return setFormError("Vui lòng chọn ít nhất một file ảnh.");
    if (!title.trim()) return setFormError("Vui lòng nhập tiêu đề sách.");
    setFormError("");

    console.log(
      ">>> Bắt đầu gửi request OCR cho:",
      title,
      "Số lượng ảnh:",
      files.length,
    );

    try {
      // Truyền toàn bộ mảng files vào hook
      const ok = await upload(files, title.trim(), author.trim());

      if (ok) {
        console.log(">>> Upload thành công!");
        setFiles([]);
        setPreviews([]);
        setTitle("");
        setAuthor("");
      } else {
        console.error(">>> Hook upload trả về false");
      }
    } catch (err) {
      console.error(">>> Lỗi thực thi handleUpload:", err);
    }
  };

  // ── view detail ──
  const handleView = async (id: number) => {
    try {
      const detail = await ocrService.getById(id);
      setViewBook(detail);
    } catch {
      alert("Không thể tải nội dung.");
    }
  };

  // ── delete ──
  const handleDelete = async (id: number) => {
    if (!window.confirm("Xác nhận xoá sách số này?")) return;
    await remove(id);
  };

  // ── search ──
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const kw = e.target.value;
    setKeyword(kw);
    search(kw);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-1">
        <RefreshCw
          className={`text-blue-500 ${uploading ? "animate-spin" : ""}`}
          size={26}
        />
        <h1 className="text-2xl font-bold text-gray-900">OCR Upload</h1>
      </div>
      <p className="text-gray-500 mb-8">
        Tải lên hình ảnh sách cũ để trích xuất văn bản có thể tìm kiếm.
      </p>

      {/* ── Upload card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => files.length === 0 && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-6
            ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
            } ${files.length > 0 ? "cursor-default" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple // Quan trọng: Cho phép chọn nhiều file
            className="hidden"
            onChange={onFileChange}
          />

          {previews.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {previews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-[3/4] border rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <img
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1">
                    Trang {idx + 1}
                  </div>
                </div>
              ))}
              {/* Nút thêm ảnh nhanh */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all"
              >
                <Plus size={24} />
                <span className="text-[10px] mt-1 font-medium">Thêm ảnh</span>
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-gray-400 mb-3" size={36} />
              <p className="text-gray-600 font-medium">
                Nhấp hoặc kéo thả nhiều ảnh vào đây
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Hỗ trợ JPG, PNG, TIFF
              </p>
            </>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề sách <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tác giả
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nhập tên tác giả..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {(formError || error) && (
          <p className="text-red-500 text-sm mb-4">{formError || error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors
            ${
              uploading || files.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
            }`}
        >
          <Upload size={16} />
          {uploading
            ? "Đang xử lý OCR…"
            : `Tải lên & OCR (${files.length} ảnh)`}
        </button>
      </div>

      {/* ── Book list ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-gray-600" />
            Kho sách số
            <span className="text-gray-400 font-normal text-base">
              ({books.length})
            </span>
          </h2>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              value={keyword}
              onChange={handleSearch}
              placeholder="Tìm sách số..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                {[
                  "Tiêu đề",
                  "Tác giả",
                  "Nội dung trích",
                  "Ngày OCR",
                  "Độ chính xác",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-semibold text-xs uppercase tracking-wide border-b border-gray-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <RefreshCw
                      className="animate-spin mx-auto mb-2"
                      size={24}
                    />
                    Đang tải…
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Chưa có sách số nào.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px]">
                      {b.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {b.author || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[260px]">
                      {truncate(b.pages?.[0]?.extractedText || "")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fmtDate(b.ocrDate)}
                    </td>
                    <td className="px-4 py-3">
                      <AccuracyBadge pct={getAvgAccuracy(b.pages)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(b.id)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalView book={viewBook} onClose={() => setViewBook(null)} />
    </div>
  );
}
