package com.campuslink.library.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BorrowRequest {

    private String email;
    private String fullName;
    private String studentId;

    // Hỗ trợ mượn nhiều sách cùng lúc
    private List<Integer> bookCopyIds;

    // Giữ lại để tương thích với code cũ
    private Integer bookCopyId;

    private Integer librarianId;
    private LocalDate dueDate;
}