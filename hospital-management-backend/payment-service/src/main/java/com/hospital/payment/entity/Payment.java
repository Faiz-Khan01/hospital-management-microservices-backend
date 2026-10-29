package com.hospital.payment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    private Long billingId;
    private BigDecimal amount;
    private String paymentMethod; // e.g., CASH, CARD, UPI, INSURANCE
    @Column(unique = true)
    private String transactionId;
    private String status; // e.g., PENDING, COMPLETED, FAILED, REFUNDED
    private LocalDateTime paymentDate;
}
