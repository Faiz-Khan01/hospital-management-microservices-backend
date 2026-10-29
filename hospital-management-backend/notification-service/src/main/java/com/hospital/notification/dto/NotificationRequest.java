package com.hospital.notification.dto;

import com.hospital.notification.enums.NotificationChannel;
import com.hospital.notification.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    private Long userId;

    private String recipientEmail;

    private String recipientPhone;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    private List<NotificationChannel> channels;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String metadata;
}
