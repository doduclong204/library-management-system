package com.campuslink.library.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookAuthorId implements Serializable {

    private Integer book;
    private Integer author;
}