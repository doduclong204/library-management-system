const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1")
  .replace(/\/api\/v1\/?$/, "");

/**
 * Chuyển image_url từ DB thành URL tuyệt đối để dùng trong <img src>.
 * Xử lý cả path cũ (/api/v1/images/...) và path mới (/images/...).
 */
export function buildImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  // Normalize: bỏ /api/v1 prefix nếu có (path cũ)
  const normalized = imageUrl.replace(/^\/api\/v1/, "");
  return `${BASE}${normalized}`;
}