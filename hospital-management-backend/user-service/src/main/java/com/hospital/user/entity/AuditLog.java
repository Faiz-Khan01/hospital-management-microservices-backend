package com.hospital.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_user",   columnList = "userId"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_entity", columnList = "entityType, entityId"),
        @Index(name = "idx_audit_date",   columnList = "createdAt")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String username;

    @Column(nullable = false)
    private String action;  // e.g. LOGIN, CREATE_PATIENT, UPDATE_APPOINTMENT

    private String entityType;  // e.g. Patient, Appointment, Bill
    private Long   entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue;   // JSON snapshot before change

    @Column(columnDefinition = "TEXT")
    private String newValue;   // JSON snapshot after change

    private String ipAddress;
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AuditStatus status = AuditStatus.SUCCESS;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum AuditStatus { SUCCESS, FAILURE }
}
