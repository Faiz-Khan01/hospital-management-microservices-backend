package com.hospital.patient.controller;

import com.hospital.patient.dto.BedDto;
import com.hospital.patient.service.BedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @GetMapping
    public ResponseEntity<List<BedDto>> getAllBeds() {
        return ResponseEntity.ok(bedService.getAllBeds());
    }

    @GetMapping("/available")
    public ResponseEntity<List<BedDto>> getAvailableBeds() {
        return ResponseEntity.ok(bedService.getAvailableBeds());
    }

    @GetMapping("/available-count")
    public ResponseEntity<Map<String, Long>> getAvailableBedsCount() {
        return ResponseEntity.ok(Map.of("availableBeds", bedService.getAvailableBedsCount()));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getBedsSummary() {
        return ResponseEntity.ok(bedService.getBedsSummary());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BedDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        String status = payload.getOrDefault("status", "AVAILABLE");
        return ResponseEntity.ok(bedService.updateBedStatus(id, status));
    }
}
