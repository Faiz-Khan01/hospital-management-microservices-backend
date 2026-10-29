package com.hospital.notification.dto;

import com.hospital.notification.enums.NotificationChannel;
import com.hospital.notification.enums.NotificationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventNotificationRequest {

    private Long userId;

    private String recipientEmail;

    private String recipientPhone;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    private List<NotificationChannel> channels;

    // Contextual event fields
    private String patientName;
    private String doctorName;
    private String appointmentDate;
    private String departmentName;
    private String testName;
    private String reportUrl;
    private BigDecimal amount;
    private String transactionId;
    private String paymentMethod;
    private String medicationSummary;
    private String additionalNotes;
}
