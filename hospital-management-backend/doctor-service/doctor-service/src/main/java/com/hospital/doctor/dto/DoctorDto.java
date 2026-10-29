package com.hospital.doctor.dto;


import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorDto {

    private Long id;
    private String name;
    private String specialization;
    private String contactNumber;
    private String email;
    private Integer experience;
}