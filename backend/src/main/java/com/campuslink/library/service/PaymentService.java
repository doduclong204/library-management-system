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
import java.util.UUID;

/**
 * Service thanh toán tiền phạt — chế độ DEMO.
 *
 * Dùng tài khoản giả + QR VietQR sandbox:
 *   - QR vẫn hiển thị hình ảnh thật (load từ img.vietqr.io)
 *   - Không thể chuyển tiền thật vào tài khoản này
 *   - Thủ thư bấm "Xác nhận" thủ công → hệ thống cập nhật trạng thái
 *
 * Khi có tài khoản thật: chỉ cần đổi 3 hằng số BANK_ID, ACCOUNT_NO, ACCOUNT_NAME.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    // =====================================================
    // DEMO — đổi 3 dòng này khi có tài khoản thật
    private static final String BANK_ID      = "BIDV";
    private static final String ACCOUNT_NO   = "4711828101";
    private static final String ACCOUNT_NAME = "KHONG THI LINH";
    // =====================================================
    private static final String TEMPLATE = "compact2";

    private final BorrowRecordRepository borrowRecordRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Tạo QR thanh toán cho một bản ghi tiền phạt.
     *
     * Luồng:
     *   1. Lấy số tiền phạt từ borrow_record
     *   2. Sinh paymentCode ngẫu nhiên
     *   3. Build URL ảnh QR VietQR (ảnh thật, tài khoản demo)
     *   4. Lưu giao dịch vào DB với status = PENDING
     *   5. Trả về cho frontend
     */
    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) {

        // 1. Lấy borrow_record
        BorrowRecord record = borrowRecordRepository.findById(request.getBorrowRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));

        BigDecimal fineAmount = record.getFineAmount();

        if (fineAmount == null || fineAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Bản ghi này không có tiền phạt.");
        }

        if (Boolean.TRUE.equals(record.getFinePaid())) {
            throw new RuntimeException("Tiền phạt đã được thanh toán trước đó.");
        }

        // 2. Sinh mã giao dịch — ví dụ: "FINE-A3F8"
        String paymentCode = "FINE-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // 3. Build URL QR VietQR
        //
        //    Cách hoạt động của VietQR image API:
        //    https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png
        //      ?amount=15000
        //      &addInfo=FINE-A3F8        <- nội dung chuyển khoản
        //      &accountName=DEMO+THU+VIEN
        //
        //    Với tài khoản demo (ACCOUNT_NO = "0000000000"):
        //      -> Ảnh QR vẫn render bình thường
        //      -> Nếu quét thật sẽ báo "tài khoản không tồn tại" — đúng ý demo
        //
        String qrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s",
                BANK_ID,
                ACCOUNT_NO,
                TEMPLATE,
                fineAmount.longValue(),
                paymentCode,
                ACCOUNT_NAME.replace(" ", "+")
        );

        // 4. Lưu Payment vào DB
        Payment payment = Payment.builder()
                .borrowRecord(record)
                .amount(fineAmount)
                .paymentCode(paymentCode)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 5. Trả kết quả
        return CreatePaymentResponse.builder()
                .paymentCode(paymentCode)
                .amount(fineAmount)
                .qrUrl(qrUrl)
                .bankName(BANK_ID + " (Demo)")
                .accountNumber(ACCOUNT_NO)
                .accountName(ACCOUNT_NAME)
                .build();
    }

    /**
     * Xác nhận thủ thư đã thu tiền.
     * Cập nhật payment.status = PAID và borrowRecord.finePaid = true.
     */
    @Transactional
    public void confirmPayment(ConfirmPaymentRequest request) {

        Payment payment = paymentRepository.findByPaymentCode(request.getPaymentCode())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy giao dịch: " + request.getPaymentCode()));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Giao dịch này đã được xác nhận trước đó.");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        BorrowRecord record = payment.getBorrowRecord();
        record.setFinePaid(true);
        borrowRecordRepository.save(record);
    }
}