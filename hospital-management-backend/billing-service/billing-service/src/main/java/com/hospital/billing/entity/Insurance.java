package com.hospital.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance",
    indexes = {
        @Index(name = "idx_ins_patient", columnList = "patientId"),
        @Index(name = "idx_ins_policy",  columnList = "policyNumber")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Insurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String providerName;

    @Column(nullable = false, unique = true)
    private String policyNumber;

    private String groupNumber;

    private BigDecimal coverageAmount;

    private LocalDate validFrom;
    private LocalDate validTo;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InsuranceStatus status = InsuranceStatus.ACTIVE;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum InsuranceStatus {
        ACTIVE, EXPIRED, SUSPENDED, CLAIMED
    }
}
