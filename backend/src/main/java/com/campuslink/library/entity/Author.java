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
@Table(name = "Author")
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer authorID;

    @Column(nullable = false)
    private String name;

    private String nationality;

    @OneToMany(mappedBy = "author")
    private List<BookAuthor> bookAuthors;
}