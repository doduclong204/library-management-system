package com.campuslink.library.entity;

import com.campuslink.library.enums.BorrowStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "borrow_records")
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "patron_id", nullable = false)
    private Patron patron;

    @ManyToOne
    @JoinColumn(name = "book_copy_id", nullable = false)
    private BookCopy bookCopy;

    @ManyToOne
    @JoinColumn(name = "librarian_id")
    private Librarian librarian;

    @Column
    private LocalDate borrowDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate returnDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(20) default 'borrowed'")
    private BorrowStatus status = BorrowStatus.borrowed;

    @Column(columnDefinition = "boolean default false")
    private Boolean reminderSent = false;

    @PrePersist
    public void prePersist() {
        if (this.borrowDate == null) {
            this.borrowDate = LocalDate.now();
        }
        if (this.fineAmount == null) {
            this.fineAmount = BigDecimal.ZERO;
        }
        if (this.reminderSent == null) {
            this.reminderSent = false;
        }
        if (this.status == null) {
            this.status = BorrowStatus.borrowed;
        }
    }
}