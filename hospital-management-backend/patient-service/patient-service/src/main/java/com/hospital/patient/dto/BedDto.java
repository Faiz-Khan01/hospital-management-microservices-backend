package com.hospital.patient.dto;

import com.hospital.patient.entity.Bed;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedDto {

    private Long id;
    private Long wardId;
    private String wardName;
    private String bedNumber;
    private String bedType;
    private String status;
}
