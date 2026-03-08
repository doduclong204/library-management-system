package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.BorrowResponse;
import com.campuslink.library.entity.BorrowRecord;

public class BorrowMapper {

    public static BorrowResponse toResponse(BorrowRecord record) {

        return BorrowResponse.builder()
                .borrowId(record.getId())
                .patronName(record.getPatron().getFullName())
                .patronEmail(record.getPatron().getEmail())
                .bookCopyId(record.getBookCopy().getId())
                .borrowDate(record.getBorrowDate())
                .dueDate(record.getDueDate())
                .status(record.getStatus().name())
                .fineAmount(record.getFineAmount())
                .build();

    }

}