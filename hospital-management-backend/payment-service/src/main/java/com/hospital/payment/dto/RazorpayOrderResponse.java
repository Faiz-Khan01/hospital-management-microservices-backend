package com.hospital.payment.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class RazorpayOrderResponse {
    String orderId;
    Long billingId;
    BigDecimal amount;
    String currency;
    String keyId;
}
