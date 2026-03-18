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

import java.time.LocalDate;
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
            log.info("Gửi email nhắc nhở cho sessionId={}, số sách={}", entry.getKey(), group.size());
            emailService.sendDueDateReminder(group);
            for (BorrowRecord record : group) {
                record.setReminderSent(true);
                borrowRepository.save(record);
            }
        }
    }
}