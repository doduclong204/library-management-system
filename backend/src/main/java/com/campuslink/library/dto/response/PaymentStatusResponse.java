package com.campuslink.library.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentStatusResponse {
    private String paymentCode;
    private String status;
    private boolean paid;
    private LocalDateTime paidAt;
}