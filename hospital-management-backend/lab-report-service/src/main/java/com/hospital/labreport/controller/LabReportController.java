package com.hospital.labreport.controller;

import com.hospital.labreport.dto.LabReportDto;
import com.hospital.labreport.entity.LabReport;
import com.hospital.labreport.service.LabReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab-reports")
@RequiredArgsConstructor
public class LabReportController {

    private final LabReportService labReportService;

    @GetMapping
    public ResponseEntity<List<LabReportDto>> getAllReports() {
        return ResponseEntity.ok(labReportService.getAllReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabReportDto> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(labReportService.getReportById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabReportDto>> getReportsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(labReportService.getReportsByPatientId(patientId));
    }

    @PostMapping
    public ResponseEntity<LabReportDto> createReport(@RequestBody LabReport report) {
        return ResponseEntity.status(HttpStatus.CREATED).body(labReportService.createReport(report));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabReportDto> updateReport(@PathVariable Long id, @RequestBody LabReport details) {
        return ResponseEntity.ok(labReportService.updateReport(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        labReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
