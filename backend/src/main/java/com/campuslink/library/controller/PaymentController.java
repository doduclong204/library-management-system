package com.campuslink.library.controller;

import com.campuslink.library.dto.request.ConfirmPaymentRequest;
import com.campuslink.library.dto.request.CreatePaymentRequest;
import com.campuslink.library.dto.response.CreatePaymentResponse;
import com.campuslink.library.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API thanh toán tiền phạt.
 *
 * Các endpoint:
 *   POST /payments/create  → Tạo QR thanh toán
 *   POST /payments/confirm → Xác nhận đã thanh toán
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Tạo QR thanh toán cho bản ghi tiền phạt.
     *
     * Request body:
     * {
     *   "borrowRecordId": 123
     * }
     *
     * Response:
     * {
     *   "paymentCode": "FINE-A3F8",
     *   "amount": 15000,
     *   "qrUrl": "https://img.vietqr.io/...",
     *   "bankName": "MB",
     *   "accountNumber": "0123456789",
     *   "accountName": "THU VIEN CAMPUSLINK"
     * }
     */
    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponse> createPayment(
            @RequestBody CreatePaymentRequest request
    ) {
        CreatePaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Thủ thư xác nhận đã thu tiền — cập nhật trạng thái PAID.
     *
     * Request body:
     * {
     *   "paymentCode": "FINE-A3F8"
     * }
     *
     * Response: 204 No Content (không có body)
     */
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(
            @RequestBody ConfirmPaymentRequest request
    ) {
        paymentService.confirmPayment(request);
        return ResponseEntity.noContent().build();
    }
}