package com.hospital.appointment.dto;

import lombok.Data;

@Data
public class AppointmentResponseDTO {
    private Long appointmentId;
    private String appointmentDate;
    private String time;
    private String reason;
    private String status;
    private PatientResponse patient;
    private DoctorResponse doctor;
}