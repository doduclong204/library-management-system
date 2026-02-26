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
@Table(name = "Librarian")
public class Librarian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer librarianID;

    private String fullName;

    @Column(unique = true)
    private String email;

    @OneToMany(mappedBy = "librarian")
    private List<Loan> loans;
}