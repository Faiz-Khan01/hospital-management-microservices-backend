package com.hospital.labtest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_orders",
    indexes = {
        @Index(name = "idx_laborder_patient", columnList = "patientId"),
        @Index(name = "idx_laborder_test",    columnList = "labTestId"),
        @Index(name = "idx_laborder_status",  columnList = "status")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private Long doctorId;

    @Column(nullable = false)
    private Long labTestId;

    private LocalDateTime orderedDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.ORDERED;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.ROUTINE;

    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.orderedDate == null) this.orderedDate = LocalDateTime.now();
    }

    public enum OrderStatus { ORDERED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED }
    public enum Priority    { ROUTINE, URGENT, STAT }
}
