package com.campuslink.library.service;

import com.campuslink.library.dto.request.book.BookRequest;
import com.campuslink.library.dto.response.api.ApiPagination;
import com.campuslink.library.dto.response.book.BookResponse;

public interface BookService {

    ApiPagination<BookResponse> getBooks(int page, int size, String keyword, String genre);

    BookResponse getBookById(Integer id);

    BookResponse createBook(BookRequest request);

    BookResponse updateBook(Integer id, BookRequest request);

    void deleteBook(Integer id);
}