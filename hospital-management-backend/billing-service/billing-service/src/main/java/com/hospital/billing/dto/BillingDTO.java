package com.hospital.billing.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillingDTO {

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