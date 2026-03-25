package com.campuslink.library.service;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITessAPI;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import net.sourceforge.tess4j.Word;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@Service
@Slf4j
public class ClaudeOcrService {

    @Value("${tesseract.data.path:C:/Program Files/Tesseract-OCR/tessdata}")
    private String tessDataPath;

    @Value("${tesseract.language:vie+eng}")
    private String language;

    public OcrResult extractText(byte[] imageBytes, String mimeType) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image == null) return new OcrResult("Không đọc được ảnh.", 0);

            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(tessDataPath);
            tesseract.setLanguage(language);
            tesseract.setPageSegMode(1);
            tesseract.setOcrEngineMode(1);

            String text = tesseract.doOCR(image);
            List<Word> words = tesseract.getWords(image, ITessAPI.TessPageIteratorLevel.RIL_WORD);

            int averageAccuracy = 0;
            if (!words.isEmpty()) {
                double totalConfidence = 0;
                for (Word word : words) {
                    totalConfidence += word.getConfidence();
                }
                averageAccuracy = (int) (totalConfidence / words.size());
            }

            return new OcrResult(text.trim(), averageAccuracy);

        } catch (TesseractException | IOException e) {
            log.error("Lỗi OCR: {}", e.getMessage());
            return new OcrResult("Lỗi hệ thống", 0);
        }
    }

    public record OcrResult(String text, int accuracy) {}
}