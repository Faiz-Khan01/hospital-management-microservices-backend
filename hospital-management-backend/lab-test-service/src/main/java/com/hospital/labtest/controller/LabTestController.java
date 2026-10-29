package com.hospital.labtest.controller;

import com.hospital.labtest.dto.LabTestDto;
import com.hospital.labtest.entity.LabTest;
import com.hospital.labtest.service.LabTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab-tests")
@RequiredArgsConstructor
public class LabTestController {

    private final LabTestService labTestService;

    @GetMapping
    public ResponseEntity<List<LabTestDto>> getAllLabTests() {
        return ResponseEntity.ok(labTestService.getAllLabTests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestDto> getLabTestById(@PathVariable Long id) {
        return ResponseEntity.ok(labTestService.getLabTestById(id));
    }

    @PostMapping
    public ResponseEntity<LabTestDto> createLabTest(@RequestBody LabTest labTest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(labTestService.createLabTest(labTest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabTestDto> updateLabTest(@PathVariable Long id, @RequestBody LabTest details) {
        return ResponseEntity.ok(labTestService.updateLabTest(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabTest(@PathVariable Long id) {
        labTestService.deleteLabTest(id);
        return ResponseEntity.noContent().build();
    }
}
