package com.campuslink.library.exception;

import java.text.ParseException;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.campuslink.library.dto.response.api.ApiResponse;

import jakarta.validation.ConstraintViolation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";

    // ── AppException (dùng ErrorCode) ──────────────────────────────────
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .statusCode(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    // ── AccessDeniedException (403) ────────────────────────────────────
    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .statusCode(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    // ── ParseException (JWT parse error) ───────────────────────────────
    @ExceptionHandler(value = ParseException.class)
    ResponseEntity<ApiResponse<?>> handlingJwtException(ParseException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .statusCode(errorCode.getCode())
                        .message(exception.getMessage())
                        .build());
    }

    // ── HttpRequestMethodNotSupportedException (405) ───────────────────
    @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiResponse<?>> handlingMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        return ResponseEntity.status(405)
                .body(ApiResponse.builder()
                        .statusCode(405)
                        .message("Method " + exception.getMethod() + " không được hỗ trợ")
                        .error("METHOD_NOT_ALLOWED")
                        .build());
    }

    // ── Validation (MethodArgumentNotValidException) ───────────────────
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException exception) {
        // Thử map message sang ErrorCode enum
        String enumKey = null;
        FieldError fieldError = exception.getFieldError();
        if (fieldError != null) {
            String defaultMessage = fieldError.getDefaultMessage();
            if (defaultMessage != null && defaultMessage.startsWith("must match")) {
                enumKey = "INVALID_PHONE_NUMBER";
            } else {
                enumKey = defaultMessage;
            }
        }

        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;

        try {
            if (enumKey != null) {
                errorCode = ErrorCode.valueOf(enumKey);
            }

            var constraintViolation = exception.getBindingResult().getAllErrors().getFirst()
                    .unwrap(ConstraintViolation.class);
            attributes = constraintViolation.getConstraintDescriptor().getAttributes();
            log.info(attributes.toString());
        } catch (IllegalArgumentException e) {
            // enumKey không match ErrorCode → dùng message gốc từ validation
            String message = exception.getBindingResult().getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));

            return ResponseEntity.badRequest()
                    .body(ApiResponse.builder()
                            .statusCode(400)
                            .message(message)
                            .error("VALIDATION_ERROR")
                            .build());
        }

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .statusCode(errorCode.getCode())
                .message(Objects.nonNull(attributes)
                        ? mapAttribute(errorCode.getMessage(), attributes)
                        : errorCode.getMessage())
                .build();

        return ResponseEntity.badRequest().body(apiResponse);
    }

    // ── Catch-all Exception (500) ──────────────────────────────────────
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handlingException(Exception exception) {
        log.error("Unhandled exception: ", exception);

        return ResponseEntity.internalServerError()
                .body(ApiResponse.builder()
                        .statusCode(500)
                        .message("Lỗi hệ thống: " + exception.getMessage())
                        .error("INTERNAL_SERVER_ERROR")
                        .build());
    }

    // ── Helper ─────────────────────────────────────────────────────────
    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
