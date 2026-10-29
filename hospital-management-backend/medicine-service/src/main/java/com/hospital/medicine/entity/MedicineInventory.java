package com.hospital.medicine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_inventory",
    indexes = {
        @Index(name = "idx_inv_medicine", columnList = "medicineId"),
        @Index(name = "idx_inv_expiry",   columnList = "expiryDate"),
        @Index(name = "idx_inv_batch",    columnList = "batchNumber")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long medicineId;

    private String batchNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    private BigDecimal unitCost;
    private String supplierName;
    private LocalDate receivedDate;
    private LocalDate expiryDate;
    private String location;  // Shelf / rack / bin reference

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
