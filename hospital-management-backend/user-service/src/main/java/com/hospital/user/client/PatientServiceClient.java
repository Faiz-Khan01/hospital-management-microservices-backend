package com.hospital.user.client;

import com.hospital.user.dto.external.ExternalPatientDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "patient-service")
public interface PatientServiceClient {

    @GetMapping("/api/v1/patients")
    List<ExternalPatientDto> getAllPatients();

    @GetMapping("/api/v1/beds/summary")
    Map<String, Object> getBedsSummary();
}
