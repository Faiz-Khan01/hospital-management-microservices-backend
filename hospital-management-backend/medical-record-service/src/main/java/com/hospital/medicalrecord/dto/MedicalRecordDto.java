package com.hospital.medicalrecord.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordDto {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String diagnosis;
    private String treatmentPlan;
    private String notes;
    private LocalDateTime recordDate;
}
