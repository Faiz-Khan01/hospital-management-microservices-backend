package com.hospital.labreport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabReportDto {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long labTestId;
    private String resultValue;
    private String status;
    private String comments;
    private LocalDateTime reportDate;
}
