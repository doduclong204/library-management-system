# 📚 CampusLink – Hệ thống Quản lý Thư viện

> Đồ án Capstone - Hệ thống Quản lý Thư viện (Agile Scrum)

Ứng dụng web full-stack quản lý thư viện đại học — xây dựng với **React + Spring Boot**, hỗ trợ quản lý sách, mượn/trả, thu phí phạt qua QR thanh toán, và số hóa sách bằng OCR.

---

## ✨ Tính năng nổi bật

### 🌐 Dành cho bạn đọc (không cần đăng nhập)
- Duyệt và tìm kiếm sách theo tên, tác giả, ISBN hoặc nội dung OCR
- Lọc theo thể loại, năm xuất bản, tình trạng còn sách — sắp xếp đa tiêu chí
- Xem chi tiết sách và số bản sao còn sẵn theo thời gian thực
- Đọc sách số hóa (OCR) trực tuyến với chỉ số độ chính xác từng trang

### 🔐 Dành cho thủ thư (cần đăng nhập)
- **Dashboard** — thống kê trực quan với biểu đồ cột, tròn và đường
- **Quản lý sách** — thêm/sửa/xóa sách và bản sao
- **Cho mượn** — đăng ký mượn kèm quét barcode (camera hoặc upload ảnh)
- **Trả sách** — xử lý trả với tính phí phạt / hoàn tiền tự động
- **Quản lý phạt** — thanh toán qua QR VietQR tích hợp SePay webhook
- **Số hóa sách (OCR)** — upload ảnh trang sách, trích xuất văn bản bằng Tesseract
- **Email tự động** — nhắc hạn, cảnh báo thu hồi, thông báo tịch thu theo lịch

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Quản lý state | Zustand, TanStack React Query |
| Backend | Spring Boot 3.2.5, Spring Security, Spring Data JPA |
| Cơ sở dữ liệu | MySQL 8.0 |
| Xác thực | JWT (access token 15 phút + refresh token 7 ngày) |
| OCR | Tesseract 5.x qua Tess4J (Tiếng Việt + Tiếng Anh) |
| Thanh toán | SePay webhook + VietQR |
| Email | Gmail SMTP (Spring Mail) |
| Quét barcode | @zxing/browser (quét qua camera) |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu môi trường

- Java 17+
- Node.js 18+ LTS
- MySQL 8.0+
- Tesseract OCR 5.x với `vie.traineddata` + `eng.traineddata`
- Maven 3.6+

### Chạy Backend

```bash
cd backend

# Tạo file .env
cp .env.example .env
# Điền vào: DB_USERNAME, DB_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD

mvn clean package -DskipTests
java -jar target/library-0.0.1-SNAPSHOT.jar
# Chạy tại http://localhost:8080
```

### Chạy Frontend

```bash
cd frontend

npm install
npm run dev
# Chạy tại http://localhost:5173
```

---

## ⚙️ Biến môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
DB_USERNAME=tên_đăng_nhập_mysql
DB_PASSWORD=mật_khẩu_mysql
JWT_SECRET=khóa_bí_mật_tối_thiểu_256bit
MAIL_USERNAME=email_gmail@gmail.com
MAIL_PASSWORD=mật_khẩu_ứng_dụng_gmail
```

---

## 📁 Cấu trúc dự án

```
library-management-system/
├── backend/          # REST API Spring Boot
│   └── src/
│       └── main/java/com/campuslink/library/
│           ├── controller/
│           ├── service/
│           ├── entity/
│           ├── repository/
│           ├── security/
│           └── scheduler/
└── frontend/         # React SPA
    └── src/
        ├── pages/
        │   └── admin/
        ├── components/
        ├── services/
        ├── store/
        └── types/
```

---

## 📖 Tổng quan API

Base URL: `http://localhost:8080/api/v1`

| Tài nguyên | Endpoint |
|------------|---------|
| Xác thực | `POST /auth/login` |
| Sách | `GET/POST/PUT/DELETE /books` |
| Mượn sách | `GET/POST /borrows` |
| Trả sách | `POST /borrow-records/return` |
| Phạt | `PATCH /borrow-records/{id}/pay-fine` |
| Thanh toán | `POST /payments/create` |
| OCR | `POST /ocr/upload` |

Tài liệu đầy đủ: xem [`docs/SDD.md`](docs/SDD.md)

---

## 🤖 Tác vụ tự động (Scheduled Jobs)

| Thời gian | Công việc | Điều kiện kích hoạt |
|-----------|-----------|---------------------|
| 08:00 hàng ngày | Gửi email nhắc hạn | Sách sắp đến hạn trong 3 ngày |
| 08:15 hàng ngày | Gửi email cảnh báo thu hồi | Quá hạn đúng 12 ngày |
| 08:30 hàng ngày | Tự động tịch thu + thông báo | Quá hạn 15+ ngày → trạng thái `confiscated`, phạt = giá sách |

---

## 👥 Nhóm phát triển

Đồ án được thực hiện theo phương pháp **Agile Scrum**.

---

## 📄 Giấy phép

Dự án được xây dựng phục vụ mục đích học thuật.
