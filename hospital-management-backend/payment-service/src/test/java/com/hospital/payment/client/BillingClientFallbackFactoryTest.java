package com.hospital.payment.client;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BillingClientFallbackFactoryTest {
    @Test
    void fallbackSurfacesUnavailableBillingService() {
        RuntimeException cause = new RuntimeException("downstream unavailable");
        BillingClient fallback = new BillingClientFallbackFactory().create(cause);

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> fallback.getBillById(10L));

        assertEquals("Billing service is temporarily unavailable", error.getMessage());
        assertSame(cause, error.getCause());
    }

    @Test
    void fallbackRejectsPaymentStatusUpdates() {
        BillingClient fallback = new BillingClientFallbackFactory().create(new RuntimeException());

        assertThrows(IllegalStateException.class,
                () -> fallback.updatePaymentStatus(10L, "PAID"));
    }
}
