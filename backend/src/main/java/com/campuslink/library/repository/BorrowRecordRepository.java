package com.campuslink.library.repository;

import com.campuslink.library.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Integer> {
}
