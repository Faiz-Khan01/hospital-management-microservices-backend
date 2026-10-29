package com.hospital.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bill_items",
    indexes = { @Index(name = "idx_billitem_bill", columnList = "billId") }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long billId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    private String description;

    @Builder.Default
    private Integer quantity = 1;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    private Long refId;  // Reference to medicine_id / lab_test_id etc.

    public BigDecimal getTotalPrice() {
        if (unitPrice == null || quantity == null) return BigDecimal.ZERO;
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public enum ItemType {
        CONSULTATION, MEDICINE, LAB_TEST, PROCEDURE, ROOM_CHARGE, NURSING, OTHER
    }
}
