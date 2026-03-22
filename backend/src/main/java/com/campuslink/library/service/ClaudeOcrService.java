package com.campuslink.library.service;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
@Slf4j
public class ClaudeOcrService {

    // Đường dẫn tới thư mục tessdata (chứa file ngôn ngữ)
    // Mặc định: C:/Program Files/Tesseract-OCR/tessdata
    @Value("${tesseract.data.path:C:/Program Files/Tesseract-OCR/tessdata}")
    private String tessDataPath;

    // Ngôn ngữ OCR: vie = tiếng Việt, eng = tiếng Anh, vie+eng = cả hai
    @Value("${tesseract.language:vie+eng}")
    private String language;

    public OcrResult extractText(byte[] imageBytes, String mimeType) {
        try {
            // Chuyển bytes thành BufferedImage
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image == null) {
                log.error("Không đọc được ảnh");
                return new OcrResult("Không đọc được ảnh.", 0);
            }

            // Khởi tạo Tesseract
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(tessDataPath);
            tesseract.setLanguage(language);
            tesseract.setPageSegMode(1);   // Tự động phân tích layout trang
            tesseract.setOcrEngineMode(1); // Dùng LSTM engine (chính xác hơn)

            // Thực hiện OCR
            String text = tesseract.doOCR(image);
            log.info("OCR thành công, độ dài text: {} ký tự", text.length());

            // Tính accuracy đơn giản dựa theo độ dài text
            int accuracy = estimateAccuracy(text);

            return new OcrResult(text.trim(), accuracy);

        } catch (TesseractException e) {
            log.error("Lỗi Tesseract OCR: {}", e.getMessage());
            return new OcrResult("Lỗi OCR: " + e.getMessage(), 0);
        } catch (IOException e) {
            log.error("Lỗi đọc ảnh: {}", e.getMessage());
            return new OcrResult("Lỗi đọc ảnh: " + e.getMessage(), 0);
        }
    }

    /**
     * Ước tính độ chính xác dựa trên tỷ lệ ký tự hợp lệ trong text
     */
    private int estimateAccuracy(String text) {
        if (text == null || text.isBlank()) return 0;

        long validChars = text.chars()
                .filter(c -> Character.isLetterOrDigit(c)
                        || Character.isWhitespace(c)
                        || ".,!?;:\"'()-".indexOf(c) >= 0)
                .count();

        double ratio = (double) validChars / text.length();

        if (ratio >= 0.95) return 95;
        if (ratio >= 0.85) return 85;
        if (ratio >= 0.75) return 75;
        if (ratio >= 0.60) return 60;
        return 40;
    }

    public record OcrResult(String text, int accuracy) {}
}