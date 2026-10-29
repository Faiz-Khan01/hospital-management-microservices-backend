package com.hospital.user.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalBillingDto {
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
