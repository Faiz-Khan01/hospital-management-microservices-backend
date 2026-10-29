package com.hospital.user.service;

import com.hospital.user.entity.AuditLog;
import com.hospital.user.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository repository;

    public void record(String action, String entityType, Long entityId, String newValue) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes == null ? null : attributes.getRequest();
        String userId = request == null ? null : request.getHeader("X-Authenticated-User-Id");
        repository.save(AuditLog.builder()
                .userId(userId == null ? null : Long.valueOf(userId))
                .username(request == null ? "SYSTEM" : request.getHeader("X-Authenticated-User"))
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .newValue(newValue)
                .ipAddress(request == null ? null : request.getRemoteAddr())
                .userAgent(request == null ? null : request.getHeader("User-Agent"))
                .status(AuditLog.AuditStatus.SUCCESS)
                .build());
    }
}
