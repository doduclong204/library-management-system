package com.campuslink.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Book_Author")
@IdClass(BookAuthorId.class)
public class BookAuthor {

    @Id
    @ManyToOne
    @JoinColumn(name = "BookID")
    private Book book;

    @Id
    @ManyToOne
    @JoinColumn(name = "AuthorID")
    private Author author;
}