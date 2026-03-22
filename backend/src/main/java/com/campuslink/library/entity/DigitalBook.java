package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "digital_books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String author;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "ocr_date")
    private LocalDateTime ocrDate;

    @Column(name = "accuracy_percent")
    private Integer accuracyPercent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
