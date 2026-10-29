package com.hospital.doctor.service;

import com.hospital.doctor.dto.DoctorDto;
import com.hospital.doctor.entity.Doctor;
import com.hospital.doctor.exception.ResourceNotFoundException;
import com.hospital.doctor.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository repository;

    public DoctorService(DoctorRepository repository) {
        this.repository = repository;
    }

    @CacheEvict(value = "doctors", allEntries = true)
    public DoctorDto save(DoctorDto dto) {
        Doctor doctor = convertToEntity(dto);
        Doctor savedDoctor = repository.save(doctor);
        return convertToDto(savedDoctor);
    }

    public List<DoctorDto> getAll() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "doctors", key = "#id")
    public DoctorDto getById(Long id) {
        Doctor doctor = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + id + " not found"));
        return convertToDto(doctor);
    }

    @CacheEvict(value = "doctors", allEntries = true)
    public DoctorDto update(Long id, DoctorDto dto) {
        Doctor doctor = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + id + " not found"));
        doctor.setName(dto.getName());
        if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
        if (dto.getContactNumber() != null) doctor.setContactNumber(dto.getContactNumber());
        if (dto.getEmail() != null) doctor.setEmail(dto.getEmail());
        if (dto.getExperience() != null) doctor.setExperience(dto.getExperience());
        Doctor updated = repository.save(doctor);
        return convertToDto(updated);
    }

    @CacheEvict(value = "doctors", allEntries = true)
    public void delete(Long id) {
        Doctor doctor = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + id + " not found"));
        repository.delete(doctor);
    }

    // Helper: Convert Entity to DTO
    private DoctorDto convertToDto(Doctor doctor) {
        return DoctorDto.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .specialization(doctor.getSpecialization())
                .contactNumber(doctor.getContactNumber())
                .email(doctor.getEmail())
                .experience(doctor.getExperience())
                .build();
    }

    // Helper: Convert DTO to Entity
    private Doctor convertToEntity(DoctorDto dto) {
        return Doctor.builder()
                .id(dto.getId())
                .name(dto.getName())
                .specialization(dto.getSpecialization())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .experience(dto.getExperience())
                .build();
    }
}
