package com.hospital.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RazorpayOrderRequest {
    @NotNull
    private Long billingId;
    private BigDecimal amount;
}
