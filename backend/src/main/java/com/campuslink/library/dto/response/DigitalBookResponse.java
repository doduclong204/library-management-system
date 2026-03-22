package com.campuslink.library.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalBookResponse {
    private Long id;
    private String title;
    private String author;
    private String extractedText;
    private String imagePath;
    private LocalDateTime ocrDate;
    private Integer accuracyPercent;
}
