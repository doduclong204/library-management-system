package com.campuslink.library.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BorrowRequest {

    private String email;
    private String fullName;
    private String studentId;

    private Integer bookCopyId;
    private Integer librarianId;

    private LocalDate dueDate;

}