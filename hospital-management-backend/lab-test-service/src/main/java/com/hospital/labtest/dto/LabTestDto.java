package com.hospital.labtest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestDto {
    private Long id;
    private String testName;
    private String testCode;
    private String description;
    private BigDecimal price;
    private String normalRange;
}
