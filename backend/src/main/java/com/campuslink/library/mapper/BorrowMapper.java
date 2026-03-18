package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.BorrowResponse;
import com.campuslink.library.entity.BorrowRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BorrowMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "borrowDate", source = "borrowDate")
    @Mapping(target = "dueDate", source = "dueDate")
    @Mapping(target = "returnDate", source = "returnDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "fineAmount", source = "fineAmount")
    @Mapping(target = "patronName", source = "patron.fullName")
    @Mapping(target = "email", source = "patron.email")
    @Mapping(target = "bookTitle", source = "bookCopy.book.title")
    @Mapping(target = "sessionId", source = "sessionId")
    BorrowResponse toBorrowResponse(BorrowRecord record);
}