package com.campuslink.library.controller;

import com.campuslink.library.dto.response.BorrowResponse;
import com.campuslink.library.enums.BorrowStatus;
import com.campuslink.library.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @GetMapping
    public List<BorrowResponse> getBorrows(
            @RequestParam(required = false) BorrowStatus status
    ) {

        if (status != null) {
            return borrowService.getBorrowsByStatus(status);
        }

        return borrowService.getAllBorrows();
    }
}
