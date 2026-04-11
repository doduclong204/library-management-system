# Tài liệu Thiết kế Phần mềm (SDD)

**Tên dự án:** CampusLink – Hệ thống Quản lý Thư viện  
---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tổng quan kiến trúc](#2-tổng-quan-kiến-trúc)
3. [Thiết kế Frontend (React + Vite)](#3-thiết-kế-frontend-react--vite)
4. [Thiết kế Backend (Spring Boot)](#4-thiết-kế-backend-spring-boot)
5. [Thiết kế cơ sở dữ liệu](#5-thiết-kế-cơ-sở-dữ-liệu)
6. [Thiết kế API REST](#6-thiết-kế-api-rest)
7. [Bảo mật hệ thống](#7-bảo-mật-hệ-thống)
8. [Các tính năng đặc biệt](#8-các-tính-năng-đặc-biệt)
9. [Xử lý lỗi và Logging](#9-xử-lý-lỗi-và-logging)
10. [Cấu hình và triển khai](#10-cấu-hình-và-triển-khai)

---

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả chi tiết thiết kế kỹ thuật của hệ thống **CampusLink Library Management System** — một ứng dụng web quản lý thư viện trường đại học, hỗ trợ thủ thư trong việc quản lý sách, mượn/trả, thu phí phạt, và số hóa sách vật lý thông qua OCR.

### 1.2 Phạm vi hệ thống

Hệ thống gồm hai phần riêng biệt:

- **Frontend:** Ứng dụng SPA viết bằng React 18 + TypeScript + Vite, chạy tại cổng `5173` (dev) / `4173` (preview).
- **Backend:** RESTful API viết bằng Spring Boot 3.2.5, chạy tại cổng `8080`, kết nối MySQL.

Các tính năng chính: quản lý sách và bản sao, quản lý bạn đọc, mượn/trả sách, quản lý phạt + thanh toán qua SePay QR, số hóa sách bằng Tesseract OCR, gửi email nhắc hạn tự động.

### 1.3 Định nghĩa và từ viết tắt

| Thuật ngữ | Giải thích |
|-----------|-----------|
| SDD | Software Design Document |
| SPA | Single Page Application |
| JWT | JSON Web Token |
| OCR | Optical Character Recognition – nhận dạng ký tự quang học |
| DAO/Repository | Lớp truy cập dữ liệu (Data Access Object) |
| DTO | Data Transfer Object |
| CORS | Cross-Origin Resource Sharing |
| SePay | Cổng thanh toán tích hợp qua webhook |
| Patron | Bạn đọc (người mượn sách) |
| Librarian | Thủ thư (người quản lý hệ thống) |

---

## 2. Tổng quan kiến trúc

### 2.1 Mô hình kiến trúc

Hệ thống theo mô hình **3-tier Client–Server**:

```
┌─────────────────────────────────────────┐
│           REACT FRONTEND (SPA)           │
│  Router │ Pages │ Components │ Services  │
│              Axios HTTP Client           │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST (JSON)
                   ▼
┌─────────────────────────────────────────┐
│        SPRING BOOT BACKEND (API)         │
│    Controller │ Service │ Repository     │
│           Spring Security (JWT)          │
└──────────────────┬──────────────────────┘
                   │ JPA / Hibernate
                   ▼
┌─────────────────────────────────────────┐
│             MySQL DATABASE               │
│         library_management1             │
└─────────────────────────────────────────┘
```

### 2.2 Luồng xử lý request

1. Người dùng thao tác trên giao diện React.
2. Component gọi hàm trong `services/`, sử dụng `axiosInstance`.
3. Axios đính kèm JWT token (lấy từ `localStorage`) vào header `Authorization: Bearer <token>`.
4. Request đến Spring Boot → qua `JwtAuthenticationFilter` xác thực.
5. Controller nhận request → gọi Service → gọi Repository → truy vấn MySQL.
6. Kết quả trả về theo chuỗi ngược: Repository → Service → Controller → JSON Response → Axios → React State.

### 2.3 Giao tiếp giữa các tầng

- **Frontend ↔ Backend:** HTTP REST, JSON, port `8080`.
- **Backend ↔ DB:** JDBC qua Spring Data JPA / Hibernate, DB `library_management1`, port `3306`.
- **SePay ↔ Backend:** Webhook HTTP POST tới `/api/webhook/sepay`, xử lý bởi `SepayWebhookFilter` trước Spring Security.
- **Backend ↔ Email:** SMTP qua Gmail (port 587, STARTTLS) cho thông báo nhắc hạn.

---

## 3. Thiết kế Frontend (React + Vite)

### 3.1 Công nghệ và thư viện

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Type-safe JavaScript |
| Vite | 7.3.1 | Build tool / Dev server |
| React Router DOM | 6.30.1 | Client-side routing (SPA) |
| Axios | 1.13.5 | HTTP client gọi API |
| Zustand | 5.0.11 | Global state management (auth) |
| TanStack React Query | 5.83.0 | Server state, caching |
| TanStack React Table | 8.21.3 | Bảng dữ liệu phân trang |
| shadcn/ui + Radix UI | — | Bộ UI components |
| Tailwind CSS | 3.4.17 | Utility-first CSS |
| Framer Motion | 12.34.3 | Animation |
| React Hook Form + Zod | 7.x / 3.x | Form và validation |
| Recharts | 2.15.4 | Biểu đồ thống kê |
| @zxing/browser | 0.1.5 | Đọc barcode qua camera |
| next-themes | 0.3.0 | Dark/Light mode |
| Sonner / Radix Toast | — | Thông báo (toast) |

### 3.2 Cấu trúc thư mục

```
src/
├── App.tsx                  # Entry point, định nghĩa Routes
├── main.tsx                 # Render App vào DOM
├── index.css                # Global CSS (Tailwind directives)
│
├── components/
│   ├── ui/                  # shadcn/ui components (Button, Dialog, Table,...)
│   ├── Layout.tsx           # Layout cho Admin (có Sidebar)
│   ├── PublicLayout.tsx     # Layout cho trang công khai (có PublicNavbar)
│   ├── Sidebar.tsx          # Sidebar navigation (Admin)
│   ├── TopNavbar.tsx        # Top bar (Admin)
│   ├── PublicNavbar.tsx     # Navbar trang công khai
│   ├── BookCard.tsx         # Card hiển thị sách
│   ├── BookDetailModal.tsx  # Modal chi tiết sách
│   ├── SearchBar.tsx        # Thanh tìm kiếm
│   ├── NavLink.tsx          # Link navigation có active state
│   ├── ThemeProvider.tsx    # Provider Dark/Light mode
│   └── ThemeToggle.tsx      # Nút chuyển theme
│
├── pages/
│   ├── HomePage.tsx         # Trang chủ (public)
│   ├── SearchPage.tsx       # Tìm kiếm sách (public)
│   ├── BookDetailPage.tsx   # Chi tiết sách (public)
│   ├── DigitalBooksPage.tsx # Xem sách số OCR (public)
│   ├── LoginPage.tsx        # Đăng nhập thủ thư
│   ├── OCRPage.tsx          # Upload ảnh OCR (admin)
│   ├── NotFound.tsx         # 404
│   └── admin/
│       ├── AdminDashboard.tsx    # Dashboard thống kê
│       ├── BookManagement.tsx    # CRUD sách
│       ├── BorrowManagement.tsx  # Xử lý cho mượn sách
│       ├── BorrowListPage.tsx    # Danh sách mượn
│       ├── FineManagement.tsx    # Quản lý phạt
│       └── ReturnBookPage.tsx    # Xử lý trả sách
│
├── services/
│   ├── api.ts               # Hàm gọi API Books, Patrons, Borrows
│   ├── apiServices.ts       # Hàm gọi API bổ sung
│   ├── authService.ts       # Gọi API auth (login, logout, getMe)
│   ├── borrowRecordService.ts  # Gọi API borrow-records
│   ├── ocrService.ts        # Gọi API OCR upload/search
│   └── paymentApi.ts        # Gọi API payment (tạo QR, confirm, status)
│
├── store/
│   └── authStore.ts         # Zustand store: user, token, isAuthenticated
│
├── context/
│   └── AuthContext.tsx      # AuthProvider, cung cấp useAuth() hook
│
├── hooks/
│   ├── useDebounce.ts       # Debounce input search
│   ├── useOcr.ts            # Hook cho OCR workflow
│   └── use-mobile.tsx       # Detect mobile breakpoint
│
├── lib/
│   ├── axiosInstance.ts     # Axios config: baseURL, interceptors JWT
│   ├── imageUrl.ts          # Helper tạo URL ảnh từ backend
│   └── utils.ts             # Tiện ích chung (cn, clsx)
│
├── types/
│   ├── index.ts             # Các interface chính
│   └── digitalBook.ts       # Interface DigitalBook, DigitalBookPage
│
└── data/
    ├── mockBooks.ts         # Mock data sách (dev/test)
    ├── mockBorrowers.ts     # Mock data bạn đọc
    └── mockUsers.ts         # Mock data user
```

### 3.3 Routing

Routing được cấu hình trong `App.tsx` sử dụng React Router DOM v6:

```
/                       → HomePage (PublicRoute)
/search                 → SearchPage (PublicRoute)
/books/:id              → BookDetailPage (PublicRoute)
/digital-books          → DigitalBooksPage (PublicRoute)
/login                  → LoginPage
/admin                  → AdminDashboard (AdminRoute)
/admin/books            → BookManagement (AdminRoute)
/admin/borrow           → BorrowManagement (AdminRoute)
/admin/borrow-list      → BorrowListPage (AdminRoute)
/admin/fines            → FineManagement (AdminRoute)
/admin/ocr              → OCRPage (AdminRoute)
*                       → NotFound
```

**Route guard:** `AdminRoute` kiểm tra `isAuthenticated` từ `useAuth()`. Nếu chưa đăng nhập → redirect `/login`.

### 3.4 Quản lý State

**Auth state (Zustand – `authStore.ts`):**

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
```

State được persist vào `localStorage`. Khi load lại trang, `AuthContext` tự động lấy token và gọi `authService.getMe()` để khôi phục user.

**Server state (TanStack React Query):** Dùng cho các query lấy dữ liệu từ API (sách, danh sách mượn,...), hỗ trợ caching, refetching, pagination.

### 3.5 Axios Instance (`lib/axiosInstance.ts`)

```typescript
baseURL: "http://localhost:8080/api/v1"

// Request Interceptor:
// Tự động đính kèm: Authorization: Bearer <accessToken>
// Token lấy từ localStorage.getItem("accessToken")

// Response Interceptor:
// 401 → xóa accessToken, redirect /login
```

### 3.6 Các kiểu dữ liệu chính (`types/index.ts`)

| Interface | Mô tả |
|-----------|-------|
| `Book` | isbn, title, genre, publication_year, total_copies, available_copies, authors[], price |
| `User` | _id, username, email, full_name, account_locked, role (LIBRARIAN/USER) |
| `BorrowRecord` | Bản ghi mượn sách |
| `BookReturnSearchResponse` | Tìm kiếm khi trả sách (có overdueDays, estimatedFine) |
| `ReturnBookResponse` | Kết quả sau khi trả (có refundAmount, earlyDays, fineAmount) |
| `ApiResponse<T>` | `{ statusCode, message, error?, data: T }` |
| `ApiPagination<T>` | `{ meta: { current, pageSize, pages, total }, result: T[] }` |
| `BorrowStatus` | `"borrowed" \| "returned" \| "overdue" \| "lost" \| "confiscated"` |

---

## 4. Thiết kế Backend (Spring Boot)

### 4.1 Công nghệ và thư viện

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| Spring Boot | 3.2.5 | Framework Java chính |
| Spring MVC | 6.x | REST Controller |
| Spring Data JPA | 3.x | ORM, Repository pattern |
| Hibernate | 6.x | JPA implementation |
| Spring Security | 6.x | Xác thực JWT, phân quyền |
| JJWT | — | Tạo và xác thực JWT |
| MySQL Connector/J | 8.x | Kết nối MySQL |
| Lombok | — | Giảm boilerplate |
| MapStruct | — | Mapping Entity ↔ DTO |
| Tess4J | 5.11.0 | Java wrapper Tesseract OCR |
| Spring Mail | — | Gửi email SMTP |
| Spring Dotenv | 4.0.0 | Đọc `.env` file |
| Spring Validation | — | `@Valid` input validation |
| Maven | 3.x | Build tool |

### 4.2 Cấu trúc package

```
com.campuslink.library/
├── LibraryApplication.java
│
├── config/
│   ├── CorsConfig.java                      # Cấu hình CORS
│   ├── SecurityConfig.java                  # Security filter chain, BCrypt
│   ├── SecurityUtil.java                    # Lấy thông tin user hiện tại
│   ├── DataInitializer.java                 # Khởi tạo dữ liệu mẫu
│   ├── RestTemplateConfig.java              # Bean RestTemplate
│   └── StaticResourcesWebConfiguration.java # Serve file upload tĩnh
│
├── controller/
│   ├── AuthController.java          # /api/v1/auth/*
│   ├── BookController.java          # /api/v1/books
│   ├── BorrowController.java        # /api/v1/borrows
│   ├── BorrowRecordController.java  # /api/v1/borrow-records
│   ├── PatronController.java        # /api/v1/patrons
│   ├── PaymentController.java       # /api/v1/payments
│   ├── OcrController.java           # /api/v1/ocr
│   └── FileUploadController.java    # Upload file
│
├── service/
│   ├── AuthService.java
│   ├── BookService.java / impl/BookServiceImpl.java
│   ├── BorrowService.java
│   ├── BorrowRecordService.java
│   ├── PatronService.java / PatronServiceImpl.java
│   ├── PaymentService.java
│   ├── DigitalBookService.java
│   ├── ClaudeOcrService.java        # Tesseract OCR
│   └── EmailNotificationService.java
│
├── entity/
│   ├── Book.java, Author.java, BookCopy.java
│   ├── Patron.java, Librarian.java
│   ├── BorrowRecord.java, Payment.java
│   └── DigitalBook.java, DigitalBookPage.java
│
├── repository/
│   ├── BookRepository.java, AuthorRepository.java
│   ├── BookCopyRepository.java
│   ├── PatronRepository.java, LibrarianRepository.java
│   ├── BorrowRecordRepository.java, PaymentRepository.java
│   └── DigitalBookRepository.java
│
├── dto/
│   ├── request/  (LoginRequest, BookRequest, BorrowRequest, ReturnBookRequest,
│   │             PatronRequest, CreatePaymentRequest, ConfirmPaymentRequest,
│   │             SepayWebhookRequest, DigitalBookRequest, UpdateDigitalBookRequest)
│   └── response/ (ApiResponse, ApiPagination, ApiString,
│                  AuthenticationResponse, LibrarianResponse, BookResponse,
│                  BorrowResponse, ReturnBookResponse, BookReturnSearchResponse,
│                  PatronResponse, DigitalBookResponse,
│                  CreatePaymentResponse, PaymentStatusResponse)
│
├── enums/
│   ├── BookStatus.java     # available, borrowed, reserved, damaged, lost
│   ├── BorrowStatus.java   # borrowed, returned, overdue, lost, confiscated
│   └── PaymentStatus.java  # PENDING, PAID
│
├── mapper/
│   ├── BookMapper.java, BorrowMapper.java, BorrowRecordMapper.java
│   ├── DigitalBookMapper.java, LibrarianMapper.java, PatronMapper.java
│
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── LibrarianDetails.java
│   └── LibrarianUserDetailsService.java
│
├── filter/
│   └── SepayWebhookFilter.java
│
├── scheduler/
│   └── ReminderScheduler.java
│
└── exception/
    ├── AppException.java
    ├── ErrorCode.java
    └── GlobalExceptionHandler.java
```

### 4.3 Business Logic

#### Mượn sách (`BorrowService`)

1. Nhận `BorrowRequest` (email, `bookCopyIds[]`, `dueDate`).
2. Tìm/tạo `Patron` theo email.
3. Kiểm tra `BookCopy.status == available`.
4. Tạo `BorrowRecord`: `status=borrowed`, snapshot `bookPrice` từ `Book.price`.
5. Cập nhật `BookCopy.status = borrowed`, `Book.availableCopies--`.
6. Tạo `sessionId` UUID chung cho nhóm sách mượn cùng lúc.

#### Trả sách (`BorrowRecordService`)

1. Tìm bản ghi theo isbn / barcode / title đang `status=borrowed`.
2. Tính `overdueDays = returnDate - dueDate`.
3. Nếu trả sớm (`earlyDays > 0`): tính `refundAmount`.
4. Nếu quá hạn: tính `fineAmount`.
5. Cập nhật `BorrowRecord`, `BookCopy.status = available`, `Book.availableCopies++`.

#### Scheduled Jobs (`ReminderScheduler`)

| Job | Cron | Hành động |
|-----|------|-----------|
| `sendDueDateReminders` | `0 0 8 * * *` | Email nhắc sách sắp đến hạn (2 ngày trước) |
| `sendConfiscationWarnings` | `0 15 8 * * *` | Cảnh báo sách quá hạn đúng 12 ngày |
| `autoConfiscateOverdue` | `0 30 8 * * *` | Tự động `status=confiscated`, `fineAmount=bookPrice` cho sách quá 15 ngày |

---

## 5. Thiết kế cơ sở dữ liệu

### 5.1 Thông tin kết nối

```
DBMS:     MySQL 8.0+
Database: library_management1
Host:     localhost
Port:     3306
DDL:      spring.jpa.hibernate.ddl-auto=update
```

### 5.2 Sơ đồ quan hệ thực thể (ERD)

```
authors ──<book_authors>── books ──── book_copies
                               └──── digital_books ──── digital_book_pages

patrons ──── borrow_records ──── book_copies
                 │           └── librarians
                 └─────────────── payments
```

### 5.3 Mô tả các bảng

#### Bảng `books`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| isbn | VARCHAR | NOT NULL, UNIQUE | Mã ISBN |
| title | VARCHAR | NOT NULL | Tên sách |
| image_url | VARCHAR | NULL | URL ảnh bìa |
| genre | VARCHAR | NULL | Thể loại |
| publication_year | INT | NULL | Năm xuất bản |
| total_copies | INT | DEFAULT 1 | Tổng số bản sao |
| available_copies | INT | DEFAULT 1 | Bản sao còn sẵn |
| full_text | TEXT | NULL | Toàn văn |
| price | DECIMAL(10,2) | DEFAULT 0 | Giá sách |

Index: `isbn` (UNIQUE), `title`

#### Bảng `authors`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| name | VARCHAR | NOT NULL | Tên tác giả |

#### Bảng `book_authors` (join table)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| author_id | INT | FK → authors.id |
| book_id | INT | FK → books.id |

#### Bảng `book_copies`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| book_id | INT | FK NOT NULL | Tham chiếu sách |
| barcode | VARCHAR | NOT NULL, UNIQUE | Mã vạch bản sao |
| status | ENUM | NOT NULL | `available`, `borrowed`, `reserved`, `damaged`, `lost` |

#### Bảng `patrons`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| email | VARCHAR | NOT NULL, UNIQUE | Email bạn đọc |
| full_name | VARCHAR | NOT NULL | Họ tên |
| student_id | VARCHAR | UNIQUE, NULL | Mã sinh viên |

#### Bảng `librarians`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| username | VARCHAR | NOT NULL, UNIQUE | Tên đăng nhập |
| email | VARCHAR | NOT NULL, UNIQUE | Email |
| password_hash | VARCHAR | NOT NULL | Mật khẩu BCrypt |
| full_name | VARCHAR | NOT NULL | Họ tên |
| account_locked | BOOLEAN | DEFAULT false | Trạng thái khóa tài khoản |

#### Bảng `borrow_records`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| patron_id | INT | FK NOT NULL | Bạn đọc |
| book_copy_id | INT | FK NOT NULL | Bản sao sách |
| librarian_id | INT | FK NULL | Thủ thư xử lý |
| book_price | DECIMAL(10,2) | DEFAULT 0 | Snapshot giá sách lúc mượn |
| book_paid | BOOLEAN | DEFAULT false | Đã thanh toán tiền sách |
| book_payment_code | VARCHAR | NULL | Mã thanh toán tiền sách |
| borrow_date | DATE | NULL (auto) | Ngày mượn |
| due_date | DATE | NOT NULL | Ngày đến hạn |
| return_date | DATE | NULL | Ngày trả thực tế |
| fine_amount | DECIMAL(10,2) | DEFAULT 0 | Tiền phạt |
| status | VARCHAR(20) | DEFAULT 'borrowed' | `borrowed`, `returned`, `overdue`, `lost`, `confiscated` |
| reminder_sent | BOOLEAN | DEFAULT false | Đã gửi email nhắc |
| fine_paid | BOOLEAN | DEFAULT false | Đã thanh toán phạt |
| session_id | VARCHAR | NULL | ID nhóm mượn cùng lúc |
| payment_code | VARCHAR | NULL | Mã thanh toán phạt |

#### Bảng `payments`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | INT | PK, AI | Khóa chính |
| borrow_record_id | INT | FK NULL | Bản ghi mượn liên quan |
| session_id | VARCHAR | NULL | ID nhóm (thanh toán nhiều phạt) |
| amount | DECIMAL(10,2) | NOT NULL | Số tiền |
| payment_code | VARCHAR | NOT NULL, UNIQUE | Mã thanh toán (UUID prefix) |
| status | VARCHAR(20) | DEFAULT 'PENDING' | `PENDING`, `PAID` |
| created_at | DATETIME | NOT NULL | Thời điểm tạo |
| paid_at | DATETIME | NULL | Thời điểm thanh toán xong |

#### Bảng `digital_books`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | BIGINT | PK, AI | Khóa chính |
| title | VARCHAR | NOT NULL | Tiêu đề sách số |
| author | VARCHAR | NULL | Tác giả |
| ocr_date | DATETIME | NULL | Ngày OCR |
| created_at | DATETIME | NULL | Ngày tạo |

#### Bảng `digital_book_pages`

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | BIGINT | PK, AI | Khóa chính |
| digital_book_id | BIGINT | FK | Sách số chứa trang |
| page_number | INT | NULL | Số trang |
| extracted_text | LONGTEXT | NULL | Văn bản trích xuất bằng OCR |
| image_path | VARCHAR | NULL | Đường dẫn ảnh gốc |
| accuracy_percent | INT | NULL | Độ chính xác OCR (%) |

---

## 6. Thiết kế API REST

### 6.1 Quy ước chung

- **Base URL:** `http://localhost:8080/api/v1`
- **Format:** JSON (`Content-Type: application/json`)
- **Xác thực:** `Authorization: Bearer <JWT_access_token>`
- **Phân trang:** `?page=1&size=10` (1-indexed theo `one-indexed-parameters: true`)
- **Response wrapper:**

```json
{
  "statusCode": 200,
  "message": "...",
  "data": { ... }
}
```

### 6.2 Danh sách API

#### Auth (`/api/v1/auth`)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/login` | Không | Đăng nhập, trả về access_token + user |
| POST | `/auth/refresh` | Cookie | Làm mới access_token |
| POST | `/auth/logout` | Không | Xóa refresh token cookie |

**Login Request:**
```json
{ "email": "admin@library.com", "password": "password123" }
```

**Login Response (`data`):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "_id": 1, "username": "admin", "email": "...", "full_name": "...", "role": "LIBRARIAN" }
}
```

---

#### Books (`/api/v1/books`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/books` | Danh sách sách (phân trang, filter) |
| GET | `/books/{id}` | Chi tiết sách |
| POST | `/books` | Thêm sách mới |
| PUT | `/books/{id}` | Cập nhật sách |
| DELETE | `/books/{id}` | Xóa sách |

**GET `/books` query params:** `page`, `size`, `keyword`, `genre`, `authorName`, `yearFrom`, `yearTo`, `sortBy`

**BookRequest body:**
```json
{
  "isbn": "978-3-16-148410-0",
  "title": "Tên sách",
  "genre": "Khoa học",
  "publication_year": 2023,
  "total_copies": 5,
  "author_ids": [1, 2],
  "author_names": ["Tác giả mới"],
  "price": 120000
}
```

---

#### Borrows (`/api/v1/borrows`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/borrows?status=borrowed` | Danh sách mượn (filter theo status) |
| POST | `/borrows` | Tạo bản ghi mượn mới |

**BorrowRequest body:**
```json
{
  "email": "sinhvien@university.edu",
  "fullName": "Nguyễn Văn A",
  "studentId": "SV001",
  "bookCopyIds": [5, 6, 7],
  "librarianId": 1,
  "dueDate": "2026-05-01"
}
```

---

#### Borrow Records (`/api/v1/borrow-records`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/borrow-records/search` | Tìm sách đang mượn (isbn/title/barcode) |
| POST | `/borrow-records/return` | Xử lý trả sách |
| GET | `/borrow-records/overdue` | Danh sách sách quá hạn |
| PATCH | `/{id}/pay-fine` | Đánh dấu đã nộp phạt |
| GET | `/borrow-records/fine-paid-list` | Danh sách đã nộp phạt |
| GET | `/borrow-records/fine-paid-total` | Tổng tiền phạt đã thu |
| GET | `/borrow-records/pending-refunds` | Sách trả sớm chờ hoàn tiền |
| PATCH | `/{id}/confirm-refund` | Xác nhận hoàn tiền |
| GET | `/borrow-records/confirmed-refunds` | Danh sách đã hoàn tiền |

**ReturnBookRequest body:**
```json
{
  "isbn": "978-...",
  "barcode": "BC001",
  "returnDate": "2026-04-11"
}
```

---

#### Patrons (`/api/v1/patrons`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/patrons/search?email=...` | Tìm bạn đọc theo email |
| POST | `/patrons` | Tạo bạn đọc mới |

---

#### Payments (`/api/v1/payments`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/payments/create` | Tạo QR thanh toán tiền phạt |
| POST | `/payments/confirm` | Xác nhận thanh toán thủ công |
| POST | `/payments/book/create` | Tạo QR thanh toán tiền sách |
| POST | `/payments/book/confirm` | Xác nhận thanh toán tiền sách |
| GET | `/payments/status/{paymentCode}` | Kiểm tra trạng thái thanh toán |
| POST | `/api/webhook/sepay` | Webhook nhận kết quả từ SePay |

**Cấu hình tài khoản ngân hàng** (PaymentService):
```
BANK_ID:      970422 (MB Bank)
ACCOUNT_NO:   0372555040
ACCOUNT_NAME: NGUYEN ANH QUAN
TEMPLATE:     compact2 (VietQR)
```

---

#### OCR / Digital Books (`/api/v1/ocr`)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/ocr/upload` | LIBRARIAN/ADMIN | Upload ảnh, chạy OCR |
| GET | `/ocr/books` | LIBRARIAN/ADMIN | Danh sách sách số |
| GET | `/ocr/books/{id}` | LIBRARIAN/ADMIN | Chi tiết sách số |
| GET | `/ocr/books/search?keyword=...` | LIBRARIAN/ADMIN | Tìm kiếm nội dung |
| PUT | `/ocr/books/{id}` | LIBRARIAN/ADMIN | Cập nhật nội dung |
| DELETE | `/ocr/books/{id}` | LIBRARIAN/ADMIN | Xóa sách số |

Upload: `multipart/form-data` với fields `files[]`, `title`, `author`.

### 6.3 Mã trạng thái HTTP

| Code | Ý nghĩa |
|------|---------|
| 200 OK | Thành công |
| 201 Created | Tạo mới thành công |
| 204 No Content | Thành công, không có dữ liệu trả về |
| 400 Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 Unauthorized | JWT không hợp lệ hoặc hết hạn |
| 403 Forbidden | Không có quyền |
| 404 Not Found | Tài nguyên không tồn tại |
| 409 Conflict | Vi phạm ràng buộc (ISBN đã tồn tại, thanh toán đang tiến hành) |
| 500 Internal Error | Lỗi hệ thống |

---

## 7. Bảo mật hệ thống

### 7.1 Xác thực JWT

- **Thư viện:** JJWT
- **Access Token:** hết hạn sau **15 phút** (`900.000 ms`), trả về trong body response.
- **Refresh Token:** hết hạn sau **7 ngày** (`604.800.000 ms`), lưu trong **HTTP-only cookie**.
- **Secret:** lấy từ biến môi trường `JWT_SECRET`.

**Luồng xác thực:**

```
Request → JwtAuthenticationFilter
         → Đọc header Authorization: Bearer <token>
         → Xác thực token (chữ ký, hết hạn)
         → Load LibrarianDetails từ DB
         → Set SecurityContextHolder
         → Tiếp tục filter chain
```

### 7.2 Phân quyền

Hai role: `LIBRARIAN`, `ADMIN`. Cấu hình trong `SecurityConfig.java`:

```java
// Public (permitAll):
/api/v1/auth/**, /api/v1/books/**, /api/v1/borrows/**
/api/v1/borrow-records/**, /api/v1/patrons/**, /api/v1/ocr/**
/api/webhook/sepay, /images/**, /videos/**

// OCR endpoint dùng @PreAuthorize:
@PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
```

### 7.3 CORS (`CorsConfig.java`)

```
Allowed Origins: http://localhost:8081, http://localhost:4173, http://localhost:5173
Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type
Allow Credentials: true
```

### 7.4 Mã hóa mật khẩu

BCrypt với strength **12** (`new BCryptPasswordEncoder(12)`).

### 7.5 Giới hạn upload

`max-file-size: 2048MB`, `max-request-size: 2048MB` (cho upload ảnh OCR dung lượng lớn).

---

## 8. Các tính năng đặc biệt

### 8.1 OCR – Số hóa sách (`ClaudeOcrService`)

- **Thư viện:** Tess4J 5.11.0 (wrapper Tesseract OCR)
- **Ngôn ngữ:** `vie+eng` (Tiếng Việt + Tiếng Anh)
- **Page Segmentation Mode:** 1 (Automatic + OSD)
- **OCR Engine Mode:** 1 (LSTM neural net)
- **Đầu ra:** `OcrResult { text: String, accuracy: int }` — văn bản + độ chính xác trung bình (%)
- **Lưu trữ:** Từng trang → `digital_book_pages` (text + image_path + accuracy_percent)
- **Tessdata path:** `C:/Program Files/Tesseract-OCR/tessdata` (cấu hình `tesseract.data.path`)

### 8.2 Thanh toán SePay QR

- Hệ thống tạo QR VietQR từ thông tin ngân hàng + `paymentCode` duy nhất.
- **Payment Code format:** `"FINE-XXXX"` (phạt) | UUID random (tiền sách).
- SePay gọi webhook `POST /api/webhook/sepay` khi giao dịch thành công.
- `SepayWebhookFilter` (chạy trước Security) match `paymentCode` trong nội dung chuyển khoản → cập nhật `Payment.status = PAID` → `BorrowRecord.finePaid = true`.

### 8.3 Barcode Scanner

Frontend dùng `@zxing/browser` đọc barcode qua camera thiết bị, hỗ trợ tìm nhanh `BookCopy` khi mượn/trả sách.

### 8.4 Email thông báo tự động

`EmailNotificationService` gửi qua Gmail SMTP (port 587, STARTTLS):

| Loại email | Trigger | Nội dung |
|------------|---------|----------|
| Nhắc hạn | 08:00 hàng ngày, 2 ngày trước hạn | Danh sách sách sắp đến hạn theo `sessionId` |
| Cảnh báo thu hồi | 08:15 hàng ngày, quá hạn 12 ngày | Cảnh báo sẽ bị thu hồi |
| Xác nhận thu hồi | 08:30 hàng ngày, quá hạn 15 ngày | Sách bị thu hồi, `fineAmount = bookPrice` |

---

## 9. Xử lý lỗi và Logging

### 9.1 Xử lý lỗi tập trung (Backend)

- `GlobalExceptionHandler.java` (`@ControllerAdvice`): bắt tất cả exception, trả về `ApiResponse` thống nhất.
- `ErrorCode.java` (enum): định nghĩa mã lỗi nghiệp vụ (`INVALID_REQUEST`, `PAYMENT_IN_PROGRESS`,...).
- `AppException` mang `ErrorCode`, ném từ Service layer.

### 9.2 Xử lý lỗi Frontend

- **Axios Interceptor:** `401` → xóa token, redirect `/login`.
- **Zustand store:** tự động clear khi logout / token lỗi.
- **TanStack React Query:** error state hiển thị qua `sonner` toast notification.

### 9.3 Logging (Backend)

- Framework: SLF4J + **Logback** (mặc định Spring Boot).
- `@Slf4j` (Lombok) được dùng trong: `ClaudeOcrService`, `ReminderScheduler`, `SepayWebhookFilter`, `PaymentService`.
- `show-sql: false` trong `application.yml` (có thể bật `format_sql: true` khi debug).

---

## 10. Cấu hình và triển khai

### 10.1 Biến môi trường (`.env`)

```env
DB_USERNAME=<mysql_username>
DB_PASSWORD=<mysql_password>
JWT_SECRET=<secret_key_min_256bit>
MAIL_USERNAME=<gmail_address>
MAIL_PASSWORD=<gmail_app_password>
```

### 10.2 `application.yml` – Cấu hình chính

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/library_management1
  jpa:
    hibernate:
      ddl-auto: update
  servlet:
    multipart:
      max-file-size: 2048MB
      max-request-size: 2048MB
  data:
    web:
      pageable:
        one-indexed-parameters: true

jwt:
  access-token-expiration: 900000
  refresh-token-expiration: 604800000

app:
  reminder:
    days-before: 2

tesseract:
  data:
    path: C:/Program Files/Tesseract-OCR/tessdata
  language: vie+eng

upload:
  file:
    uri: file:///E:/.../upload/
    image-uri: file:///E:/.../upload/images/
    ocr-uri: file:///E:/.../upload/ocr/
```

### 10.3 Yêu cầu môi trường

| Thành phần | Phiên bản |
|------------|-----------|
| JDK | 17+ |
| Node.js | 18.x LTS |
| MySQL | 8.0+ |
| Tesseract OCR | 5.x (cài riêng) |
| Tessdata | `vie.traineddata` + `eng.traineddata` |
| Maven | 3.6+ |

### 10.4 Lệnh khởi chạy

**Backend:**
```bash
cd backend
# Điền .env với thông tin thực
mvn clean package -DskipTests
java -jar target/library-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev       # Development: http://localhost:5173
npm run build     # Production build
npm run preview   # Preview: http://localhost:4173
```

---
