package com.hospital.patient.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientDto {

    private Long id;
    private String name;
    private Integer age;
    private String gender;
    private String contactNumber;
    private String address;
    private String disease;
}