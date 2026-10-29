package com.hospital.medicine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineDto {
    private Long id;
    private String name;
    private String manufacturer;
    private String category;
    private BigDecimal price;
    private Integer stockQuantity;
    private LocalDate expiryDate;
}
