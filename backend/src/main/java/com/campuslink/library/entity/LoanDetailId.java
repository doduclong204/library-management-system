package com.campuslink.library.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanDetailId implements Serializable {

    private Integer loan;
    private Integer bookCopy;
}