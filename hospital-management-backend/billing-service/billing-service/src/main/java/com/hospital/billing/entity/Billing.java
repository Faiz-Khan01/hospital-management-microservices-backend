package com.hospital.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "billings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private String patientName;
    private Double consultationFee;
    private Double medicineCharge;
    private Double totalAmount;
    private String paymentMode;
    private String paymentStatus;
    private LocalDate billingDate;
}