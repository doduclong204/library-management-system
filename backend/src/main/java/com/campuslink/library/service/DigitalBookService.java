package com.campuslink.library.service;

import com.campuslink.library.dto.request.DigitalBookRequest;
import com.campuslink.library.dto.response.DigitalBookResponse;
import com.campuslink.library.entity.DigitalBook;
import com.campuslink.library.entity.DigitalBookPage;
import com.campuslink.library.mapper.DigitalBookMapper;
import com.campuslink.library.repository.DigitalBookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigitalBookService {

    private final DigitalBookRepository repository;
    private final ClaudeOcrService ocrService;
    private final DigitalBookMapper mapper;

    @Value("${upload.file.ocr-uri}")
    private String ocrUri;

    @Transactional
    public DigitalBookResponse uploadAndOcr(MultipartFile[] files, DigitalBookRequest request) throws IOException {
        Path dir = Paths.get(URI.create(ocrUri));
        Files.createDirectories(dir);

        DigitalBook book = DigitalBook.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .ocrDate(LocalDateTime.now())
                .pages(new ArrayList<>())
                .build();

        int pageNum = 1;
        for (MultipartFile file : files) {
            String ext = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "." + ext;
            Path savedPath = dir.resolve(fileName);
            Files.write(savedPath, file.getBytes());

            ClaudeOcrService.OcrResult result = ocrService.extractText(file.getBytes(), resolveMimeType(ext));

            DigitalBookPage page = DigitalBookPage.builder()
                    .digitalBook(book)
                    .pageNumber(pageNum++)
                    .extractedText(result.text())
                    .imagePath(savedPath.toString())
                    .accuracyPercent(result.accuracy())
                    .build();

            book.getPages().add(page);
        }

        return mapper.toResponse(repository.save(book));
    }

    public List<DigitalBookResponse> getAll() {
        return repository.findAllByOrderByOcrDateDesc()
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    public DigitalBookResponse getById(Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy id=" + id));
    }

    public List<DigitalBookResponse> search(String keyword) {
        return repository.searchByKeyword(keyword)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        DigitalBook book = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy id=" + id));

        for (DigitalBookPage page : book.getPages()) {
            try {
                if (page.getImagePath() != null) {
                    Files.deleteIfExists(Paths.get(page.getImagePath()));
                }
            } catch (IOException e) {
                log.warn("Lỗi xóa file: {}", e.getMessage());
            }
        }
        repository.delete(book);
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