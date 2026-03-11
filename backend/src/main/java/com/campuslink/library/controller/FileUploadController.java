package com.campuslink.library.controller;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileUploadController {

    @Value("${upload.file.image-uri}")
    String imageUri;

    @Value("${upload.file.video-uri}")
    String videoUri;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File phải là ảnh (jpg, png, ...)");
        }

        String dirPath = imageUri.replace("file:///", "").replace("file://", "");
        Path uploadPath = Paths.get(dirPath);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String ext = getExt(file.getOriginalFilename(), ".jpg");
        String fileName = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(Map.of("url", "/api/v1/images/" + fileName));
    }

    @PostMapping("/video")
    public ResponseEntity<Map<String, String>> uploadVideo(
            @RequestParam("file") MultipartFile file) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new RuntimeException("File phải là video (mp4, ...)");
        }

        String dirPath = videoUri.replace("file:///", "").replace("file://", "");
        Path uploadPath = Paths.get(dirPath);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String ext = getExt(file.getOriginalFilename(), ".mp4");
        String fileName = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
                StandardCopyOption.REPLACE_EXISTING);

        return ResponseEntity.ok(Map.of("url", "/api/v1/videos/" + fileName));
    }

    private String getExt(String filename, String defaultExt) {
        return (filename != null && filename.contains("."))
                ? filename.substring(filename.lastIndexOf("."))
                : defaultExt;
    }
}