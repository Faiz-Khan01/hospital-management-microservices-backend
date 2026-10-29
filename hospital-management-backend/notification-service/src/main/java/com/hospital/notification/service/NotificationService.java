package com.hospital.notification.service;

import com.hospital.notification.channel.InAppChannelService;
import com.hospital.notification.dto.EventNotificationRequest;
import com.hospital.notification.dto.NotificationRequest;
import com.hospital.notification.dto.NotificationResponseDto;
import com.hospital.notification.entity.Notification;
import com.hospital.notification.enums.NotificationChannel;
import com.hospital.notification.enums.NotificationType;
import com.hospital.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final InAppChannelService inAppChannelService;
    private final NotificationDispatchService notificationDispatchService;

    @Transactional
    public List<NotificationResponseDto> sendNotification(NotificationRequest request) {
        List<NotificationChannel> channels = request.getChannels();
        if (channels == null || channels.isEmpty()) {
            channels = Arrays.asList(NotificationChannel.EMAIL, NotificationChannel.IN_APP);
        }

        List<NotificationResponseDto> responses = new ArrayList<>();

        for (NotificationChannel channel : channels) {
            Notification notification = Notification.builder()
                    .userId(request.getUserId())
                    .recipientEmail(request.getRecipientEmail())
                    .recipientPhone(request.getRecipientPhone())
                    .type(request.getType())
                    .channel(channel)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .metadata(request.getMetadata())
                    .build();

            Notification saved = notificationRepository.save(notification);

            // In-app alerts are immediately available; external delivery is asynchronous.
            if (channel == NotificationChannel.IN_APP) {
                inAppChannelService.sendInApp(saved);
                notificationRepository.save(saved);
            } else {
                dispatchAfterCommit(saved);
            }

            responses.add(mapToDto(saved));
        }

        return responses;
    }

    private void dispatchAfterCommit(Notification notification) {
        Runnable dispatch = () -> notificationDispatchService.dispatchExternal(notification);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    dispatch.run();
                }
            });
        } else {
            dispatch.run();
        }
    }

    @Transactional
    public List<NotificationResponseDto> triggerEventNotification(EventNotificationRequest request) {
        String title;
        String message;

        String patient = request.getPatientName() != null ? request.getPatientName() : "Patient";
        String doctor = request.getDoctorName() != null ? request.getDoctorName() : "your doctor";
        String date = request.getAppointmentDate() != null ? request.getAppointmentDate() : "the scheduled date";
        String dept = request.getDepartmentName() != null ? " (" + request.getDepartmentName() + ")" : "";

        switch (request.getType()) {
            case APPOINTMENT_CONFIRMATION -> {
                title = "Appointment Confirmed";
                message = String.format("Dear %s, your appointment with Dr. %s%s is confirmed for %s.", patient, doctor, dept, date);
            }
            case APPOINTMENT_REMINDER -> {
                title = "Upcoming Appointment Reminder";
                message = String.format("Dear %s, this is a reminder for your appointment with Dr. %s%s on %s.", patient, doctor, dept, date);
            }
            case APPOINTMENT_CANCELLATION -> {
                title = "Appointment Cancelled";
                message = String.format("Dear %s, your appointment with Dr. %s%s scheduled for %s has been cancelled.", patient, doctor, dept, date);
            }
            case LAB_REPORT_AVAILABLE -> {
                title = "Lab Test Report Ready";
                String test = request.getTestName() != null ? request.getTestName() : "Diagnostic Test";
                message = String.format("Dear %s, your lab test report for '%s' is now finalized and ready for review.", patient, test);
            }
            case PAYMENT_CONFIRMATION -> {
                title = "Payment Confirmation Receipt";
                String amount = request.getAmount() != null ? "$" + request.getAmount().toPlainString() : "your bill";
                String tx = request.getTransactionId() != null ? " (Tx: " + request.getTransactionId() + ")" : "";
                message = String.format("Payment of %s has been successfully received%s. Thank you!", amount, tx);
            }
            case PRESCRIPTION_NOTIFICATION -> {
                title = "New Prescription Issued";
                String meds = request.getMedicationSummary() != null ? request.getMedicationSummary() : "prescribed medications";
                message = String.format("Dr. %s has issued a new prescription for you: %s. You can view it in your patient portal.", doctor, meds);
            }
            default -> {
                title = "Hospital Notification";
                message = "You have a new update regarding your hospital records.";
            }
        }

        NotificationRequest notificationRequest = NotificationRequest.builder()
                .userId(request.getUserId())
                .recipientEmail(request.getRecipientEmail())
                .recipientPhone(request.getRecipientPhone())
                .type(request.getType())
                .channels(request.getChannels() != null && !request.getChannels().isEmpty()
                        ? request.getChannels()
                        : Arrays.asList(NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP))
                .title(title)
                .message(message)
                .metadata(request.getTransactionId() != null ? "txId=" + request.getTransactionId() : null)
                .build();

        return sendNotification(notificationRequest);
    }

    public Page<NotificationResponseDto> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDto);
    }

    public List<NotificationResponseDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<NotificationResponseDto> getUnreadNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDto);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponseDto markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return mapToDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(now);
        });
        notificationRepository.saveAll(unread);
    }

    private NotificationResponseDto mapToDto(Notification n) {
        return NotificationResponseDto.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .recipientEmail(n.getRecipientEmail())
                .recipientPhone(n.getRecipientPhone())
                .type(n.getType())
                .channel(n.getChannel())
                .title(n.getTitle())
                .message(n.getMessage())
                .metadata(n.getMetadata())
                .status(n.getStatus())
                .isRead(n.isRead())
                .sentAt(n.getSentAt())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
