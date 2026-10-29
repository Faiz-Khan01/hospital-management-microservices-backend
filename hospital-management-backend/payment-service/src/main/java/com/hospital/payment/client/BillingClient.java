package com.hospital.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "billing-service", fallbackFactory = BillingClientFallbackFactory.class)
public interface BillingClient {

    @GetMapping("/api/v1/billing/{id}")
    Map<String, Object> getBillById(@PathVariable("id") Long id);

    @PutMapping("/api/v1/billing/{id}/payment-status")
    Map<String, Object> updatePaymentStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status);
}
