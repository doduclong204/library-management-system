package com.campuslink.library.dto.response;

import com.campuslink.library.enums.BorrowStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowResponse {

    private Integer id;

    private String patronName;

    private String email;

    private String bookTitle;

    private LocalDate borrowDate;

    private LocalDate dueDate;

    private LocalDate returnDate;

    private BorrowStatus status;

    private BigDecimal fineAmount;

}