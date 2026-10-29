package com.hospital.appointment.client;

import com.hospital.appointment.dto.NotificationEventRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/api/v1/notifications/trigger")
    Object triggerNotification(@RequestBody NotificationEventRequest request);
}
