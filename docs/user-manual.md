# Hướng Dẫn Sử Dụng

**Tên hệ thống:** CampusLink – Hệ thống Quản lý Thư viện  
**Đối tượng:** Thủ thư (Librarian) và Bạn đọc (Patron)

---

## Mục lục

1. [Giới thiệu hệ thống](#1-giới-thiệu-hệ-thống)
2. [Yêu cầu sử dụng](#2-yêu-cầu-sử-dụng)
3. [Trang công khai – Dành cho bạn đọc](#3-trang-công-khai--dành-cho-bạn-đọc)
   - 3.1 [Trang chủ](#31-trang-chủ)
   - 3.2 [Tìm kiếm sách](#32-tìm-kiếm-sách)
   - 3.3 [Chi tiết sách](#33-chi-tiết-sách)
   - 3.4 [Sách số (OCR)](#34-sách-số-ocr)
4. [Đăng nhập – Dành cho thủ thư](#4-đăng-nhập--dành-cho-thủ-thư)
5. [Khu vực quản trị – Dành cho thủ thư](#5-khu-vực-quản-trị--dành-cho-thủ-thư)
   - 5.1 [Dashboard tổng quan](#51-dashboard-tổng-quan)
   - 5.2 [Quản lý sách](#52-quản-lý-sách)
   - 5.3 [Cho mượn sách](#53-cho-mượn-sách)
   - 5.4 [Trả sách](#54-trả-sách)
   - 5.5 [Danh sách mượn](#55-danh-sách-mượn)
   - 5.6 [Quản lý phạt & thanh toán](#56-quản-lý-phạt--thanh-toán)
   - 5.7 [Số hóa sách (OCR)](#57-số-hóa-sách-ocr)
6. [Hệ thống thông báo email tự động](#6-hệ-thống-thông-báo-email-tự-động)
7. [Câu hỏi thường gặp (FAQ)](#7-câu-hỏi-thường-gặp-faq)

---

## 1. Giới thiệu hệ thống

**CampusLink Library Management System** là ứng dụng web quản lý thư viện trường đại học, hỗ trợ:

- **Bạn đọc** tra cứu sách, xem tình trạng còn/hết, đọc sách số hóa trực tuyến.
- **Thủ thư** quản lý toàn bộ hoạt động: thêm/sửa/xóa sách, cho mượn, nhận trả, thu phí phạt, số hóa sách bằng OCR.

Hệ thống gồm hai phân vùng chính:

| Phân vùng | Truy cập | Đường dẫn |
|-----------|----------|-----------|
| Trang công khai | Tất cả mọi người | `/`, `/search`, `/books/:id`, `/digital-books` |
| Khu vực quản trị | Thủ thư (đã đăng nhập) | `/admin`, `/admin/*` |

---

## 2. Yêu cầu sử dụng

- **Trình duyệt:** Chrome, Firefox, Edge phiên bản mới nhất (khuyên dùng Chrome).
- **Kết nối mạng:** Cần có kết nối internet để tải dữ liệu từ server.
- **Camera (tùy chọn):** Dùng để quét mã barcode khi cho mượn / trả sách (chỉ dành cho thủ thư).
- **Địa chỉ truy cập:** `http://localhost:5173` (môi trường dev) hoặc `http://localhost:4173` (preview).

---

## 3. Trang công khai – Dành cho bạn đọc

### 3.1 Trang chủ

**Đường dẫn:** `/`

Trang chủ là điểm vào chính của hệ thống, hiển thị:

- **Thanh tìm kiếm nhanh** ở trung tâm trang — nhập tên sách, tác giả hoặc ISBN rồi nhấn **Tìm kiếm** (hoặc Enter).
- **Thống kê nhanh:** tổng số sách, số sách còn sẵn, số bạn đọc đang hoạt động.
- **Sách nổi bật:** danh sách các sách còn bản sao sẵn có để mượn.
- **Đang được mượn nhiều:** các sách hiện tại đã hết tất cả bản sao.

> **Mẹo:** Nhấn vào bìa sách hoặc tên sách bất kỳ để xem chi tiết.

---

### 3.2 Tìm kiếm sách

**Đường dẫn:** `/search`

Trang tìm kiếm cho phép tra cứu sách theo nhiều tiêu chí:

**Thanh tìm kiếm chính:**
- Nhập từ khóa vào ô tìm kiếm — hệ thống tự động tìm theo **tên sách**, **tác giả**, **ISBN** hoặc **nội dung OCR**.
- Kết quả cập nhật tự động sau 400ms kể từ lần nhập cuối.

**Bộ lọc nâng cao** (nhấn nút **Bộ lọc** để mở):

| Bộ lọc | Mô tả |
|--------|-------|
| Thể loại | Chọn từ danh sách: Programming, Classic, Fantasy, Romance, v.v. |
| Sắp xếp | Mới nhất / Tên A→Z / Tên Z→A / Năm cũ nhất / Năm mới nhất |
| Tác giả | Nhập tên tác giả để lọc |
| Năm xuất bản | Nhập khoảng năm (Từ — Đến) |
| Chỉ sách còn sẵn | Tích để chỉ hiển thị sách còn bản sao có thể mượn |

**Phân trang:** Nếu kết quả nhiều hơn 12 sách, sử dụng các nút **← Trước** / **Sau →** hoặc nhấn số trang để điều hướng.

**Xóa bộ lọc:** Nhấn nút **Xóa bộ lọc** (biểu tượng X) để trở về trạng thái mặc định.

---

### 3.3 Chi tiết sách

**Đường dẫn:** `/books/:id`

Nhấn vào một sách bất kỳ để xem trang chi tiết, bao gồm:

- Ảnh bìa sách (nếu có).
- Thông tin đầy đủ: tên, tác giả, ISBN, thể loại, năm xuất bản.
- **Tình trạng:** số bản sao sẵn có / tổng số bản sao.
- Giá sách (dùng làm phí phạt khi sách bị thu hồi).

> **Lưu ý:** Bạn đọc không thể tự đặt mượn qua hệ thống — vui lòng liên hệ thủ thư tại quầy hoặc qua email để được hỗ trợ.

---

### 3.4 Sách số (OCR)

**Đường dẫn:** `/digital-books`

Trang này hiển thị các sách đã được thủ thư số hóa bằng công nghệ OCR (nhận dạng ký tự quang học).

**Tìm kiếm nội dung:**
- Nhập từ khóa vào ô tìm kiếm để tìm theo **tiêu đề** hoặc **nội dung bên trong sách**.

**Xem sách số:**
1. Nhấn nút **Xem** (biểu tượng mắt) bên cạnh tên sách.
2. Cửa sổ xem sách mở ra với đầy đủ các trang.
3. Dùng nút **← / →** hoặc số trang để chuyển trang.
4. Dùng nút **+/-** để phóng to/thu nhỏ văn bản.
5. Nhấn **Sao chép** để sao chép nội dung trang hiện tại vào clipboard.

> **Lưu ý:** Mỗi trang hiển thị độ chính xác OCR (%). Độ chính xác cao (≥ 90%) thể hiện màu xanh lá; thấp (< 60%) thể hiện màu đỏ.

---

## 4. Đăng nhập – Dành cho thủ thư

**Đường dẫn:** `/login`

Chỉ thủ thư mới có tài khoản đăng nhập vào khu vực quản trị.

**Các bước đăng nhập:**
1. Truy cập `/login` hoặc nhấn **Đăng nhập** trên thanh điều hướng.
2. Nhập **Email** và **Mật khẩu** của tài khoản thủ thư.
3. Nhấn nút **Đăng nhập**.
4. Hệ thống chuyển hướng tự động sang trang **Dashboard** (`/admin`).

**Đăng xuất:**
- Nhấn vào tên/avatar thủ thư ở góc trên phải → chọn **Đăng xuất**.
- Hệ thống xóa phiên đăng nhập và quay về trang chủ.

> **Lưu ý bảo mật:** Token đăng nhập hết hạn sau **15 phút** không hoạt động. Hệ thống sẽ tự động yêu cầu đăng nhập lại.

---

## 5. Khu vực quản trị – Dành cho thủ thư

Sau khi đăng nhập, thủ thư có thể truy cập toàn bộ chức năng quản trị qua **thanh điều hướng bên trái (Sidebar)**.

---

### 5.1 Dashboard tổng quan

**Đường dẫn:** `/admin`

Trang tổng quan cung cấp cái nhìn nhanh về tình trạng thư viện:

**Thẻ thống kê:**

| Thẻ | Nội dung |
|-----|---------|
| Tổng sách | Số đầu sách trong hệ thống |
| Đang cho mượn | Số bản ghi mượn chưa trả |
| Quá hạn | Số sách đã quá ngày trả |
| Tiền phạt ước tính | Tổng tiền phạt của sách đang quá hạn |

**Biểu đồ thống kê:**
- **Biểu đồ cột:** Số sách mượn / trả theo từng tháng.
- **Biểu đồ tròn:** Phân bố thể loại sách trong thư viện.
- **Biểu đồ đường:** Xu hướng mượn sách theo thời gian.

**Nút làm mới:** Nhấn biểu tượng **Làm mới** (↻) ở góc trên phải để tải lại dữ liệu mới nhất.

---

### 5.2 Quản lý sách

**Đường dẫn:** `/admin/books`

Trang quản lý toàn bộ danh mục sách và bản sao.

#### Xem danh sách sách

- Danh sách hiển thị dạng bảng với các cột: Ảnh bìa, Tên sách, Tác giả, ISBN, Thể loại, Năm, Số bản sao, Giá.
- Dùng thanh tìm kiếm để lọc nhanh theo tên/ISBN.
- Phân trang: điều hướng bằng các nút trang ở cuối bảng.

#### Thêm sách mới

1. Nhấn nút **+ Thêm sách** ở góc trên phải.
2. Điền thông tin vào form:
   - **ISBN** (bắt buộc, duy nhất)
   - **Tên sách** (bắt buộc)
   - **Thể loại**
   - **Năm xuất bản**
   - **Số bản sao** (mặc định: 1)
   - **Tác giả** (có thể chọn tác giả đã có hoặc nhập tên mới)
   - **Giá sách** (dùng làm phí phạt khi sách bị thu hồi/mất)
   - **Ảnh bìa** (URL hoặc upload)
3. Nhấn **Lưu** để xác nhận.

#### Sửa thông tin sách

1. Nhấn biểu tượng **Sửa** (bút chì) ở dòng sách muốn cập nhật.
2. Chỉnh sửa thông tin trong form.
3. Nhấn **Lưu** để cập nhật.

#### Xóa sách

1. Nhấn biểu tượng **Xóa** (thùng rác) ở dòng sách muốn xóa.
2. Xác nhận trong hộp thoại xác nhận.

> **Lưu ý:** Không thể xóa sách đang có bản sao đang được mượn.

---

### 5.3 Cho mượn sách

**Đường dẫn:** `/admin/borrow`

Trang xử lý nghiệp vụ cho bạn đọc mượn sách.

#### Quy trình cho mượn

**Bước 1 – Tìm/tạo bạn đọc:**
- Nhập **Email** bạn đọc vào ô tìm kiếm.
- Nếu bạn đọc đã có trong hệ thống: thông tin tự động điền vào.
- Nếu chưa có: điền thêm **Họ tên** và **Mã sinh viên** để tạo mới.

**Bước 2 – Chọn sách cần mượn:**
- Nhập **ISBN** hoặc **barcode** của bản sao sách vào ô tìm kiếm sách.
- **Quét barcode bằng camera:**
  1. Nhấn biểu tượng **Camera** để bật camera.
  2. Hướng camera vào mã barcode trên sách.
  3. Hệ thống tự động nhận diện và thêm vào danh sách.
- **Upload ảnh barcode:** Nhấn biểu tượng **Upload** để chọn ảnh từ máy tính.
- Sách được thêm vào **danh sách chờ mượn** — có thể thêm nhiều sách cùng lúc.
- Nhấn **X** bên cạnh sách để xóa khỏi danh sách.

**Bước 3 – Chọn ngày trả hạn:**
- Mặc định: **14 ngày** kể từ hôm nay.
- Có thể nhấn vào ô ngày để mở lịch và chọn ngày khác.

**Bước 4 – Xác nhận cho mượn:**
- Kiểm tra lại thông tin bạn đọc và danh sách sách.
- Nhấn nút **Cho mượn**.
- Hệ thống tạo bản ghi mượn và cập nhật trạng thái bản sao.

**Thanh toán tiền sách (nếu cần):**
- Nếu sách yêu cầu đặt cọc, hệ thống hiển thị mã QR VietQR.
- Bạn đọc quét QR để thanh toán qua MB Bank.
- Hệ thống tự động xác nhận khi nhận được thanh toán (qua SePay webhook).
- Thủ thư cũng có thể nhấn **Xác nhận thủ công** nếu cần.

---

### 5.4 Trả sách

**Đường dẫn:** `/admin/borrow` → tab **Trả sách** (hoặc truy cập từ sidebar)

#### Quy trình trả sách

**Bước 1 – Tìm bản ghi mượn:**
- Nhập vào ô tìm kiếm một trong ba thông tin:
  - **Barcode** bản sao (ví dụ: `BC001`)
  - **ISBN** sách
  - **Tên sách**
- Hoặc nhấn **Camera** để quét barcode trực tiếp.
- Hoặc nhấn **Upload** để quét từ ảnh.
- Danh sách kết quả hiện bên dưới — nhấn để chọn bản ghi cần trả.

**Bước 2 – Chọn ngày trả:**
- Mặc định là **hôm nay**.
- Nhấn vào ô ngày để thay đổi nếu cần nhập ngày trả khác.

**Bước 3 – Xem thông tin tính phí:**

Hệ thống hiển thị thông tin tự động:

| Trường hợp | Hiển thị |
|------------|---------|
| Trả đúng hạn | Không phát sinh phí |
| Trả sớm | Số ngày trả sớm + số tiền hoàn lại |
| Trả trễ | Số ngày quá hạn + số tiền phạt |

**Bước 4 – Xác nhận trả:**
- Nhấn nút **Xác nhận trả sách**.
- Hệ thống cập nhật trạng thái bản sao về `available`, tăng số sách sẵn có.

**Bước 5 – Xử lý sau khi trả:**
- Nếu có **tiền phạt**: tiến hành thu phí (xem mục [5.6](#56-quản-lý-phạt--thanh-toán)).
- Nếu có **hoàn tiền** (trả sớm): nhấn **Xác nhận hoàn tiền** sau khi đã trả tiền mặt cho bạn đọc.

---

### 5.5 Danh sách mượn

**Đường dẫn:** `/admin/borrow-list`

Trang xem toàn bộ lịch sử và trạng thái mượn sách.

**Lọc theo trạng thái:**

| Trạng thái | Ý nghĩa |
|------------|---------|
| `borrowed` | Đang mượn, chưa trả |
| `returned` | Đã trả |
| `overdue` | Quá hạn trả |
| `lost` | Sách bị mất |
| `confiscated` | Sách bị thu hồi (quá hạn > 15 ngày) |

**Thông tin mỗi dòng:** Bạn đọc, sách, ngày mượn, ngày đến hạn, ngày trả, tiền phạt, trạng thái thanh toán.

---

### 5.6 Quản lý phạt & thanh toán

**Đường dẫn:** `/admin/fines`

Trang quản lý toàn bộ các khoản phạt và thanh toán.

#### Các tab chức năng

**Tab Quá hạn:**
- Danh sách sách đang quá hạn với số ngày quá hạn và tiền phạt ước tính.
- Nhấn **Tạo QR thanh toán** để tạo mã QR VietQR cho bạn đọc quét.
- Có thể gom nhiều khoản phạt của cùng một bạn đọc vào một lần thanh toán.

**Tab Đã thu phạt:**
- Danh sách các bản ghi đã thanh toán phạt thành công.
- Hiển thị tổng tiền phạt đã thu.

**Tab Hoàn tiền:**
- Danh sách các trường hợp trả sách sớm đang chờ hoàn tiền.
- Nhấn **Xác nhận hoàn tiền** sau khi đã trả tiền mặt cho bạn đọc.

**Tab Đã hoàn tiền:**
- Lịch sử các khoản đã hoàn tiền.

#### Quy trình thu phạt bằng QR

1. Tại tab **Quá hạn**, tìm bạn đọc cần thu phạt.
2. Nhấn **Tạo QR thanh toán**.
3. Hệ thống hiển thị mã QR VietQR kèm số tiền cần chuyển.
4. Bạn đọc mở app ngân hàng, quét QR và chuyển khoản.
5. Hệ thống **tự động xác nhận** trong vòng vài giây qua SePay webhook.
6. Hoặc thủ thư nhấn **Xác nhận thủ công** nếu đã nhận tiền mặt.

> **Lưu ý:** Mã thanh toán có dạng `FINE-XXXX`. Bạn đọc cần chuyển **đúng số tiền** và **không xóa nội dung chuyển khoản** để hệ thống xác nhận tự động.

---

### 5.7 Số hóa sách (OCR)

**Đường dẫn:** `/admin/ocr`

Trang số hóa sách vật lý thành văn bản kỹ thuật số bằng công nghệ Tesseract OCR.

#### Upload và số hóa ảnh

**Cách 1 – Kéo thả:**
- Kéo file ảnh từ máy tính và thả vào **vùng upload** (có viền nét đứt).

**Cách 2 – Chọn file:**
- Nhấn vào vùng upload để mở hộp thoại chọn file.
- Chọn một hoặc nhiều file ảnh (JPG, PNG, WEBP).

**Điền thông tin sách số:**
- **Tiêu đề sách** (bắt buộc)
- **Tác giả** (tùy chọn)

**Bắt đầu OCR:**
- Nhấn nút **Bắt đầu OCR** (hoặc **Upload & OCR**).
- Thanh tiến trình hiển thị quá trình xử lý từng trang.
- Sau khi hoàn tất, kết quả xuất hiện trong danh sách bên dưới.

#### Quản lý sách số

**Xem nội dung:**
- Nhấn biểu tượng **Mắt** để xem chi tiết từng trang đã OCR.
- Mỗi trang hiển thị: văn bản trích xuất, đường dẫn ảnh gốc, độ chính xác (%).

**Sao chép văn bản:**
- Nhấn nút **Sao chép** để copy toàn bộ văn bản trang vào clipboard.

**Chỉnh sửa:**
- Nhấn biểu tượng **Bút** để chỉnh sửa tiêu đề, tác giả hoặc văn bản OCR.
- Nhấn **Lưu** để cập nhật, hoặc **Hủy** để bỏ thay đổi.

**Tìm kiếm nội dung:**
- Sử dụng thanh tìm kiếm để tìm sách số theo **tiêu đề** hoặc **nội dung** bên trong.

**Xóa sách số:**
- Nhấn biểu tượng **Thùng rác** và xác nhận để xóa.

> **Lưu ý:** Hệ thống hỗ trợ OCR tiếng Việt và tiếng Anh (`vie+eng`). Chất lượng OCR phụ thuộc vào độ sắc nét của ảnh gốc.

---

## 6. Hệ thống thông báo email tự động

Hệ thống tự động gửi email đến bạn đọc theo lịch hàng ngày mà **không cần thủ thư thao tác**:

| Thời điểm | Loại email | Điều kiện |
|-----------|-----------|-----------|
| **08:00** hàng ngày | Nhắc trả sách | Sách sắp đến hạn trong **3 ngày** tới |
| **08:15** hàng ngày | Cảnh báo thu hồi | Sách đã quá hạn **đúng 12 ngày** |
| **08:30** hàng ngày | Thông báo thu hồi | Sách quá hạn **trên 15 ngày** — tự động chuyển sang `confiscated`, phí phạt = giá sách |

> **Lưu ý quan trọng:** Khi sách bị chuyển sang trạng thái `confiscated`, bạn đọc phải thanh toán phí bằng **giá niêm yết của sách**. Thủ thư cần thu phí này trước khi bạn đọc có thể mượn sách tiếp theo.

---

## 7. Câu hỏi thường gặp (FAQ)

**Q: Bạn đọc có thể tự đặt mượn sách online không?**  
A: Hiện tại hệ thống chưa hỗ trợ tính năng này. Bạn đọc cần liên hệ trực tiếp thủ thư để được cho mượn.

**Q: Quên mật khẩu thủ thư thì phải làm gì?**  
A: Liên hệ quản trị viên hệ thống để đặt lại mật khẩu. Chức năng tự đặt lại mật khẩu chưa được hỗ trợ trong phiên bản này.

**Q: Camera không nhận diện được barcode, phải làm gì?**  
A: Đảm bảo ánh sáng đủ và giữ camera ổn định. Nếu vẫn không được, sử dụng tính năng **Upload ảnh barcode** thay thế, hoặc nhập ISBN/barcode thủ công.

**Q: QR thanh toán được bao lâu?**  
A: Mã QR có hiệu lực trong **5 phút**. Nếu hết hạn, nhấn **Tạo QR mới** để lấy mã khác.

**Q: Tại sao hệ thống tự động đăng xuất?**  
A: Token đăng nhập hết hạn sau 15 phút không hoạt động để đảm bảo bảo mật. Đăng nhập lại để tiếp tục sử dụng.

**Q: Thông tin bạn đọc được lưu như thế nào?**  
A: Mỗi bạn đọc được nhận diện qua **email** (duy nhất). Khi thủ thư nhập email mới, hệ thống tự động tạo hồ sơ bạn đọc. Lần tiếp theo chỉ cần nhập lại email là hệ thống nhận ra.

**Q: Sách số có thể tải về không?**  
A: Hiện tại chỉ hỗ trợ **xem trực tuyến** và **sao chép văn bản**. Chức năng tải file PDF chưa được hỗ trợ.

**Q: Làm sao biết thanh toán đã thành công?**  
A: Hệ thống tự động cập nhật trạng thái sau khi nhận xác nhận từ SePay (thường trong vài giây). Thủ thư có thể nhấn **F5** hoặc **Làm mới** nếu cần kiểm tra thủ công.

---

*Tài liệu hướng dẫn sử dụng CampusLink Library Management System – Phiên bản 1.0*
