package com.campuslink.library.service;

import com.campuslink.library.dto.request.BorrowRequest;
import com.campuslink.library.dto.response.BorrowResponse;
import com.campuslink.library.entity.Book;
import com.campuslink.library.entity.BookCopy;
import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.entity.Patron;
import com.campuslink.library.enums.BookStatus;
import com.campuslink.library.enums.BorrowStatus;
import com.campuslink.library.mapper.BorrowMapper;
import com.campuslink.library.repository.BookCopyRepository;
import com.campuslink.library.repository.BookRepository;
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
    private final BookRepository bookRepository;
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
        Patron patron = patronRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    Patron newPatron = new Patron();
                    newPatron.setEmail(request.getEmail());
                    newPatron.setFullName(request.getFullName());
                    newPatron.setStudentId(request.getStudentId());
                    return patronRepository.save(newPatron);
                });

        BookCopy bookCopy = bookCopyRepository
                .findFirstAvailableByBookId(request.getBookCopyId())
                .orElseThrow(() -> new RuntimeException("Sách này hiện đã được mượn hết, không còn bản sao trống"));

        bookCopy.setStatus(BookStatus.borrowed);
        bookCopyRepository.save(bookCopy);

        Book book = bookRepository.findById(request.getBookCopyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

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