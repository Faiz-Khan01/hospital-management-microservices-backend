package com.hospital.notification.controller;

import com.hospital.notification.dto.ApiResponse;
import com.hospital.notification.dto.EventNotificationRequest;
import com.hospital.notification.dto.NotificationRequest;
import com.hospital.notification.dto.NotificationResponseDto;
import com.hospital.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Dispatch & Alerts", description = "Multi-channel notification engine (Email, SMS, In-App) for appointment, lab, billing, and prescription alerts")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Send custom notification", description = "Dispatches custom notification across specified channels (EMAIL, SMS, IN_APP)")
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>> sendNotification(
            @Valid @RequestBody NotificationRequest request
    ) {
        log.info("Received request to send notification type {} to user {}", request.getType(), request.getUserId());
        List<NotificationResponseDto> result = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notifications dispatched successfully", result));
    }

    @Operation(summary = "Trigger event-based notification", description = "Formats templates and dispatches alerts for Appointment, Lab, Payment, or Prescription events")
    @PostMapping("/trigger")
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>> triggerEvent(
            @Valid @RequestBody EventNotificationRequest request
    ) {
        log.info("Triggering event notification for type: {}", request.getType());
        List<NotificationResponseDto> result = notificationService.triggerEventNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event notification sent across channels", result));
    }

    @Operation(summary = "Get user notifications", description = "Retrieves paginated notifications for the user's in-app inbox")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<NotificationResponseDto>>> getUserNotifications(
            @PathVariable Long userId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Fetching notifications for user ID: {}", userId);
        Page<NotificationResponseDto> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", notifications));
    }

    @Operation(summary = "Get unread notifications", description = "Retrieves all unread in-app alerts for user")
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<Page<NotificationResponseDto>>> getUnreadNotifications(
            @PathVariable Long userId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching unread alerts for user ID: {}", userId);
        Page<NotificationResponseDto> unread = notificationService.getUnreadNotifications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched", unread));
    }

    @Operation(summary = "Get unread notification count", description = "Returns badge count for unread in-app alerts")
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("unreadCount", count)));
    }

    @Operation(summary = "Mark notification as read", description = "Updates read status for specific notification")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponseDto>> markAsRead(@PathVariable Long id) {
        log.info("Marking notification ID {} as read", id);
        NotificationResponseDto updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @Operation(summary = "Mark all user notifications as read", description = "Batch updates all unread alerts for a user")
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long userId) {
        log.info("Marking all notifications as read for user ID: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
