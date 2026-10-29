package com.hospital.prescription.controller;

import com.hospital.prescription.dto.PrescriptionDto;
import com.hospital.prescription.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService service; // 🔄 Injected Service layer instead of raw Repository

    // Create prescription via DTO
    @PostMapping
    public ResponseEntity<PrescriptionDto> createPrescription(@RequestBody PrescriptionDto dto) {
        PrescriptionDto createdRx = service.create(dto);
        return ResponseEntity.ok(createdRx);
    }

    // Get all prescriptions via DTO
    @GetMapping
    public ResponseEntity<List<PrescriptionDto>> getAllPrescriptions() {
        List<PrescriptionDto> list = service.getAll();
        return ResponseEntity.ok(list);
    }

    // Get by ID via DTO
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete prescription
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}