package com.hospital.user.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalDoctorDto {
    private Long id;
    private String name;
    private String specialization;
    private String contactNumber;
    private String email;
    private Integer experience;
}
