package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "ocr_date")
    private LocalDateTime ocrDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "digitalBook", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DigitalBookPage> pages = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (ocrDate == null) ocrDate = LocalDateTime.now();
    }
}