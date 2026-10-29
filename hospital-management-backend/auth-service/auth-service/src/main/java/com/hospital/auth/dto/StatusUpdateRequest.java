package com.hospital.auth.dto;

import com.hospital.auth.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateRequest {
    private AccountStatus status;

    // Kept for clients using the previous boolean status contract.
    private Boolean enabled;
}
