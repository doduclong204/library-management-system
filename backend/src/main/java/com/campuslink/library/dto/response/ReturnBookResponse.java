package com.campuslink.library.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnBookResponse {

    private Integer borrowRecordId;
    private String isbn;
    private String bookTitle;
    private Integer bookCopyId;
    private String barcode;
    private String patronName;
    private String patronEmail;
    private String studentId;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private long overdueDays;
    private BigDecimal fineAmount;
    private boolean hasFinePending;
    private String message;
}