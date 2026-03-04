package com.campuslink.library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {

    // COMMON
    UNCATEGORIZED_EXCEPTION(500, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(400, "Invalid key", HttpStatus.BAD_REQUEST),

    // AUTHENTICATION
    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_ACCESSTOKEN(400, "Invalid access token", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN(400, "Invalid refresh token", HttpStatus.BAD_REQUEST),
    COOKIES_EMPTY(400, "You don't have refresh token in cookies", HttpStatus.BAD_REQUEST),
    USER_NOT_AUTHENTICATED(401, "User is not authenticated", HttpStatus.UNAUTHORIZED),

    // USER
    USER_EXISTED(409, "User already existed", HttpStatus.CONFLICT),
    USER_NOT_FOUND(404, "User not found", HttpStatus.NOT_FOUND),
    USERNAME_INVALID(400, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(400, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),

    // BOOK
    BOOK_NOT_FOUND(404, "Book not found", HttpStatus.NOT_FOUND),
    BOOK_EXISTED(409, "Book already existed", HttpStatus.CONFLICT),

    // BOOK COPY
    COPY_NOT_FOUND(404, "Book copy not found", HttpStatus.NOT_FOUND),
    COPY_NOT_AVAILABLE(400, "Book copy is not available", HttpStatus.BAD_REQUEST),

    // CATEGORY
    CATEGORY_EXISTED(409, "Category already existed", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(404, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_HAS_BOOKS(400, "Cannot delete category because it has books", HttpStatus.BAD_REQUEST),

    // AUTHOR
    AUTHOR_NOT_FOUND(404, "Author not found", HttpStatus.NOT_FOUND),
    AUTHOR_EXISTED(409, "Author already existed", HttpStatus.CONFLICT),

    // LOAN
    LOAN_NOT_FOUND(404, "Loan not found", HttpStatus.NOT_FOUND),
    LOAN_ALREADY_RETURNED(400, "This loan has already been returned", HttpStatus.BAD_REQUEST),
    COPY_ALREADY_BORROWED(400, "This book copy is already borrowed", HttpStatus.BAD_REQUEST);

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}