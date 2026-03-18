package com.campuslink.library.dto.request;

import lombok.Data;

/**
 * Request body khi tạo QR thanh toán.
 * Thủ thư truyền vào ID của bản ghi mượn sách bị phạt.
 */
@Data
public class CreatePaymentRequest {

    // ID của borrow_record cần thanh toán tiền phạt
    private Integer borrowRecordId;
}