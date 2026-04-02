package com.campuslink.library.service;

import com.campuslink.library.dto.request.ConfirmPaymentRequest;
import com.campuslink.library.dto.request.CreatePaymentRequest;
import com.campuslink.library.dto.request.SepayWebhookRequest;
import com.campuslink.library.dto.response.CreatePaymentResponse;
import com.campuslink.library.dto.response.PaymentStatusResponse;
import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.entity.Payment;
import com.campuslink.library.enums.PaymentStatus;
import com.campuslink.library.exception.AppException;
import com.campuslink.library.exception.ErrorCode;
import com.campuslink.library.repository.BorrowRecordRepository;
import com.campuslink.library.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String BANK_ID = "970422";
    private static final String ACCOUNT_NO = "0372555040";
    private static final String ACCOUNT_NAME = "NGUYEN ANH QUAN";
    private static final String TEMPLATE = "compact2";

    private final BorrowRecordRepository borrowRecordRepository;
    private final PaymentRepository paymentRepository;

    // ───────────────────────────── FINE PAYMENT ─────────────────────────────

    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) {
        if (request.getBorrowRecordId() == null &&
                (request.getBorrowRecordIds() == null || request.getBorrowRecordIds().isEmpty())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String paymentCode = "FINE-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<BorrowRecord> records = resolveRecords(request);

        for (BorrowRecord r : records) {
            if (Boolean.TRUE.equals(r.getFinePaid())) continue;

            if (r.getPaymentCode() != null) {
                boolean stillPending = paymentRepository
                        .findByPaymentCode(r.getPaymentCode())
                        .map(p -> p.getStatus() == PaymentStatus.PENDING)
                        .orElse(false);
                if (stillPending) throw new AppException(ErrorCode.PAYMENT_IN_PROGRESS);
                r.setPaymentCode(null);
            }

            totalAmount = totalAmount.add(r.getFineAmount());
            r.setPaymentCode(paymentCode);
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0)
            throw new AppException(ErrorCode.NO_FINE_TO_PAY);

        borrowRecordRepository.saveAll(records);
        paymentRepository.save(buildPayment(paymentCode, totalAmount));

        return buildResponse(paymentCode, totalAmount);
    }

    @Transactional
    public void confirmPayment(ConfirmPaymentRequest request) {
        Payment p = paymentRepository.findByPaymentCode(request.getPaymentCode())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (p.getStatus() == PaymentStatus.PAID)
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);

        markAsPaid(p);
        List<BorrowRecord> records = borrowRecordRepository.findByPaymentCode(p.getPaymentCode());
        records.forEach(r -> r.setFinePaid(true));
        borrowRecordRepository.saveAll(records);
    }

    // ───────────────────────────── BOOK PAYMENT ─────────────────────────────

    @Transactional
    public CreatePaymentResponse createBookPayment(CreatePaymentRequest request) {
        if (request.getBorrowRecordId() == null &&
                (request.getBorrowRecordIds() == null || request.getBorrowRecordIds().isEmpty())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String paymentCode = "BOOK-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<BorrowRecord> records = resolveRecords(request);

        for (BorrowRecord r : records) {
            if (Boolean.TRUE.equals(r.getBookPaid())) continue;

            if (r.getBookPaymentCode() != null) {
                boolean stillPending = paymentRepository
                        .findByPaymentCode(r.getBookPaymentCode())
                        .map(p -> p.getStatus() == PaymentStatus.PENDING)
                        .orElse(false);
                if (stillPending) throw new AppException(ErrorCode.BOOK_PAYMENT_IN_PROGRESS);
                r.setBookPaymentCode(null);
            }

            totalAmount = totalAmount.add(r.getBookPrice());
            r.setBookPaymentCode(paymentCode);
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0)
            throw new AppException(ErrorCode.NO_BOOK_TO_PAY);

        borrowRecordRepository.saveAll(records);
        paymentRepository.save(buildPayment(paymentCode, totalAmount));

        return buildResponse(paymentCode, totalAmount);
    }

    @Transactional
    public void confirmBookPayment(ConfirmPaymentRequest request) {
        Payment p = paymentRepository.findByPaymentCode(request.getPaymentCode())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (p.getStatus() == PaymentStatus.PAID)
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);

        markAsPaid(p);
        List<BorrowRecord> records = borrowRecordRepository.findByBookPaymentCode(p.getPaymentCode());
        records.forEach(r -> r.setBookPaid(true));
        borrowRecordRepository.saveAll(records);
    }

    // ───────────────────────────── SEPAY WEBHOOK ─────────────────────────────

    @Transactional
    public void handleSepayWebhook(SepayWebhookRequest request) {
        String content = request.getContent();
        if (content == null) {
            log.warn("[SePay] content rỗng, bỏ qua");
            return;
        }

        String paymentCode = extractPaymentCode(content);
        if (paymentCode == null) {
            log.warn("[SePay] không tìm thấy paymentCode trong '{}'", content);
            return;
        }

        log.info("[SePay] Xử lý paymentCode='{}'", paymentCode);

        Payment payment = paymentRepository.findByPaymentCode(paymentCode).orElse(null);
        if (payment == null) {
            log.warn("[SePay] không tìm thấy payment với code '{}'", paymentCode);
            return;
        }

        if (payment.getStatus() == PaymentStatus.PAID) {
            log.info("[SePay] payment '{}' đã PAID trước đó, bỏ qua", paymentCode);
            return;
        }

        // Kiểm tra số tiền (bỏ comment nếu muốn bật strict check)
        BigDecimal transferAmount = request.getTransferAmount();
        if (transferAmount != null && transferAmount.compareTo(payment.getAmount()) != 0) {
            log.warn("[SePay] số tiền không khớp — expected={} got={}", payment.getAmount(), transferAmount);
            return;
        }

        markAsPaid(payment);

        if (paymentCode.startsWith("FINE-")) {
            List<BorrowRecord> records = borrowRecordRepository.findByPaymentCode(paymentCode);
            records.forEach(r -> r.setFinePaid(true));
            borrowRecordRepository.saveAll(records);
            log.info("[SePay] FINE '{}' xác nhận thành công ✅", paymentCode);

        } else if (paymentCode.startsWith("BOOK-")) {
            List<BorrowRecord> records = borrowRecordRepository.findByBookPaymentCode(paymentCode);
            records.forEach(r -> r.setBookPaid(true));
            borrowRecordRepository.saveAll(records);
            log.info("[SePay] BOOK '{}' xác nhận thành công ✅", paymentCode);
        }
    }

    // ───────────────────────────── POLLING STATUS ─────────────────────────────

    public PaymentStatusResponse getPaymentStatus(String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return PaymentStatusResponse.builder()
                .paymentCode(paymentCode)
                .status(payment.getStatus().name())
                .paid(payment.getStatus() == PaymentStatus.PAID)
                .paidAt(payment.getPaidAt())
                .build();
    }

    // ───────────────────────────── PRIVATE HELPERS ─────────────────────────────

    private List<BorrowRecord> resolveRecords(CreatePaymentRequest request) {
        if (request.getBorrowRecordIds() != null && !request.getBorrowRecordIds().isEmpty()) {
            return borrowRecordRepository.findAllById(request.getBorrowRecordIds());
        }
        BorrowRecord r = borrowRecordRepository.findById(request.getBorrowRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));
        return List.of(r);
    }

    private Payment buildPayment(String paymentCode, BigDecimal amount) {
        return Payment.builder()
                .paymentCode(paymentCode)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private CreatePaymentResponse buildResponse(String paymentCode, BigDecimal amount) {
        return CreatePaymentResponse.builder()
                .paymentCode(paymentCode)
                .amount(amount)
                .qrUrl(buildQrUrl(amount, paymentCode))
                .bankName(BANK_ID)
                .accountNumber(ACCOUNT_NO)
                .accountName(ACCOUNT_NAME)
                .build();
    }

    private void markAsPaid(Payment payment) {
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    private String extractPaymentCode(String content) {
        String upper = content.toUpperCase();

        // Format chuẩn: FINE-XXXX hoặc BOOK-XXXX
        java.util.regex.Matcher m1 = java.util.regex.Pattern
                .compile("(FINE|BOOK)-[A-Z0-9]{4}")
                .matcher(upper);
        if (m1.find()) return m1.group();

        // SePay bỏ dấu gạch ngang: FINEXXX hoặc BOOKXXXX
        java.util.regex.Matcher m2 = java.util.regex.Pattern
                .compile("(FINE|BOOK)([A-Z0-9]{4})")
                .matcher(upper);
        if (m2.find()) return m2.group(1) + "-" + m2.group(2);

        return null;
    }

    private String buildQrUrl(BigDecimal amount, String paymentCode) {
        return String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                BANK_ID, ACCOUNT_NO, TEMPLATE,
                amount.longValue(),
                paymentCode,
                ACCOUNT_NAME.replace(" ", "+")
        );
    }
}