package com.hospital.user.client;

import com.hospital.user.dto.external.ExternalBillingDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "billing-service")
public interface BillingServiceClient {

    @GetMapping("/api/v1/billing")
    List<ExternalBillingDto> getAllBills();
}
