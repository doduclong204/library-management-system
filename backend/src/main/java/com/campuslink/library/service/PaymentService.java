package com.campuslink.library.service;

import com.campuslink.library.dto.request.ConfirmPaymentRequest;
import com.campuslink.library.dto.request.CreatePaymentRequest;
import com.campuslink.library.dto.response.CreatePaymentResponse;
import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.entity.Payment;
import com.campuslink.library.enums.PaymentStatus;
import com.campuslink.library.exception.AppException;
import com.campuslink.library.exception.ErrorCode;
import com.campuslink.library.repository.BorrowRecordRepository;
import com.campuslink.library.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String BANK_ID = "BIDV";
    private static final String ACCOUNT_NO = "4711828101";
    private static final String ACCOUNT_NAME = "KHONG THI LINH";
    private static final String TEMPLATE = "compact2";

    private final BorrowRecordRepository borrowRecordRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) {

        if (
                request.getBorrowRecordId() == null &&
                        (request.getBorrowRecordIds() == null || request.getBorrowRecordIds().isEmpty())
        ) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String paymentCode = "FINE-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<BorrowRecord> records;

        if (request.getBorrowRecordIds() != null && !request.getBorrowRecordIds().isEmpty()) {
            records = borrowRecordRepository.findAllById(request.getBorrowRecordIds());
        } else {
            BorrowRecord r = borrowRecordRepository.findById(request.getBorrowRecordId())
                    .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));
            records = List.of(r);
        }

        for (BorrowRecord r : records) {
            if (Boolean.TRUE.equals(r.getFinePaid())) continue;

            if (r.getPaymentCode() != null) {
                throw new RuntimeException("Đang có giao dịch xử lý");
            }

            totalAmount = totalAmount.add(r.getFineAmount());
            r.setPaymentCode(paymentCode);
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Không có khoản phạt nào cần thanh toán");
        }

        borrowRecordRepository.saveAll(records);

        String qr = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                BANK_ID,
                ACCOUNT_NO,
                TEMPLATE,
                totalAmount.longValue(),
                paymentCode,
                ACCOUNT_NAME.replace(" ", "+")
        );

        paymentRepository.save(
                Payment.builder()
                        .paymentCode(paymentCode)
                        .amount(totalAmount)
                        .status(PaymentStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return CreatePaymentResponse.builder()
                .paymentCode(paymentCode)
                .amount(totalAmount)
                .qrUrl(qr)
                .bankName(BANK_ID)
                .accountNumber(ACCOUNT_NO)
                .accountName(ACCOUNT_NAME)
                .build();
    }

    @Transactional
    public void confirmPayment(ConfirmPaymentRequest request) {

        Payment p = paymentRepository.findByPaymentCode(request.getPaymentCode())
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        if (p.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đã thanh toán rồi");
        }

        p.setStatus(PaymentStatus.PAID);
        p.setPaidAt(LocalDateTime.now());
        paymentRepository.save(p);

        List<BorrowRecord> records = borrowRecordRepository.findByPaymentCode(p.getPaymentCode());

        records.forEach(r -> r.setFinePaid(true));
        borrowRecordRepository.saveAll(records);
    }

    @Transactional
    public CreatePaymentResponse createBookPayment(CreatePaymentRequest request) {

        if (
                request.getBorrowRecordId() == null &&
                        (request.getBorrowRecordIds() == null || request.getBorrowRecordIds().isEmpty())
        ) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String paymentCode = "BOOK-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<BorrowRecord> records;

        if (request.getBorrowRecordIds() != null && !request.getBorrowRecordIds().isEmpty()) {
            records = borrowRecordRepository.findAllById(request.getBorrowRecordIds());
        } else {
            BorrowRecord r = borrowRecordRepository.findById(request.getBorrowRecordId())
                    .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));
            records = List.of(r);
        }

        for (BorrowRecord r : records) {
            if (Boolean.TRUE.equals(r.getBookPaid())) continue;

            if (r.getBookPaymentCode() != null) {
                throw new RuntimeException("Đang có giao dịch sách đang xử lý");
            }

            totalAmount = totalAmount.add(r.getBookPrice());
            r.setBookPaymentCode(paymentCode);
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Không có tiền sách nào cần thanh toán");
        }

        borrowRecordRepository.saveAll(records);

        String qr = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                BANK_ID,
                ACCOUNT_NO,
                TEMPLATE,
                totalAmount.longValue(),
                paymentCode,
                ACCOUNT_NAME.replace(" ", "+")
        );

        paymentRepository.save(
                Payment.builder()
                        .paymentCode(paymentCode)
                        .amount(totalAmount)
                        .status(PaymentStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return CreatePaymentResponse.builder()
                .paymentCode(paymentCode)
                .amount(totalAmount)
                .qrUrl(qr)
                .bankName(BANK_ID)
                .accountNumber(ACCOUNT_NO)
                .accountName(ACCOUNT_NAME)
                .build();
    }

    @Transactional
    public void confirmBookPayment(ConfirmPaymentRequest request) {

        Payment p = paymentRepository.findByPaymentCode(request.getPaymentCode())
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        if (p.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đã thanh toán rồi");
        }

        p.setStatus(PaymentStatus.PAID);
        p.setPaidAt(LocalDateTime.now());
        paymentRepository.save(p);

        List<BorrowRecord> records = borrowRecordRepository.findByBookPaymentCode(p.getPaymentCode());
        records.forEach(r -> r.setBookPaid(true));
        borrowRecordRepository.saveAll(records);
    }
}