package com.campuslink.library.controller;

import com.campuslink.library.dto.request.DigitalBookRequest;
import com.campuslink.library.dto.response.DigitalBookResponse;
import com.campuslink.library.service.DigitalBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final DigitalBookService service;

    /**
     * POST /api/ocr/upload
     * Upload ảnh sách → OCR → lưu DB
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<DigitalBookResponse> upload(
            @RequestParam("file")   MultipartFile file,
            @RequestParam("title")  String title,
            @RequestParam(value = "author", required = false, defaultValue = "") String author
    ) throws IOException {

        if (file.isEmpty()) return ResponseEntity.badRequest().build();

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().build();
        }

        DigitalBookRequest request = DigitalBookRequest.builder()
                .title(title)
                .author(author)
                .build();

        return ResponseEntity.ok(service.uploadAndOcr(file, request));
    }

    /**
     * GET /api/ocr/books
     * Lấy toàn bộ kho sách số, sắp xếp theo ngày OCR mới nhất
     */
    @GetMapping("/books")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<DigitalBookResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * GET /api/ocr/books/{id}
     * Xem chi tiết + toàn bộ nội dung trích xuất
     */
    @GetMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<DigitalBookResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * GET /api/ocr/books/search?keyword=xxx
     * Tìm kiếm full-text trong nội dung đã OCR
     */
    @GetMapping("/books/search")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<DigitalBookResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(service.search(keyword));
    }

    /**
     * DELETE /api/ocr/books/{id}
     */
    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}