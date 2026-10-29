package com.hospital.notification.channel;

import com.hospital.notification.entity.Notification;
import com.hospital.notification.enums.NotificationStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class EmailChannelService {

    public boolean sendEmail(Notification notification) {
        String recipient = notification.getRecipientEmail();
        if (recipient == null || recipient.isBlank()) {
            log.warn("Cannot send email: recipient email is missing for notification ID {}", notification.getId());
            notification.setStatus(NotificationStatus.FAILED);
            return false;
        }

        try {
            log.info("📧 [DISPATCH EMAIL] To: {} | Subject: {} | Message: {}",
                    recipient, notification.getTitle(), notification.getMessage());
            
            // In a production environment with JavaMailSender or SendGrid/SES,
            // the email payload is transmitted here.
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", recipient, e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            return false;
        }
    }
}
