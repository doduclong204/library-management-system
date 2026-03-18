package com.campuslink.library.entity;

import com.campuslink.library.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity lưu thông tin thanh toán tiền phạt.
 * Mỗi lần thủ thư tạo QR để thu tiền phạt sẽ sinh 1 bản ghi Payment.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết tới bản ghi mượn sách bị phạt
    @ManyToOne
    @JoinColumn(name = "borrow_record_id", nullable = false)
    private BorrowRecord borrowRecord;

    // Số tiền phạt cần thanh toán
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * Mã giao dịch duy nhất — được đưa vào nội dung chuyển khoản (addInfo).
     * Thủ thư dùng mã này để đối chiếu khi xác nhận.
     */
    @Column(nullable = false, unique = true)
    private String paymentCode;

    // Trạng thái: PENDING (chờ thanh toán) hoặc PAID (đã thanh toán)
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(20) default 'PENDING'")
    private PaymentStatus status = PaymentStatus.PENDING;

    // Thời điểm tạo QR
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Thời điểm xác nhận thanh toán (null nếu chưa thanh toán)
    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = PaymentStatus.PENDING;
    }
}