package com.campuslink.library.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BorrowResponse {

    private Integer borrowId;

    private String patronName;
    private String patronEmail;

    private Integer bookCopyId;

    private LocalDate borrowDate;
    private LocalDate dueDate;

    private String status;

    private BigDecimal fineAmount;

}