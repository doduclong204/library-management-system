package com.campuslink.library.dto.response;

import com.campuslink.library.enums.BorrowStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("userName")
    private String patronName;

    private String email;

    private String bookTitle;

    private LocalDate borrowDate;

    private LocalDate dueDate;

    private LocalDate returnDate;

    private BorrowStatus status;

    @JsonProperty("fine")
    private BigDecimal fineAmount;

}