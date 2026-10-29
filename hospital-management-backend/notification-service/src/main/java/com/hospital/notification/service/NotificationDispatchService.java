package com.hospital.notification.service;

import com.hospital.notification.channel.EmailChannelService;
import com.hospital.notification.channel.SmsChannelService;
import com.hospital.notification.entity.Notification;
import com.hospital.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDispatchService {

    private final NotificationRepository notificationRepository;
    private final EmailChannelService emailChannelService;
    private final SmsChannelService smsChannelService;

    @Async("notificationExecutor")
    @Transactional
    public void dispatchExternal(Notification notification) {
        Notification managed = notificationRepository.findById(notification.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Notification not found for asynchronous dispatch: " + notification.getId()));

        switch (managed.getChannel()) {
            case EMAIL -> emailChannelService.sendEmail(managed);
            case SMS -> smsChannelService.sendSms(managed);
            default -> throw new IllegalArgumentException(
                    "Unsupported asynchronous channel: " + managed.getChannel());
        }

        notificationRepository.save(managed);
        log.debug("Asynchronous {} notification {} dispatched with status {}",
                managed.getChannel(), managed.getId(), managed.getStatus());
    }
}
