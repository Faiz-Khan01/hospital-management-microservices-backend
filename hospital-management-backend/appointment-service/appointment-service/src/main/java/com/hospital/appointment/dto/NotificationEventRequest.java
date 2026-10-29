package com.hospital.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEventRequest {
    private Long userId;
    private String recipientEmail;
    private String recipientPhone;
    private String type;
    private List<String> channels;
    private String patientName;
    private String doctorName;
    private String appointmentDate;
    private String departmentName;
}
