package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "books", indexes = {
    @Index(columnList = "isbn", unique = true),
    @Index(columnList = "title")
})
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String isbn;

    @Column(nullable = false)
    private String title;

    private String genre;

    private Integer publicationYear;

    @Column(columnDefinition = "int default 1")
    private Integer totalCopies = 1;

    @Column(columnDefinition = "int default 1")
    private Integer availableCopies = 1;

    @Column(columnDefinition = "text")
    private String fullText;

    @ManyToMany(mappedBy = "books")
    private List<Author> authors;

    @OneToMany(mappedBy = "book")
    private List<BookCopy> bookCopies;
}
