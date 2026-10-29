package com.hospital.medicalrecord.service;

import com.hospital.medicalrecord.dto.MedicalRecordDto;
import com.hospital.medicalrecord.entity.MedicalRecord;
import com.hospital.medicalrecord.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;

    public List<MedicalRecordDto> getAllRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MedicalRecordDto getRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));
        return mapToDto(record);
    }

    public List<MedicalRecordDto> getRecordsByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MedicalRecordDto createRecord(MedicalRecord record) {
        if (record.getRecordDate() == null) {
            record.setRecordDate(LocalDateTime.now());
        }
        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToDto(saved);
    }

    public MedicalRecordDto updateRecord(Long id, MedicalRecord details) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));
        record.setDiagnosis(details.getDiagnosis());
        record.setTreatmentPlan(details.getTreatmentPlan());
        record.setNotes(details.getNotes());
        return mapToDto(medicalRecordRepository.save(record));
    }

    public void deleteRecord(Long id) {
        medicalRecordRepository.deleteById(id);
    }

    private MedicalRecordDto mapToDto(MedicalRecord record) {
        return MedicalRecordDto.builder()
                .id(record.getId())
                .patientId(record.getPatientId())
                .doctorId(record.getDoctorId())
                .diagnosis(record.getDiagnosis())
                .treatmentPlan(record.getTreatmentPlan())
                .notes(record.getNotes())
                .recordDate(record.getRecordDate())
                .build();
    }
}
