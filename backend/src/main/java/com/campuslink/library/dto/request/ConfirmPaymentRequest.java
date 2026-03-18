package com.campuslink.library.dto.request;

import lombok.Data;

/**
 * Request body khi thủ thư bấm "Xác nhận đã thanh toán".
 */
@Data
public class ConfirmPaymentRequest {

    // Mã giao dịch được sinh ra khi tạo QR
    private String paymentCode;
}