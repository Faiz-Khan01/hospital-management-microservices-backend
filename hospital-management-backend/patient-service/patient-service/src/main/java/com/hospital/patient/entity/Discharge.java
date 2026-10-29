package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "discharges",
    indexes = {
        @Index(name = "idx_dis_patient",   columnList = "patientId"),
        @Index(name = "idx_dis_admission", columnList = "admissionId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long admissionId;

    @Column(nullable = false)
    private Long patientId;

    private Long doctorId;
    private LocalDateTime dischargeDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DischargeType dischargeType = DischargeType.RECOVERED;

    private String dischargeNotes;
    private LocalDate followUpDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.dischargeDate == null) this.dischargeDate = LocalDateTime.now();
    }

    public enum DischargeType {
        RECOVERED, TRANSFERRED, AMA, EXPIRED, DISCHARGE_ON_REQUEST
    }
}
