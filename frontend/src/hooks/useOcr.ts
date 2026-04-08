import { useState, useEffect, useCallback } from "react";
import { ocrService, UpdateDigitalBookPayload } from "../services/ocrService";
import { DigitalBookResponse } from "../types/digitalBook";

export function useOcr() {
  const [books, setBooks] = useState<DigitalBookResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load danh sách ──────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ocrService.getAll();
      setBooks(data);
    } catch {
      setError("Không thể tải danh sách sách số.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Tìm kiếm ───────────────────────────────────
  const search = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = keyword.trim()
        ? await ocrService.search(keyword)
        : await ocrService.getAll();
      setBooks(data);
    } catch {
      setError("Tìm kiếm thất bại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Upload + OCR ────────────────────────────────
  const upload = useCallback(
    async (files: File[], title: string, author: string): Promise<boolean> => {
      setUploading(true);
      setError(null);
      try {
        const newBook = await ocrService.upload(files, title, author);
        setBooks((prev) => [newBook, ...prev]);
        return true;
      } catch (err) {
        console.error("Upload error:", err);
        setError("Tải lên thất bại. Vui lòng thử lại.");
        return false;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  // ── Cập nhật nội dung ───────────────────────────
  const update = useCallback(
    async (
      id: number,
      payload: UpdateDigitalBookPayload
    ): Promise<DigitalBookResponse | null> => {
      try {
        const updated = await ocrService.update(id, payload);
        setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
        return updated;
      } catch {
        setError("Lưu thất bại. Vui lòng thử lại.");
        return null;
      }
    },
    []
  );

  // ── Xoá ────────────────────────────────────────
  const remove = useCallback(async (id: number): Promise<void> => {
    try {
      await ocrService.delete(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Xoá thất bại.");
    }
  }, []);

  return {
    books,
    loading,
    uploading,
    error,
    upload,
    update,
    remove,
    search,
    refetch: fetchAll,
  };
}