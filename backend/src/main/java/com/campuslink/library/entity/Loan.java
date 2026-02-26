package com.campuslink.library.entity;

import com.campuslink.library.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Loan")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer loanID;

    @ManyToOne
    @JoinColumn(name = "StudentID", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "LibrarianID")
    private User librarian;

    private LocalDate loanDate;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL)
    private List<LoanDetail> loanDetails;

    @OneToOne(mappedBy = "loan", cascade = CascadeType.ALL)
    private ReturnRecord returnRecord;
}