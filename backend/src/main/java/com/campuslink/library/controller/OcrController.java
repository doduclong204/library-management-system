package com.campuslink.library.controller;

import com.campuslink.library.dto.request.DigitalBookRequest;
import com.campuslink.library.dto.request.UpdateDigitalBookRequest;
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
@RequestMapping("/api/v1/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final DigitalBookService service;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<DigitalBookResponse> upload(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("title") String title,
            @RequestParam(value = "author", required = false, defaultValue = "") String author
    ) throws IOException {

        if (files == null || files.length == 0) return ResponseEntity.badRequest().build();

        DigitalBookRequest request = DigitalBookRequest.builder()
                .title(title)
                .author(author)
                .build();

        return ResponseEntity.ok(service.uploadAndOcr(files, request));
    }

    @GetMapping("/books")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<DigitalBookResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<DigitalBookResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/books/search")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<DigitalBookResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(service.search(keyword));
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<DigitalBookResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateDigitalBookRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}