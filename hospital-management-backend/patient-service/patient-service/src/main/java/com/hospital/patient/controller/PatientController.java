package com.hospital.patient.controller;

import com.hospital.patient.dto.PatientDto;
import com.hospital.patient.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PatientDto> addPatient(
            @RequestBody PatientDto patientDto,
            @RequestHeader(value = "X-Authenticated-Role", required = false) String role,
            @RequestHeader(value = "X-Authenticated-User-Id", required = false) Long userId) {
        PatientDto savedPatient;
        if ("PATIENT".equalsIgnoreCase(role)) {
            savedPatient = service.saveForOwner(patientDto, requireUserId(userId));
        } else {
            savedPatient = service.save(patientDto);
        }
        return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatients(
            @RequestHeader(value = "X-Authenticated-Role", required = false) String role,
            @RequestHeader(value = "X-Authenticated-User-Id", required = false) Long userId) {
        if ("PATIENT".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(service.getAllForOwner(requireUserId(userId)));
        }
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PatientDto>> searchPatients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String disease,
            @RequestHeader(value = "X-Authenticated-Role", required = false) String role,
            @RequestHeader(value = "X-Authenticated-User-Id", required = false) Long userId,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        if (pageable.getSort().stream().anyMatch(order -> !Set.of("id", "name", "age", "gender", "createdAt", "updatedAt")
                .contains(order.getProperty()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field");
        }
        Long ownerId = "PATIENT".equalsIgnoreCase(role) ? requireUserId(userId) : null;
        return ResponseEntity.ok(service.search(search, gender, disease, ownerId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatient(
            @PathVariable Long id,
            @RequestHeader(value = "X-Authenticated-Role", required = false) String role,
            @RequestHeader(value = "X-Authenticated-User-Id", required = false) Long userId) {
        if ("PATIENT".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(service.getByIdForOwner(id, requireUserId(userId)));
        }
        return ResponseEntity.ok(service.getById(id));
    }

    private Long requireUserId(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user identity is missing");
        }
        return userId;
    }
}