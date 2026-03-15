package com.campuslink.library.controller;

import com.campuslink.library.dto.request.ReturnBookRequest;
import com.campuslink.library.dto.response.BookReturnSearchResponse;
import com.campuslink.library.dto.response.ReturnBookResponse;
import com.campuslink.library.service.BorrowRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/borrow-records")
@RequiredArgsConstructor
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;

    @PatchMapping("/{id}/pay-fine")
    public ResponseEntity<Void> payFine(@PathVariable Integer id) {
        borrowRecordService.payFine(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookReturnSearchResponse>> searchBorrowedBooks(
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String barcode
    ) {
        return ResponseEntity.ok(borrowRecordService.searchBorrowedBooks(isbn, title, barcode));
    }

    @PostMapping("/return")
    public ResponseEntity<ReturnBookResponse> returnBook(
            @Valid @RequestBody ReturnBookRequest request
    ) {
        return ResponseEntity.ok(borrowRecordService.returnBook(request));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BookReturnSearchResponse>> getOverdueRecords() {
        return ResponseEntity.ok(borrowRecordService.getOverdueRecords());
    }

    @GetMapping("/fine-paid-list")
    public ResponseEntity<List<BookReturnSearchResponse>> getPaidRecords() {
        return ResponseEntity.ok(borrowRecordService.getPaidRecords());
    }

    @GetMapping("/fine-paid-total")
    public ResponseEntity<BigDecimal> getPaidTotal() {
        return ResponseEntity.ok(borrowRecordService.getTotalPaidFines());
    }
}