package com.campuslink.library.enums;

/**
 * Trạng thái của một giao dịch thanh toán tiền phạt.
 */
public enum PaymentStatus {
    PENDING,  // Đang chờ thanh toán (QR đã được tạo)
    PAID      // Đã thanh toán (thủ thư đã xác nhận)
}