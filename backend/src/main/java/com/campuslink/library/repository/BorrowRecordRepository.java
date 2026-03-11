package com.campuslink.library.repository;

import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.enums.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Integer>,  JpaSpecificationExecutor<BorrowRecord> {

    List<BorrowRecord> findByStatus(BorrowStatus status);

}