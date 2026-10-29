package com.hospital.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wards",
    indexes = { @Index(name = "idx_ward_dept", columnList = "departmentId") }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private WardType wardType = WardType.GENERAL;

    private Long departmentId;
    private Integer floorNumber;

    @Builder.Default
    private Integer totalBeds = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum WardType {
        GENERAL, ICU, NICU, MATERNITY, SURGICAL, PEDIATRIC, ISOLATION
    }
}
