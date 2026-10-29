package com.hospital.user.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalAppointmentDto {
    private Long appointmentId;
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String appointmentDate;
    private String time;
    private String reason;
    private String status;
}
