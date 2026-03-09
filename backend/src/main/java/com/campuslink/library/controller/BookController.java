package com.campuslink.library.controller;

import com.campuslink.library.dto.request.book.BookRequest;
import com.campuslink.library.dto.response.api.ApiPagination;
import com.campuslink.library.dto.response.api.ApiResponse;
import com.campuslink.library.dto.response.api.ApiString;
import com.campuslink.library.dto.response.book.BookResponse;
import com.campuslink.library.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // GET /books?page=1&size=10&keyword=abc&genre=Fantasy
    @GetMapping
    public ApiResponse<ApiPagination<BookResponse>> getBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "") String genre
    ) {
        ApiResponse<ApiPagination<BookResponse>> res = new ApiResponse<>();
        res.setData(bookService.getBooks(page, size, keyword, genre));
        return res;
    }

    // GET /books/{id}
    @GetMapping("/{id}")
    public ApiResponse<BookResponse> getBookById(@PathVariable Integer id) {
        ApiResponse<BookResponse> res = new ApiResponse<>();
        res.setData(bookService.getBookById(id));
        return res;
    }

    // POST /books
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookResponse> createBook(@Valid @RequestBody BookRequest request) {
        ApiResponse<BookResponse> res = new ApiResponse<>();
        res.setStatusCode(201);
        res.setMessage("Thêm sách thành công");
        res.setData(bookService.createBook(request));
        return res;
    }

    // PUT /books/{id}
    @PutMapping("/{id}")
    public ApiResponse<BookResponse> updateBook(
            @PathVariable Integer id,
            @Valid @RequestBody BookRequest request
    ) {
        ApiResponse<BookResponse> res = new ApiResponse<>();
        res.setMessage("Cập nhật sách thành công");
        res.setData(bookService.updateBook(id, request));
        return res;
    }

    // DELETE /books/{id}
    @DeleteMapping("/{id}")
    public ApiResponse<ApiString> deleteBook(@PathVariable Integer id) {
        bookService.deleteBook(id);
        ApiResponse<ApiString> res = new ApiResponse<>();
        res.setMessage("Xóa sách thành công");
        res.setData(ApiString.builder().message("Đã xóa sách id: " + id).build());
        return res;
    }
}