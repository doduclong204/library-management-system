package com.campuslink.library.repository;

import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.enums.BorrowStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Integer>,
        JpaSpecificationExecutor<BorrowRecord> {

    List<BorrowRecord> findByStatus(BorrowStatus status);

    List<BorrowRecord> findByStatusInAndDueDateBefore(List<BorrowStatus> statuses, LocalDate date);

    List<BorrowRecord> findByStatusAndFineAmountGreaterThanAndFinePaidFalse(
            BorrowStatus status, BigDecimal fineAmount);

    List<BorrowRecord> findByStatusAndFineAmountGreaterThanAndFinePaidTrue(
            BorrowStatus status, BigDecimal fineAmount);

    @Query("SELECT COALESCE(SUM(b.fineAmount), 0) FROM BorrowRecord b WHERE b.finePaid = true")
    BigDecimal sumPaidFines();

    @EntityGraph(attributePaths = {
            "patron",
            "bookCopy",
            "bookCopy.book"
    })
    List<BorrowRecord> findByDueDateAndStatusAndReminderSent(
            LocalDate dueDate,
            BorrowStatus status,
            Boolean reminderSent
    );
}