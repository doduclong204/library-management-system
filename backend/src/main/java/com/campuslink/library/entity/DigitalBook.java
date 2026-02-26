package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Digital_Book")
public class DigitalBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer digitalID;

    @ManyToOne
    @JoinColumn(name = "BookID", nullable = false)
    private Book book;

    private String filePath;

    @Column(columnDefinition = "LONGTEXT")
    private String ocrContent;
}