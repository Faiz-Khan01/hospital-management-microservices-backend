package com.hospital.prescription.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_items",
    indexes = { @Index(name = "idx_rxitem_rx", columnList = "prescriptionId") }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long prescriptionId;

    private Long medicineId;

    private String medicineName;  // Denormalized for offline reference
    private String dosage;        // e.g. 500mg
    private String frequency;     // e.g. Twice daily after food
    private String duration;      // e.g. 7 days
    private Integer quantity;
    private String notes;
}
