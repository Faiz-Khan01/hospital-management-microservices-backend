package com.hospital.notification.channel;

import com.hospital.notification.entity.Notification;
import com.hospital.notification.enums.NotificationStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class InAppChannelService {

    public boolean sendInApp(Notification notification) {
        if (notification.getUserId() == null) {
            log.warn("In-App notification requires a target userId. Notification ID: {}", notification.getId());
            notification.setStatus(NotificationStatus.FAILED);
            return false;
        }

        log.info("🔔 [IN-APP ALERT] User: {} | Title: {} | Alert: {}",
                notification.getUserId(), notification.getTitle(), notification.getMessage());

        notification.setStatus(NotificationStatus.DELIVERED);
        notification.setSentAt(LocalDateTime.now());
        return true;
    }
}
