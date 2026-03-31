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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BorrowRecordService {

    private static final BigDecimal FINE_RATE_PER_DAY = new BigDecimal("0.20");
    private static final long EARLY_RETURN_THRESHOLD_DAYS = 14;

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
            response.setEstimatedFine(calculateFine(record.getDueDate(), LocalDate.now(), record.getBookPrice()));
            return response;
        }).toList();
    }

    @Transactional
    public ReturnBookResponse returnBook(ReturnBookRequest request) {
        if (request.getIsbn() == null && request.getTitle() == null && request.getBarcode() == null && request.getSessionId() == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        List<BorrowRecord> records;
        if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            records = borrowRecordRepository.findBySessionIdAndStatusIn(
                    request.getSessionId(), List.of(BorrowStatus.borrowed, BorrowStatus.overdue));
        } else {
            records = borrowRecordRepository.findAll(buildSearchSpec(request.getIsbn(), request.getTitle(), request.getBarcode()));
            if (records.size() > 1) {
                throw new AppException(ErrorCode.BORROW_RECORD_NOT_UNIQUE);
            }
        }

        if (records.isEmpty()) {
            throw new AppException(ErrorCode.BORROW_NOT_FOUND);
        }

        String paymentCode = "FINE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDate returnDate = request.getReturnDate() != null ? request.getReturnDate() : LocalDate.now();
        BigDecimal totalFine = BigDecimal.ZERO;

        for (BorrowRecord record : records) {
            if (record.getStatus() == BorrowStatus.returned) continue;

            BigDecimal fineAmount = calculateFine(record.getDueDate(), returnDate, record.getBookPrice());
            long overdueDays = Math.max(0, ChronoUnit.DAYS.between(record.getDueDate(), returnDate));

            record.setReturnDate(returnDate);
            record.setFineAmount(fineAmount);
            record.setFinePaid(false);
            record.setPaymentCode(paymentCode);
            record.setStatus(BorrowStatus.returned);

            long daysBeforeDue = ChronoUnit.DAYS.between(returnDate, record.getDueDate());
            BigDecimal refundAmount = BigDecimal.ZERO;
            long earlyDays = 0;

            if (daysBeforeDue > 0) {
                earlyDays = Math.min(daysBeforeDue, EARLY_RETURN_THRESHOLD_DAYS);
                refundAmount = record.getBookPrice()
                        .multiply(BigDecimal.valueOf(earlyDays))
                        .divide(BigDecimal.valueOf(EARLY_RETURN_THRESHOLD_DAYS), 0, RoundingMode.FLOOR);

                if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                    record.setBookPrice(refundAmount);
                    record.setBookPaid(false);
                } else {
                    record.setBookPrice(BigDecimal.ZERO);
                    record.setBookPaid(true);
                }
            } else {
                record.setBookPrice(BigDecimal.ZERO);
                record.setBookPaid(true);
            }

            totalFine = totalFine.add(fineAmount);

            BookCopy bookCopy = record.getBookCopy();
            bookCopy.setStatus(BookStatus.available);
            bookCopyRepository.save(bookCopy);

            var book = bookCopy.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);

            borrowRecordRepository.save(record);
        }

        ReturnBookResponse response = new ReturnBookResponse();
        response.setPaymentCode(paymentCode);
        response.setReturnDate(returnDate);
        response.setFineAmount(totalFine);
        response.setHasFinePending(totalFine.compareTo(BigDecimal.ZERO) > 0);
        response.setMessage(totalFine.compareTo(BigDecimal.ZERO) > 0
                ? String.format("Quá hạn. Tổng tiền phạt: %,dđ", totalFine.longValue())
                : "Trả sách thành công.");
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

    private BigDecimal calculateFine(LocalDate dueDate, LocalDate returnDate, BigDecimal bookPrice) {
        long overdueDays = Math.max(0, ChronoUnit.DAYS.between(dueDate, returnDate));
        if (overdueDays == 0) return BigDecimal.ZERO;

        BigDecimal price = bookPrice != null ? bookPrice : BigDecimal.ZERO;
        return price
                .multiply(FINE_RATE_PER_DAY)
                .multiply(BigDecimal.valueOf(overdueDays))
                .setScale(0, RoundingMode.CEILING);
    }

    public List<BookReturnSearchResponse> getOverdueRecords() {
        List<BorrowRecord> records = borrowRecordRepository
                .findByStatusAndFineAmountGreaterThanAndFinePaidFalse(BorrowStatus.returned, BigDecimal.ZERO);

        return records.stream().map(record -> {
            BookReturnSearchResponse response = borrowRecordMapper.toSearchResponse(record);
            long overdueDays = Math.max(0, ChronoUnit.DAYS.between(
                    record.getDueDate(), record.getReturnDate()));
            response.setOverdueDays(overdueDays);
            response.setOverdue(true);
            response.setEstimatedFine(record.getFineAmount());
            response.setPaymentCode(record.getPaymentCode());
            response.setSessionId(record.getSessionId());
            return response;
        }).toList();
    }

    public List<BookReturnSearchResponse> getPaidRecords() {
        List<BorrowRecord> records = borrowRecordRepository
                .findByStatusAndFineAmountGreaterThanAndFinePaidTrue(BorrowStatus.returned, BigDecimal.ZERO);

        return records.stream().map(record -> {
            BookReturnSearchResponse response = borrowRecordMapper.toSearchResponse(record);
            long overdueDays = Math.max(0, ChronoUnit.DAYS.between(
                    record.getDueDate(), record.getReturnDate()));
            response.setOverdueDays(overdueDays);
            response.setOverdue(true);
            response.setEstimatedFine(record.getFineAmount());
            response.setPaymentCode(record.getPaymentCode());
            response.setSessionId(record.getSessionId());
            return response;
        }).toList();
    }

    public BigDecimal getTotalPaidFines() {
        return borrowRecordRepository.sumPaidFines();
    }

    @Transactional
    public void payFine(Integer id) {
        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));

        if (Boolean.TRUE.equals(record.getFinePaid())) {
            throw new AppException(ErrorCode.FINE_ALREADY_PAID);
        }

        record.setFinePaid(true);
        borrowRecordRepository.save(record);
    }

    public List<BookReturnSearchResponse> getPendingRefunds() {
        List<BorrowRecord> records = borrowRecordRepository
                .findByStatusAndBookPriceGreaterThanAndBookPaidFalse(BorrowStatus.returned, BigDecimal.ZERO);

        return records.stream().map(record -> {
            BookReturnSearchResponse response = borrowRecordMapper.toSearchResponse(record);
            long earlyDays = Math.max(0, ChronoUnit.DAYS.between(
                    record.getReturnDate(), record.getDueDate()));
            response.setRefundAmount(record.getBookPrice());
            response.setEarlyDays(earlyDays);
            response.setBookPaid(false);
            return response;
        }).toList();
    }

    @Transactional
    public void confirmRefund(Integer id) {
        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BORROW_NOT_FOUND));

        if (Boolean.TRUE.equals(record.getBookPaid())) {
            throw new RuntimeException("Đã xác nhận hoàn tiền rồi");
        }

        record.setBookPaid(true);
        borrowRecordRepository.save(record);
    }
}