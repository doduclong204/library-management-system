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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final BookMapper bookMapper;

    @Override
    public ApiPagination<BookResponse> getBooks(int page, int size, String keyword, String genre,
                                                String authorName, Integer yearFrom, Integer yearTo,
                                                String sortBy) {
        Sort sort = switch (sortBy == null ? "" : sortBy) {
            case "title_asc"   -> Sort.by("title").ascending();
            case "title_desc"  -> Sort.by("title").descending();
            case "year_asc"    -> Sort.by("publicationYear").ascending();
            case "year_desc"   -> Sort.by("publicationYear").descending();
            default            -> Sort.by("id").descending();
        };

        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<Book> bookPage = bookRepository.searchBooks(
                keyword, genre, authorName, yearFrom, yearTo, pageable
        );

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

    @Override
    public BookResponse getBookById(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return bookMapper.toResponse(book);
    }

    @Override
    @Transactional
    public BookResponse createBook(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_EXISTED);
        }

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

        List<Author> authors = resolveAuthors(request);
        if (!authors.isEmpty()) {
            for (Author author : authors) {
                if (author.getBooks() == null) author.setBooks(new ArrayList<>());
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

        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_EXISTED);
        }

        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setImageUrl(request.getImageUrl());
        book.setGenre(request.getGenre());
        book.setPublicationYear(request.getPublicationYear());

        int oldTotal = book.getTotalCopies() != null ? book.getTotalCopies() : 0;
        int newTotal = request.getTotalCopies();
        int oldAvailable = book.getAvailableCopies() != null ? book.getAvailableCopies() : 0;
        int newAvailable = Math.max(0, oldAvailable + (newTotal - oldTotal));
        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);

        List<Author> newAuthors = resolveAuthors(request);
        if (book.getAuthors() != null) {
            for (Author oldAuthor : book.getAuthors()) {
                oldAuthor.getBooks().remove(book);
            }
            authorRepository.saveAll(book.getAuthors());
        }
        if (!newAuthors.isEmpty()) {
            for (Author author : newAuthors) {
                if (author.getBooks() == null) author.setBooks(new ArrayList<>());
                author.getBooks().add(book);
            }
            authorRepository.saveAll(newAuthors);
            book.setAuthors(newAuthors);
        } else {
            book.setAuthors(new ArrayList<>());
        }

        book = bookRepository.save(book);
        log.info("Đã cập nhật sách: id={}, title={}", book.getId(), book.getTitle());
        return bookMapper.toResponse(book);
    }

    private List<Author> resolveAuthors(BookRequest request) {
        if (request.getAuthorNames() != null && !request.getAuthorNames().isEmpty()) {
            Set<String> seen = new LinkedHashSet<>();
            List<Author> authors = new ArrayList<>();
            for (String raw : request.getAuthorNames()) {
                String name = raw != null ? raw.trim() : "";
                if (name.isEmpty() || seen.contains(name)) continue;
                seen.add(name);
                Author author = authorRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> {
                            Author newAuthor = Author.builder().name(name).build();
                            return authorRepository.save(newAuthor);
                        });
                authors.add(author);
            }
            return authors;
        }
        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            List<Author> authors = authorRepository.findByIdIn(request.getAuthorIds());
            if (authors.size() != request.getAuthorIds().size()) {
                throw new AppException(ErrorCode.AUTHOR_NOT_FOUND);
            }
            return authors;
        }
        return List.of();
    }

    @Override
    @Transactional
    public void deleteBook(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

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