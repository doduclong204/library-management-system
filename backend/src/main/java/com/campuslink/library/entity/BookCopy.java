package com.campuslink.library.entity;

import com.campuslink.library.enums.BookStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "book_copies")
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(unique = true, nullable = false)
    private String barcode;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(20) default 'available'")
    private BookStatus status = BookStatus.available;

    @OneToMany(mappedBy = "bookCopy")
    private List<BorrowRecord> borrowRecords;
}