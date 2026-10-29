package com.hospital.payment.client;

import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class BillingClientFallbackFactory implements FallbackFactory<BillingClient> {
    @Override
    public BillingClient create(Throwable cause) {
        return new BillingClient() {
            @Override
            public Map<String, Object> getBillById(Long id) {
                throw new IllegalStateException("Billing service is temporarily unavailable", cause);
            }

            @Override
            public Map<String, Object> updatePaymentStatus(Long id, String status) {
                throw new IllegalStateException("Billing service is temporarily unavailable", cause);
            }
        };
    }
}
