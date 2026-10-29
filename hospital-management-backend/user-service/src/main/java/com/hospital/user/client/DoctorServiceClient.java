package com.hospital.user.client;

import com.hospital.user.dto.external.ExternalDoctorDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "doctor-service")
public interface DoctorServiceClient {

    @GetMapping("/api/v1/doctors")
    List<ExternalDoctorDto> getAllDoctors();
}
