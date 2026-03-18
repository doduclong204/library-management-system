package com.campuslink.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Dữ liệu trả về sau khi tạo QR thành công.
 * Frontend dùng qrUrl để hiển thị ảnh QR code.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponse {

    // Mã giao dịch duy nhất (đưa vào nội dung chuyển khoản)
    private String paymentCode;

    // Số tiền phạt (VND)
    private BigDecimal amount;

    // URL ảnh QR VietQR (dùng trực tiếp trong <img src="...">)
    private String qrUrl;

    // Thông tin người nhận (hiển thị cho thủ thư đối chiếu)
    private String bankName;
    private String accountNumber;
    private String accountName;
}