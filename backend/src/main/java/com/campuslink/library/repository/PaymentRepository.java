package com.campuslink.library.repository;

import com.campuslink.library.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository truy vấn bảng payments.
 */
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    // Tìm payment theo mã giao dịch (dùng khi xác nhận thanh toán)
    Optional<Payment> findByPaymentCode(String paymentCode);
}