package com.campuslink.library.controller;

import com.campuslink.library.dto.request.ReturnBookRequest;
import com.campuslink.library.dto.response.BookReturnSearchResponse;
import com.campuslink.library.dto.response.ReturnBookResponse;
import com.campuslink.library.service.BorrowRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow-records")
@RequiredArgsConstructor
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;

    @GetMapping("/search")
    public ResponseEntity<List<BookReturnSearchResponse>> searchBorrowedBooks(
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String barcode
    ) {
        List<BookReturnSearchResponse> results =
                borrowRecordService.searchBorrowedBooks(isbn, title, barcode);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/return")
    public ResponseEntity<ReturnBookResponse> returnBook(
            @Valid @RequestBody ReturnBookRequest request
    ) {
        ReturnBookResponse response = borrowRecordService.returnBook(request);
        return ResponseEntity.ok(response);
    }
}