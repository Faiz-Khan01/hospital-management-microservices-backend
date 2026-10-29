package com.hospital.notification.channel;

import com.hospital.notification.entity.Notification;
import com.hospital.notification.enums.NotificationStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class SmsChannelService {

    public boolean sendSms(Notification notification) {
        String phone = notification.getRecipientPhone();
        if (phone == null || phone.isBlank()) {
            log.warn("Cannot send SMS: recipient phone number is missing for notification ID {}", notification.getId());
            notification.setStatus(NotificationStatus.FAILED);
            return false;
        }

        try {
            log.info("📱 [DISPATCH SMS] To: {} | Title: {} | Body: {}",
                    phone, notification.getTitle(), notification.getMessage());

            // In production with Twilio / AWS SNS, the SMS is transmitted here
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            return true;
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phone, e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            return false;
        }
    }
}
