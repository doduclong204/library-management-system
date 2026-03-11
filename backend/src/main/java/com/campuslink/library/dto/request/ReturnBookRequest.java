package com.campuslink.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnBookRequest {

    private String isbn;
    private String title;
    private String barcode;

    @NotNull(message = "Ngày trả không được để trống")
    private LocalDate returnDate;
}