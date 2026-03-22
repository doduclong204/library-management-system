// src/pages/admin/OcrPage.tsx

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Eye, Trash2, Upload, Search, RefreshCw, X, FileText } from "lucide-react";
import { useOcr } from "../hooks/useOcr";
import { ocrService } from "../services/ocrService";
import { DigitalBookResponse } from "../types/digitalBook";

// ─── helpers ──────────────────────────────────────────────────────────────────
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

// ─── AccuracyBadge ────────────────────────────────────────────────────────────
function AccuracyBadge({ pct }: { pct: number }) {
  return (
    <span className={`${accuracyColor(pct)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
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
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{book.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {book.author || "Không rõ tác giả"} · OCR {fmtDate(book.ocrDate)} ·{" "}
              <AccuracyBadge pct={book.accuracyPercent} />
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nội dung */}
        <div className="overflow-y-auto p-6">
          <pre className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800 font-mono">
            {book.extractedText || "Không có nội dung."}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── OcrPage ──────────────────────────────────────────────────────────────────
export default function OcrPage() {
  const { books, loading, uploading, error, upload, remove, search } = useOcr();

  // Upload form state
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [title, setTitle]         = useState("");
  const [author, setAuthor]       = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef              = useRef<HTMLInputElement>(null);

  // Table state
  const [keyword, setKeyword]     = useState("");
  const [viewBook, setViewBook]   = useState<DigitalBookResponse | null>(null);

  // ── file pick ──
  const pickFile = useCallback((f: File) => {
    setFile(f);
    setFormError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
    }
  }, [title]);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, [pickFile]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  };

  // ── submit ──
  const handleUpload = async () => {
    if (!file)         return setFormError("Vui lòng chọn file ảnh.");
    if (!title.trim()) return setFormError("Vui lòng nhập tiêu đề sách.");
    setFormError("");

    const ok = await upload(file, title.trim(), author.trim());
    if (ok) {
      setFile(null);
      setPreview(null);
      setTitle("");
      setAuthor("");
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-1">
        <RefreshCw className="text-blue-500" size={26} />
        <h1 className="text-2xl font-bold text-gray-900">OCR Upload</h1>
      </div>
      <p className="text-gray-500 mb-8">
        Tải lên hình ảnh sách cố để trích xuất văn bản có thể tìm kiếm.
      </p>

      {/* ── Upload card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer mb-6
            ${dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/tiff"
            className="hidden"
            onChange={onFileChange}
          />

          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="preview"
                className="max-h-48 max-w-full rounded-lg object-contain mx-auto"
              />
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-gray-400 mb-3" size={36} />
              <p className="text-gray-600 font-medium">Nhấp để tải lên trang sách đã quét</p>
              <p className="text-gray-400 text-sm mt-1">Hỗ trợ JPG, PNG, TIFF</p>
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tác giả</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nhập tên tác giả..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {(formError || error) && (
          <p className="text-red-500 text-sm mb-4">{formError || error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors
            ${uploading || !file
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
            }`}
        >
          <Upload size={16} />
          {uploading ? "Đang xử lý OCR…" : "Tải lên & OCR"}
        </button>
      </div>

      {/* ── Book list ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-gray-600" />
            Kho sách số
            <span className="text-gray-400 font-normal text-base">({books.length})</span>
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={keyword}
              onChange={handleSearch}
              placeholder="Tìm sách số..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                {["Tiêu đề", "Tác giả", "Nội dung trích", "Ngày OCR", "Độ chính xác", "Hành động"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide
                                           border-b border-gray-100 first:rounded-tl-lg last:rounded-tr-lg">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
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
                      {truncate(b.extractedText)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fmtDate(b.ocrDate)}
                    </td>
                    <td className="px-4 py-3">
                      <AccuracyBadge pct={b.accuracyPercent ?? 0} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(b.id)}
                          title="Xem nội dung"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          title="Xoá"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal */}
      <ModalView book={viewBook} onClose={() => setViewBook(null)} />
    </div>
  );
}