package com.campuslink.library.service;

import com.campuslink.library.entity.BorrowRecord;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Async
    public void sendBorrowConfirmation(List<BorrowRecord> records) {
        if (records == null || records.isEmpty()) return;
        String to = records.get(0).getPatron().getEmail();
        String subject = "[Thư viện] Xác nhận mượn sách";
        send(to, subject, buildBorrowConfirmationHtml(records));
    }

    @Async
    public void sendDueDateReminder(List<BorrowRecord> records) {
        if (records == null || records.isEmpty()) return;
        String to = records.get(0).getPatron().getEmail();
        String subject = "[Thư viện] Nhắc nhở: Sách sắp đến hạn trả";
        send(to, subject, buildReminderHtml(records));
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Đã gửi email '{}' tới {}", subject, to);
        } catch (MessagingException e) {
            log.error("Gửi email thất bại tới {}: {}", to, e.getMessage());
        }
    }

    private String buildBorrowConfirmationHtml(List<BorrowRecord> records) {
        String patronName = records.get(0).getPatron().getFullName();
        String borrowDate = records.get(0).getBorrowDate().format(DATE_FMT);
        String dueDate    = records.get(0).getDueDate().format(DATE_FMT);

        StringBuilder rows = new StringBuilder();
        for (BorrowRecord record : records) {
            rows.append("""
                <tr>
                  <td style="padding:8px 12px; border:1px solid #ddd;">%s</td>
                  <td style="padding:8px 12px; border:1px solid #ddd;">%s</td>
                </tr>
                """.formatted(
                    record.getBookCopy().getBook().getTitle(),
                    record.getBookCopy().getBarcode()
            ));
        }

        return """
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
              <div style="background:#1a73e8; padding:20px; border-radius:8px 8px 0 0;">
                <h2 style="color:#fff; margin:0;">📚 Xác nhận mượn sách</h2>
              </div>
              <div style="border:1px solid #ddd; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
                <p>Xin chào <b>%s</b>,</p>
                <p>Bạn đã mượn sách thành công. Chi tiết như sau:</p>
                <table style="border-collapse:collapse; width:100%%;">
                  <thead>
                    <tr style="background:#1a73e8; color:#fff;">
                      <th style="padding:8px 12px; border:1px solid #ddd; text-align:left;">Tên sách</th>
                      <th style="padding:8px 12px; border:1px solid #ddd; text-align:left;">Mã barcode</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <table style="border-collapse:collapse; width:100%%; margin-top:16px;">
                  <tr style="background:#f5f5f5;">
                    <td style="padding:8px 12px; border:1px solid #ddd; font-weight:bold;">Ngày mượn</td>
                    <td style="padding:8px 12px; border:1px solid #ddd;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px; border:1px solid #ddd; font-weight:bold;">Hạn trả</td>
                    <td style="padding:8px 12px; border:1px solid #ddd; color:#e53935; font-weight:bold;">%s</td>
                  </tr>
                </table>
                <p style="margin-top:20px; color:#555;">
                  Vui lòng trả sách đúng hạn để tránh bị phạt phí.<br>
                  Nếu cần hỗ trợ, hãy liên hệ thủ thư tại thư viện.
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="font-size:12px; color:#999;">Email này được gửi tự động từ hệ thống Thư viện CampusLink.</p>
              </div>
            </body>
            </html>
            """.formatted(patronName, rows.toString(), borrowDate, dueDate);
    }

    private String buildReminderHtml(List<BorrowRecord> records) {
        String patronName = records.get(0).getPatron().getFullName();
        String dueDate    = records.get(0).getDueDate().format(DATE_FMT);
        long daysLeft     = ChronoUnit.DAYS.between(LocalDate.now(), records.get(0).getDueDate());

        StringBuilder rows = new StringBuilder();
        for (BorrowRecord record : records) {
            rows.append("""
                <tr>
                  <td style="padding:8px 12px; border:1px solid #ddd;">%s</td>
                  <td style="padding:8px 12px; border:1px solid #ddd;">%s</td>
                </tr>
                """.formatted(
                    record.getBookCopy().getBook().getTitle(),
                    record.getBookCopy().getBarcode()
            ));
        }

        return """
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
              <div style="background:#f57c00; padding:20px; border-radius:8px 8px 0 0;">
                <h2 style="color:#fff; margin:0;">⏰ Nhắc nhở trả sách</h2>
              </div>
              <div style="border:1px solid #ddd; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
                <p>Xin chào <b>%s</b>,</p>
                <p>Các sách bạn đang mượn sẽ <b style="color:#e53935;">đến hạn trả sau %d ngày</b> (ngày <b>%s</b>).</p>
                <table style="border-collapse:collapse; width:100%%;">
                  <thead>
                    <tr style="background:#f57c00; color:#fff;">
                      <th style="padding:8px 12px; border:1px solid #ddd; text-align:left;">Tên sách</th>
                      <th style="padding:8px 12px; border:1px solid #ddd; text-align:left;">Mã barcode</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <p style="margin-top:20px; color:#555;">Vui lòng đến thư viện để trả sách đúng hạn.</p>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="font-size:12px; color:#999;">Email này được gửi tự động từ hệ thống Thư viện CampusLink.</p>
              </div>
            </body>
            </html>
            """.formatted(patronName, daysLeft, dueDate, rows.toString());
    }
}