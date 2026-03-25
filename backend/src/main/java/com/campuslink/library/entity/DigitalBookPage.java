package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "digital_book_pages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalBookPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "digital_book_id")
    @ToString.Exclude
    private DigitalBook digitalBook;

    private Integer pageNumber;

    @Column(columnDefinition = "LONGTEXT")
    private String extractedText;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "accuracy_percent")
    private Integer accuracyPercent;
}