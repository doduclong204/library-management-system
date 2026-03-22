package com.campuslink.library.service;

import com.campuslink.library.dto.request.DigitalBookRequest;
import com.campuslink.library.dto.response.DigitalBookResponse;
import com.campuslink.library.entity.DigitalBook;
import com.campuslink.library.repository.DigitalBookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigitalBookService {

    private final DigitalBookRepository repository;
    private final ClaudeOcrService ocrService;

    // Lấy path từ upload.file.ocr-uri trong application.yml
    // Ví dụ: file:///E:/Campuslink/.../upload/ocr/
    @Value("${upload.file.ocr-uri}")
    private String ocrUri;

    // ──────────────────────────────────────────
    // Upload ảnh + OCR
    // ──────────────────────────────────────────
    public DigitalBookResponse uploadAndOcr(MultipartFile file, DigitalBookRequest request) throws IOException {
        // 1. Dùng URI.create để parse đúng trên cả Windows lẫn Linux
        //    file:///E:/... → E:\...  (Windows)
        //    file:///home/... → /home/...  (Linux)
        Path dir = Paths.get(URI.create(ocrUri));
        Files.createDirectories(dir);

        String ext = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "." + ext;
        Path savedPath = dir.resolve(fileName);
        Files.write(savedPath, file.getBytes());

        // 2. Gọi Claude OCR
        String mimeType = resolveMimeType(ext);
        ClaudeOcrService.OcrResult result = ocrService.extractText(file.getBytes(), mimeType);

        // 3. Lưu DB
        DigitalBook book = DigitalBook.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .extractedText(result.text())
                .imagePath(savedPath.toString())
                .ocrDate(LocalDateTime.now())
                .accuracyPercent(result.accuracy())
                .build();

        DigitalBook saved = repository.save(book);
        log.info("OCR xong: '{}' – độ chính xác {}%", request.getTitle(), result.accuracy());

        return toResponse(saved);
    }

    // ──────────────────────────────────────────
    // CRUD
    // ──────────────────────────────────────────
    public List<DigitalBookResponse> getAll() {
        return repository.findAllByOrderByOcrDateDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DigitalBookResponse getById(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách số id=" + id));
    }

    public List<DigitalBookResponse> search(String keyword) {
        return repository.searchByKeyword(keyword)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void delete(Long id) {
        DigitalBook book = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách số id=" + id));

        // Xoá file ảnh nếu có
        try {
            if (book.getImagePath() != null) {
                Files.deleteIfExists(Paths.get(book.getImagePath()));
            }
        } catch (IOException e) {
            log.warn("Không thể xoá file ảnh: {}", e.getMessage());
        }

        repository.deleteById(id);
    }

    // ──────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────
    private DigitalBookResponse toResponse(DigitalBook b) {
        return DigitalBookResponse.builder()
                .id(b.getId())
                .title(b.getTitle())
                .author(b.getAuthor())
                .extractedText(b.getExtractedText())
                .imagePath(b.getImagePath())
                .ocrDate(b.getOcrDate())
                .accuracyPercent(b.getAccuracyPercent())
                .build();
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }

    private String resolveMimeType(String ext) {
        return switch (ext.toLowerCase()) {
            case "png"  -> "image/png";
            case "tiff", "tif" -> "image/tiff";
            default     -> "image/jpeg";
        };
    }
}