package com.campuslink.library.service.impl;

import com.campuslink.library.dto.request.book.BookRequest;
import com.campuslink.library.dto.response.api.ApiPagination;
import com.campuslink.library.dto.response.book.BookResponse;
import com.campuslink.library.entity.Author;
import com.campuslink.library.entity.Book;
import com.campuslink.library.exception.AppException;
import com.campuslink.library.exception.ErrorCode;
import com.campuslink.library.mapper.BookMapper;
import com.campuslink.library.repository.AuthorRepository;
import com.campuslink.library.repository.BookRepository;
import com.campuslink.library.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final BookMapper bookMapper;

    @Override
    public ApiPagination<BookResponse> getBooks(int page, int size, String keyword, String genre) {
        // page từ client bắt đầu từ 1, Pageable bắt đầu từ 0
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());

        Page<Book> bookPage = bookRepository.searchBooks(keyword, genre, pageable);

        List<BookResponse> bookResponses = bookPage.getContent()
                .stream()
                .map(bookMapper::toResponse)
                .toList();

        ApiPagination.Meta meta = ApiPagination.Meta.builder()
                .current(page)
                .pageSize(size)
                .pages(bookPage.getTotalPages())
                .total(bookPage.getTotalElements())
                .build();

        return ApiPagination.<BookResponse>builder()
                .meta(meta)
                .result(bookResponses)
                .build();
    }

    // ── GET /books/{id} ────────────────────────────────────────────────
    @Override
    public BookResponse getBookById(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return bookMapper.toResponse(book);
    }

    // ── POST /books ────────────────────────────────────────────────────
    @Override
    @Transactional
    public BookResponse createBook(BookRequest request) {
        // Kiểm tra ISBN trùng
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_EXISTED);
        }

        // Tạo entity Book
        Book book = Book.builder()
                .isbn(request.getIsbn())
                .title(request.getTitle())
                .imageUrl(request.getImageUrl())
                .genre(request.getGenre())
                .publicationYear(request.getPublicationYear())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .build();

        book = bookRepository.save(book);


        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            List<Author> authors = authorRepository.findByIdIn(request.getAuthorIds());
            if (authors.size() != request.getAuthorIds().size()) {
                throw new AppException(ErrorCode.AUTHOR_NOT_FOUND);
            }
            for (Author author : authors) {
                if (author.getBooks() == null) {
                    author.setBooks(new ArrayList<>());
                }
                author.getBooks().add(book);
            }
            authorRepository.saveAll(authors);
            book.setAuthors(authors);
        }

        log.info("Đã tạo sách mới: id={}, title={}", book.getId(), book.getTitle());
        return bookMapper.toResponse(book);
    }

    @Override
    @Transactional
    public BookResponse updateBook(Integer id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Kiểm tra ISBN trùng với sách khác
        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_EXISTED);
        }

        // Cập nhật thông tin cơ bản
        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setImageUrl(request.getImageUrl());
        book.setGenre(request.getGenre());
        book.setPublicationYear(request.getPublicationYear());

        // Cập nhật số lượng: điều chỉnh availableCopies theo delta
        int oldTotal = book.getTotalCopies() != null ? book.getTotalCopies() : 0;
        int newTotal = request.getTotalCopies();
        int oldAvailable = book.getAvailableCopies() != null ? book.getAvailableCopies() : 0;
        int newAvailable = oldAvailable + (newTotal - oldTotal);
        if (newAvailable < 0) {
            newAvailable = 0;
        }
        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);

        // Cập nhật tác giả
        if (request.getAuthorIds() != null) {
            // Xóa liên kết cũ (owner side là Author)
            if (book.getAuthors() != null) {
                for (Author oldAuthor : book.getAuthors()) {
                    oldAuthor.getBooks().remove(book);
                }
                authorRepository.saveAll(book.getAuthors());
            }

            // Thêm liên kết mới
            if (!request.getAuthorIds().isEmpty()) {
                List<Author> newAuthors = authorRepository.findByIdIn(request.getAuthorIds());
                if (newAuthors.size() != request.getAuthorIds().size()) {
                    throw new AppException(ErrorCode.AUTHOR_NOT_FOUND);
                }
                for (Author author : newAuthors) {
                    if (author.getBooks() == null) {
                        author.setBooks(new ArrayList<>());
                    }
                    author.getBooks().add(book);
                }
                authorRepository.saveAll(newAuthors);
                book.setAuthors(newAuthors);
            } else {
                book.setAuthors(new ArrayList<>());
            }
        }

        book = bookRepository.save(book);
        log.info("Đã cập nhật sách: id={}, title={}", book.getId(), book.getTitle());
        return bookMapper.toResponse(book);
    }

    // ── DELETE /books/{id} ─────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteBook(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Xóa liên kết ManyToMany với Author trước
        if (book.getAuthors() != null) {
            for (Author author : book.getAuthors()) {
                author.getBooks().remove(book);
            }
            authorRepository.saveAll(book.getAuthors());
        }

        bookRepository.delete(book);
        log.info("Đã xóa sách: id={}, title={}", book.getId(), book.getTitle());
    }
}