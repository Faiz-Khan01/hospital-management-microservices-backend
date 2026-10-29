package com.hospital.user.client;

import com.hospital.user.dto.external.ExternalAppointmentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "appointment-service")
public interface AppointmentServiceClient {

    @GetMapping("/api/v1/appointments")
    List<ExternalAppointmentDto> getAllAppointments();
}
