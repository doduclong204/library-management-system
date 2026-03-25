package com.campuslink.library.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalBookResponse {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime ocrDate;
    private List<PageDto> pages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PageDto {
        private Integer pageNumber;
        private String extractedText;
        private String imagePath;
        private Integer accuracyPercent;
    }
}