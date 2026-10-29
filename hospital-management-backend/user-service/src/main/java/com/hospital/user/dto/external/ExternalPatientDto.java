package com.hospital.user.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalPatientDto {
    private Long id;
    private String name;
    private Integer age;
    private String gender;
    private String contactNumber;
    private String disease;
    private String address;
}
