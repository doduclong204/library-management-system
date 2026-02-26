package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Loan_Detail")
@IdClass(LoanDetailId.class)
public class LoanDetail {

    @Id
    @ManyToOne
    @JoinColumn(name = "LoanID")
    private Loan loan;

    @Id
    @ManyToOne
    @JoinColumn(name = "CopyID")
    private BookCopy bookCopy;
}