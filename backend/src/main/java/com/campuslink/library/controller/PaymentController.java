package com.campuslink.library.controller;

import com.campuslink.library.dto.request.ConfirmPaymentRequest;
import com.campuslink.library.dto.request.CreatePaymentRequest;
import com.campuslink.library.dto.response.CreatePaymentResponse;
import com.campuslink.library.dto.response.PaymentStatusResponse;
import com.campuslink.library.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(@RequestBody ConfirmPaymentRequest request) {
        paymentService.confirmPayment(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/book/create")
    public ResponseEntity<CreatePaymentResponse> createBookPayment(@RequestBody CreatePaymentRequest request) {
        return ResponseEntity.ok(paymentService.createBookPayment(request));
    }

    @PostMapping("/book/confirm")
    public ResponseEntity<Void> confirmBookPayment(@RequestBody ConfirmPaymentRequest request) {
        paymentService.confirmBookPayment(request);
        return ResponseEntity.noContent().build();
    }

    // webhook/sepay đã xóa — SepayWebhookFilter xử lý ở /api/webhook/sepay

    @GetMapping("/status/{paymentCode}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable String paymentCode) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(paymentCode));
    }
}