package com.campuslink.library.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookReturnSearchResponse {

    private Integer borrowRecordId;
    private String isbn;
    private String bookTitle;
    private String imageUrl;
    private Integer bookCopyId;
    private String barcode;
    private String patronName;
    private String patronEmail;
    private String studentId;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private boolean isOverdue;
    private long overdueDays;
    private BigDecimal estimatedFine;
}