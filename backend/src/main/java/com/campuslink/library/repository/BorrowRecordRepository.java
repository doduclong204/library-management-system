package com.campuslink.library.repository;

import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.enums.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Integer> {

    List<BorrowRecord> findByStatus(BorrowStatus status);

}