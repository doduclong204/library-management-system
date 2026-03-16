package com.campuslink.library.service;

import com.campuslink.library.dto.request.BorrowRequest;
import com.campuslink.library.dto.response.BorrowResponse;
import com.campuslink.library.entity.BookCopy;
import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.entity.Librarian;
import com.campuslink.library.entity.Patron;
import com.campuslink.library.enums.BookStatus;
import com.campuslink.library.enums.BorrowStatus;
import com.campuslink.library.mapper.BorrowMapper;
import com.campuslink.library.repository.BookCopyRepository;
import com.campuslink.library.repository.BorrowRecordRepository;
import com.campuslink.library.repository.LibrarianRepository;
import com.campuslink.library.repository.PatronRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRepository;
    private final BorrowMapper borrowMapper;
    private final PatronRepository patronRepository;
    private final BookCopyRepository bookCopyRepository;
    private final LibrarianRepository librarianRepository;

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

    @Transactional
    public BorrowResponse borrowBook(BorrowRequest request) {
        // 1. Tìm Patron
        Patron patron = patronRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người mượn"));

        // 2. Tìm bản sao dựa trên Book ID (vì Frontend đang gửi Book ID)
        BookCopy bookCopy = bookCopyRepository
                .findFirstAvailableByBookId(request.getBookCopyId()) // bookCopyId ở đây thực chất là bookId từ FE gửi lên
                .orElseThrow(() -> new RuntimeException("Sách này hiện đã được mượn hết, không còn bản sao trống"));

        // 3. Cập nhật trạng thái bản sao ngay lập tức
        bookCopy.setStatus(BookStatus.borrowed);
        bookCopyRepository.save(bookCopy);

        // 4. Tạo và lưu bản ghi mượn
        BorrowRecord record = BorrowRecord.builder()
                .patron(patron)
                .bookCopy(bookCopy)
                .borrowDate(LocalDate.now())
                .dueDate(request.getDueDate())
                .status(BorrowStatus.borrowed)
                .build();

        BorrowRecord savedRecord = borrowRepository.save(record);

        return borrowMapper.toBorrowResponse(savedRecord);
    }
}