package com.hospital.prescription.dto;

import lombok.Data;

@Data
public class PrescriptionDto {

    private Long id;
    private Long patientId;
    private Long doctorId;       // Added: Missing doctor association field
    private String medicineName;  // Renamed: Changed from 'medicine' to match frontend key
    private String dosage;
    private String duration;     // Added: Missing timeline field
    private String instructions; // Added: Missing medical instructions field
}