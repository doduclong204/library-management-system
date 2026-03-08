package com.campuslink.library.service;

import com.campuslink.library.dto.response.BorrowResponse;
import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.enums.BorrowStatus;
import com.campuslink.library.mapper.BorrowMapper;
import com.campuslink.library.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRepository;
    private final BorrowMapper borrowMapper;

    public List<BorrowResponse> getAllBorrows() {

        return borrowRepository.findAll()
                .stream()
                .map(borrowMapper::toBorrowResponse)
                .toList();
    }

    public List<BorrowResponse> getBorrowsByStatus(BorrowStatus status) {

        return borrowRepository.findByStatus(status)
                .stream()
                .map(borrowMapper::toBorrowResponse)
                .toList();
    }

}
