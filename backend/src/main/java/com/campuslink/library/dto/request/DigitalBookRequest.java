package com.campuslink.library.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalBookRequest {
    private String title;
    private String author;
}
