package com.hms.admission.controller;

import com.hms.admission.entity.Admission;
import com.hms.admission.service.AdmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admissions")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionService admissionService;

    @GetMapping
    public ResponseEntity<List<Admission>> getAll(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String status) {
        if (patientId != null) {
            return ResponseEntity.ok(admissionService.getByPatient(patientId));
        }

        if (status != null) {
            return ResponseEntity.ok(admissionService.getByStatus(status));
        }
        return ResponseEntity.ok(admissionService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Admission>> search(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long wardId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "admissionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        if (pageable.getSort().stream().anyMatch(order -> !Set.of(
                "id", "patientId", "doctorId", "wardId", "bedId", "admissionDate", "status", "createdAt")
                .contains(order.getProperty()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field");
        }
        return ResponseEntity.ok(admissionService.search(patientId, doctorId, wardId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admission> getById(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Admission> create(@RequestBody Admission admission) {
        return ResponseEntity.status(HttpStatus.CREATED).body(admissionService.create(admission));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Admission> update(
            @PathVariable Long id, @RequestBody Admission admission) {
        return ResponseEntity.ok(admissionService.update(id, admission));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        admissionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
