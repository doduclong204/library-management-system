package com.campuslink.library.scheduler;

import com.campuslink.library.entity.BorrowRecord;
import com.campuslink.library.enums.BorrowStatus;
import com.campuslink.library.repository.BorrowRecordRepository;
import com.campuslink.library.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final BorrowRecordRepository borrowRepository;
    private final EmailNotificationService emailService;

    @Value("${app.reminder.days-before:3}")
    private int daysBefore;

    @Scheduled(cron = "0 0 8 * * *")
    public void sendDueDateReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(daysBefore);

        List<BorrowRecord> records = borrowRepository
                .findByDueDateAndStatusAndReminderSent(targetDate, BorrowStatus.borrowed, false);

        log.info("ReminderScheduler: tìm thấy {} bản ghi cần nhắc nhở (due={})", records.size(), targetDate);

        Map<String, List<BorrowRecord>> grouped = records.stream()
                .collect(Collectors.groupingBy(BorrowRecord::getSessionId));

        for (Map.Entry<String, List<BorrowRecord>> entry : grouped.entrySet()) {
            List<BorrowRecord> group = entry.getValue();
            emailService.sendDueDateReminder(group);
            for (BorrowRecord record : group) {
                record.setReminderSent(true);
                borrowRepository.save(record);
            }
        }
    }

    @Scheduled(cron = "0 15 8 * * *")
    public void sendConfiscationWarnings() {
        LocalDate targetDueDate = LocalDate.now().minusDays(12);

        List<BorrowRecord> records = borrowRepository.findByStatusInAndDueDateBefore(
                        List.of(BorrowStatus.borrowed, BorrowStatus.overdue),
                        targetDueDate.plusDays(1)
                ).stream()
                .filter(r -> r.getDueDate().equals(targetDueDate))
                .toList();

        if (records.isEmpty()) {
            log.info("sendConfiscationWarnings: không có ai quá hạn đúng 12 ngày");
            return;
        }

        records.stream()
                .collect(Collectors.groupingBy(r -> r.getPatron().getEmail()))
                .values()
                .forEach(emailService::sendConfiscationWarning);

        log.info("sendConfiscationWarnings: gửi cảnh báo cho {} sách", records.size());
    }

    @Scheduled(cron = "0 30 8 * * *")
    public void autoConfiscateOverdue() {
        LocalDate threshold = LocalDate.now().minusDays(15);

        List<BorrowRecord> records = borrowRepository.findByStatusInAndDueDateBefore(
                List.of(BorrowStatus.borrowed, BorrowStatus.overdue),
                threshold.plusDays(1)
        );

        if (records.isEmpty()) {
            log.info("autoConfiscateOverdue: không có sách nào quá hạn 15 ngày");
            return;
        }

        for (BorrowRecord r : records) {
            BigDecimal fine = (r.getBookPrice() != null) ? r.getBookPrice() : BigDecimal.ZERO;
            r.setFineAmount(fine);
            r.setFinePaid(false);
            r.setStatus(BorrowStatus.confiscated);
        }
        borrowRepository.saveAll(records);

        records.stream()
                .collect(Collectors.groupingBy(r -> r.getPatron().getEmail()))
                .values()
                .forEach(emailService::sendConfiscationNotice);

        log.info("autoConfiscateOverdue: đã thu hồi {} sách quá hạn 15 ngày", records.size());
    }
}