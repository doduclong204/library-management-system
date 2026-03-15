package com.campuslink.library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {

    // COMMON
    UNCATEGORIZED_EXCEPTION(500, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(400, "Khóa không hợp lệ", HttpStatus.BAD_REQUEST),

    // AUTHENTICATION
    UNAUTHENTICATED(401, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_ACCESS_TOKEN(400, "Access token không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN(400, "Refresh token không hợp lệ", HttpStatus.BAD_REQUEST),
    COOKIES_EMPTY(400, "Không tìm thấy refresh token trong cookie", HttpStatus.BAD_REQUEST),
    ACCOUNT_LOCKED(403, "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(401, "Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    ACCOUNT_NOT_FOUND(404, "Không tìm thấy tài khoản", HttpStatus.NOT_FOUND),

    // LIBRARIAN (thay cho USER)
    LIBRARIAN_EXISTED(409, "Thủ thư đã tồn tại", HttpStatus.CONFLICT),
    LIBRARIAN_NOT_FOUND(404, "Không tìm thấy thủ thư", HttpStatus.NOT_FOUND),
    LIBRARIAN_USERNAME_INVALID(400, "Tên đăng nhập phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    LIBRARIAN_EMAIL_INVALID(400, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    LIBRARIAN_PASSWORD_INVALID(400, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),

    // BOOK
    BOOK_NOT_FOUND(404, "Không tìm thấy sách", HttpStatus.NOT_FOUND),
    BOOK_EXISTED(409, "Sách đã tồn tại", HttpStatus.CONFLICT),

    // BOOK COPY
    COPY_NOT_FOUND(404, "Không tìm thấy bản sao sách", HttpStatus.NOT_FOUND),
    COPY_NOT_AVAILABLE(400, "Bản sao sách không khả dụng", HttpStatus.BAD_REQUEST),

    // CATEGORY
    CATEGORY_EXISTED(409, "Thể loại đã tồn tại", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(404, "Không tìm thấy thể loại", HttpStatus.NOT_FOUND),
    CATEGORY_HAS_BOOKS(400, "Không thể xóa thể loại vì đang có sách liên kết", HttpStatus.BAD_REQUEST),

    // AUTHOR
    AUTHOR_NOT_FOUND(404, "Không tìm thấy tác giả", HttpStatus.NOT_FOUND),
    AUTHOR_EXISTED(409, "Tác giả đã tồn tại", HttpStatus.CONFLICT),

    //login/refresh/logout
    TOKEN_EXPIRED(401, "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_INVALID(401, "Refresh token không hợp lệ hoặc đã bị thu hồi", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_NOT_FOUND(400, "Không tìm thấy refresh token", HttpStatus.BAD_REQUEST),
    LOGOUT_SUCCESS(200, "Đăng xuất thành công", HttpStatus.OK), // nếu bạn muốn trả message khi logout
    EMAIL_NOT_FOUND(404, "Email không tồn tại", HttpStatus.NOT_FOUND),
    PASSWORD_TOO_WEAK(400, "Mật khẩu quá yếu (phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số)",
            HttpStatus.BAD_REQUEST),

    FINE_ALREADY_PAID(4009, "Tiền phạt đã được thanh toán trước đó", HttpStatus.BAD_REQUEST),

    // BORROW / LOAN
    BORROW_NOT_FOUND(404, "Không tìm thấy phiếu mượn", HttpStatus.NOT_FOUND),
    BORROW_ALREADY_RETURNED(400, "Phiếu mượn đã được trả", HttpStatus.BAD_REQUEST),
    COPY_ALREADY_BORROWED(400, "Bản sao sách đang được mượn", HttpStatus.BAD_REQUEST),
    BORROW_RECORD_NOT_UNIQUE(400, "Tìm thấy nhiều phiếu mượn, vui lòng cung cấp barcode để xác định chính xác", HttpStatus.BAD_REQUEST);


    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}