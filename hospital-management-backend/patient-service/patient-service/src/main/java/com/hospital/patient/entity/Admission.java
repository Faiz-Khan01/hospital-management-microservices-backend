package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions",
    indexes = {
        @Index(name = "idx_adm_patient", columnList = "patientId"),
        @Index(name = "idx_adm_status",  columnList = "status"),
        @Index(name = "idx_adm_bed",     columnList = "bedId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private Long doctorId;
    private Long wardId;
    private Long bedId;

    private LocalDateTime admissionDate;
    private String reason;
    private String diagnosis;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AdmissionStatus status = AdmissionStatus.ADMITTED;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.admissionDate == null) this.admissionDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum AdmissionStatus { ADMITTED, DISCHARGED, TRANSFERRED }
}
