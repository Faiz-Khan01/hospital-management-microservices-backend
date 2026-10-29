package com.hospital.prescription.service;

import com.hospital.prescription.dto.PrescriptionDto;
import com.hospital.prescription.entity.Prescription;
import com.hospital.prescription.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository repository;

    // Create prescription using DTO mapping
    public PrescriptionDto create(PrescriptionDto dto) {
        Prescription entity = new Prescription();
        entity.setPatientId(dto.getPatientId());
        entity.setDoctorId(dto.getDoctorId());
        entity.setMedicineName(dto.getMedicineName());
        entity.setDosage(dto.getDosage());
        entity.setDuration(dto.getDuration());
        entity.setInstructions(dto.getInstructions());

        Prescription savedEntity = repository.save(entity);
        return convertToDto(savedEntity);
    }

    // Get all prescriptions mapped to DTO lists
    public List<PrescriptionDto> getAll() {
        return repository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get by ID mapped to Optional DTO
    public Optional<PrescriptionDto> getById(Long id) {
        return repository.findById(id).map(this::convertToDto);
    }

    // Delete
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // 🔄 Helper Conversion Method: Entity -> DTO
    private PrescriptionDto convertToDto(Prescription entity) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatientId());
        dto.setDoctorId(entity.getDoctorId());
        dto.setMedicineName(entity.getMedicineName());
        dto.setDosage(entity.getDosage());
        dto.setDuration(entity.getDuration());
        dto.setInstructions(entity.getInstructions());
        return dto;
    }
}