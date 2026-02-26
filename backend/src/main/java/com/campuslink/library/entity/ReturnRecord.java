package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Return_Record")
public class ReturnRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer returnID;

    @OneToOne
    @JoinColumn(name = "LoanID", nullable = false)
    private Loan loan;

    private LocalDate returnDate;

    private Double fineAmount;
}