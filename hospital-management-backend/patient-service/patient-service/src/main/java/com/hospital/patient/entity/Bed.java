package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "beds",
    indexes = {
        @Index(name = "idx_bed_ward",   columnList = "wardId"),
        @Index(name = "idx_bed_status", columnList = "status")
    },
    uniqueConstraints = @UniqueConstraint(name = "uq_bed_ward_num", columnNames = {"wardId", "bedNumber"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long wardId;

    @Column(nullable = false)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BedType bedType = BedType.STANDARD;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BedStatus status = BedStatus.AVAILABLE;

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

    public enum BedType    { STANDARD, DELUXE, ICU, SEMI_PRIVATE, PRIVATE }
    public enum BedStatus  { AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE }
}
