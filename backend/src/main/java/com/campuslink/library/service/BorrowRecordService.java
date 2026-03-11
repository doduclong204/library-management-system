package com.campuslink.library.service;

import com.campuslink.library.dto.request.ReturnBookRequest;
import com.campuslink.library.dto.response.BookReturnSearchResponse;
import com.campuslink.library.dto.response.ReturnBookResponse;
import com.campuslink.library.entity.BookCopy;
import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.enums.BookStatus;
import com.campuslink.library.enums.BorrowStatus;
import com.campuslink.library.exception.AppException;
import com.campuslink.library.exception.ErrorCode;
import com.campuslink.library.mapper.BorrowRecordMapper;
import com.campuslink.library.repository.BookCopyRepository;
import com.campuslink.library.repository.BookRepository;
import com.campuslink.library.repository.BorrowRecordRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowRecordService {

    private static final BigDecimal FINE_PER_DAY = new BigDecimal("5000");

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordMapper borrowRecordMapper;

    public List<BookReturnSearchResponse> searchBorrowedBooks(String isbn, String title, String barcode) {
        if (isbn == null && title == null && barcode == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        List<BorrowRecord> records = borrowRecordRepository.findAll(buildSearchSpec(isbn, title, barcode));

        if (records.isEmpty()) {
            return List.of();
        }

        return records.stream().map(record -> {
            BookReturnSearchResponse response = borrowRecordMapper.toSearchResponse(record);
            long overdueDays = Math.max(0, ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now()));
            response.setOverdueDays(overdueDays);
            response.setOverdue(overdueDays > 0);
            response.setEstimatedFine(calculateFine(record.getDueDate(), LocalDate.now()));
            return response;
        }).toList();
    }

    @Transactional
    public ReturnBookResponse returnBook(ReturnBookRequest request) {
        if (request.getIsbn() == null && request.getTitle() == null && request.getBarcode() == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        List<BorrowRecord> records = borrowRecordRepository
                .findAll(buildSearchSpec(request.getIsbn(), request.getTitle(), request.getBarcode()));

        if (records.isEmpty()) {
            throw new AppException(ErrorCode.BORROW_NOT_FOUND);
        }

        if (records.size() > 1) {
            throw new AppException(ErrorCode.BORROW_RECORD_NOT_UNIQUE);
        }

        BorrowRecord record = records.get(0);

        if (record.getStatus() == BorrowStatus.returned) {
            throw new AppException(ErrorCode.BORROW_ALREADY_RETURNED);
        }

        LocalDate returnDate = request.getReturnDate() != null ? request.getReturnDate() : LocalDate.now();
        BigDecimal fineAmount = calculateFine(record.getDueDate(), returnDate);
        long overdueDays = Math.max(0, ChronoUnit.DAYS.between(record.getDueDate(), returnDate));

        record.setReturnDate(returnDate);
        record.setFineAmount(fineAmount);
        record.setStatus(BorrowStatus.returned);
        borrowRecordRepository.save(record);

        BookCopy bookCopy = record.getBookCopy();
        bookCopy.setStatus(BookStatus.available);
        bookCopyRepository.save(bookCopy);

        var book = bookCopy.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        ReturnBookResponse response = borrowRecordMapper.toReturnResponse(record);
        response.setReturnDate(returnDate);
        response.setOverdueDays(overdueDays);
        response.setFineAmount(fineAmount);
        response.setHasFinePending(fineAmount.compareTo(BigDecimal.ZERO) > 0);
        response.setMessage(buildReturnMessage(fineAmount, overdueDays));
        return response;
    }

    private Specification<BorrowRecord> buildSearchSpec(String isbn, String title, String barcode) {
        return (root, query, cb) -> {
            Join<Object, Object> bookCopyJoin = root.join("bookCopy", JoinType.INNER);
            Join<Object, Object> bookJoin = bookCopyJoin.join("book", JoinType.INNER);

            Predicate activeCondition = root.get("status").in(BorrowStatus.borrowed, BorrowStatus.overdue);

            List<Predicate> searchConditions = new ArrayList<>();
            if (isbn != null) {
                searchConditions.add(cb.equal(bookJoin.get("isbn"), isbn));
            }
            if (title != null) {
                searchConditions.add(cb.like(cb.lower(bookJoin.get("title")),
                        "%" + title.toLowerCase() + "%"));
            }
            if (barcode != null) {
                searchConditions.add(cb.equal(bookCopyJoin.get("barcode"), barcode));
            }

            Predicate searchCondition = cb.or(searchConditions.toArray(new Predicate[0]));

            return cb.and(activeCondition, searchCondition);
        };
    }

    private BigDecimal calculateFine(LocalDate dueDate, LocalDate returnDate) {
        long overdueDays = ChronoUnit.DAYS.between(dueDate, returnDate);
        if (overdueDays <= 0) return BigDecimal.ZERO;
        return FINE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));
    }

    private String buildReturnMessage(BigDecimal fineAmount, long overdueDays) {
        if (fineAmount.compareTo(BigDecimal.ZERO) == 0) {
            return "Trả sách thành công. Không có phí phạt.";
        }
        return String.format(
                "Trả sách thành công. Quá hạn %d ngày. Phí phạt: %,.0f đ (chưa thanh toán).",
                overdueDays, fineAmount
        );
    }
}