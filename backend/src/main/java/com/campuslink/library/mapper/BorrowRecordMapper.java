package com.campuslink.library.mapper;

import com.campuslink.library.dto.response.BookReturnSearchResponse;
import com.campuslink.library.dto.response.ReturnBookResponse;
import com.campuslink.library.entity.BorrowRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BorrowRecordMapper {

    @Mapping(target = "borrowRecordId", source = "id")
    @Mapping(target = "isbn", source = "bookCopy.book.isbn")
    @Mapping(target = "bookTitle", source = "bookCopy.book.title")
    @Mapping(target = "imageUrl", source = "bookCopy.book.imageUrl")
    @Mapping(target = "bookCopyId", source = "bookCopy.id")
    @Mapping(target = "barcode", source = "bookCopy.barcode")
    @Mapping(target = "patronName", source = "patron.fullName")
    @Mapping(target = "patronEmail", source = "patron.email")
    @Mapping(target = "studentId", source = "patron.studentId")
    @Mapping(target = "isOverdue", ignore = true)
    @Mapping(target = "overdueDays", ignore = true)
    @Mapping(target = "estimatedFine", ignore = true)
    BookReturnSearchResponse toSearchResponse(BorrowRecord record);

    @Mapping(target = "borrowRecordId", source = "id")
    @Mapping(target = "isbn", source = "bookCopy.book.isbn")
    @Mapping(target = "bookTitle", source = "bookCopy.book.title")
    @Mapping(target = "bookCopyId", source = "bookCopy.id")
    @Mapping(target = "barcode", source = "bookCopy.barcode")
    @Mapping(target = "patronName", source = "patron.fullName")
    @Mapping(target = "patronEmail", source = "patron.email")
    @Mapping(target = "studentId", source = "patron.studentId")
    @Mapping(target = "returnDate", ignore = true)
    @Mapping(target = "overdueDays", ignore = true)
    @Mapping(target = "fineAmount", ignore = true)
    @Mapping(target = "hasFinePending", ignore = true)
    @Mapping(target = "message", ignore = true)
    ReturnBookResponse toReturnResponse(BorrowRecord record);
}