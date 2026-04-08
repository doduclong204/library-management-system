package com.campuslink.library.dto.request;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDigitalBookRequest {
    private String title;
    private String author;
    private List<PageUpdate> pages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PageUpdate {
        private Integer pageNumber;
        private String extractedText;
    }
}