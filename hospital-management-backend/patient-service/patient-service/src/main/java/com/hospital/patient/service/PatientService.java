package com.hospital.patient.service;

import com.hospital.patient.dto.PatientDto;
import com.hospital.patient.entity.Patient;
import com.hospital.patient.exception.PatientNotFoundException;
import com.hospital.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    // FIX: Change parameter from 'Patient dto' to 'PatientDto dto'
    @CacheEvict(value = "patients", allEntries = true)
    public PatientDto save(PatientDto dto) {
        Patient patient = convertToEntity(dto); // Ab ye bilkul sahi chalega
        Patient savedPatient = repository.save(patient);
        return convertToDto(savedPatient);
    }

    public List<PatientDto> getAll() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PatientDto> getAllForOwner(Long ownerUserId) {
        return repository.findAllByOwnerUserId(ownerUserId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Page<PatientDto> search(String search, String gender, String disease,
                                   Long ownerUserId, Pageable pageable) {
        Specification<Patient> specification = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (search != null && !search.isBlank()) {
                String value = "%" + search.trim().toLowerCase() + "%";
                predicate = builder.and(predicate, builder.or(
                        builder.like(builder.lower(root.get("name")), value),
                        builder.like(builder.lower(root.get("contactNumber")), value),
                        builder.like(builder.lower(root.get("disease")), value)));
            }
            if (gender != null && !gender.isBlank()) {
                predicate = builder.and(predicate, builder.equal(
                        builder.lower(root.get("gender")), gender.trim().toLowerCase()));
            }
            if (disease != null && !disease.isBlank()) {
                predicate = builder.and(predicate, builder.like(
                        builder.lower(root.get("disease")), "%" + disease.trim().toLowerCase() + "%"));
            }
            if (ownerUserId != null) {
                predicate = builder.and(predicate, builder.equal(root.get("ownerUserId"), ownerUserId));
            }
            return predicate;
        };
        return repository.findAll(specification, pageable).map(this::convertToDto);
    }

    @Cacheable(value = "patients", key = "#id")
    public PatientDto getById(Long id) {
        Patient patient = repository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient with ID " + id + " does not exist."));
        return convertToDto(patient);
    }

    public PatientDto getByIdForOwner(Long id, Long ownerUserId) {
        Patient patient = repository.findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new PatientNotFoundException("Patient with ID " + id + " does not exist."));
        return convertToDto(patient);
    }

    @CacheEvict(value = "patients", allEntries = true)
    public PatientDto saveForOwner(PatientDto dto, Long ownerUserId) {
        Patient patient = convertToEntity(dto);
        patient.setOwnerUserId(ownerUserId);
        return convertToDto(repository.save(patient));
    }

    // Helper method for DTO conversion
    private PatientDto convertToDto(Patient patient) {
        return PatientDto.builder()
                .id(patient.getId())
                .name(patient.getName())
                .age(patient.getAge())
                .gender(patient.getGender())
                .contactNumber(patient.getContactNumber())
                .address(patient.getAddress())
                .disease(patient.getDisease())
                .build();
    }

    // Helper method for Entity conversion
    private Patient convertToEntity(PatientDto dto) {
        return Patient.builder()
                .id(dto.getId())
                .name(dto.getName())
                .age(dto.getAge())
                .gender(dto.getGender())
                .contactNumber(dto.getContactNumber())
                .address(dto.getAddress())
                .disease(dto.getDisease())
                .build();
    }
}