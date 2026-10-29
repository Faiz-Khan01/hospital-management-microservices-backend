package com.hospital.notification.dto;

import com.hospital.notification.enums.NotificationChannel;
import com.hospital.notification.enums.NotificationStatus;
import com.hospital.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {
    private Long id;
    private Long userId;
    private String recipientEmail;
    private String recipientPhone;
    private NotificationType type;
    private NotificationChannel channel;
    private String title;
    private String message;
    private String metadata;
    private NotificationStatus status;
    private boolean isRead;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
