package com.hms.admission.service;

import com.hms.admission.entity.Admission;
import com.hms.admission.repository.AdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final AdmissionRepository admissionRepository;

    public List<Admission> getAll() {
        return admissionRepository.findAll();
    }

    public List<Admission> getByPatient(Long patientId) {
        return admissionRepository.findByPatientId(patientId);
    }

    public List<Admission> getByStatus(String status) {
        return admissionRepository.findByStatus(status);
    }

    public Page<Admission> search(Long patientId, Long doctorId, Long wardId,
                                  String status, Pageable pageable) {
        Specification<Admission> specification = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (patientId != null) predicate = builder.and(predicate,
                    builder.equal(root.get("patientId"), patientId));
            if (doctorId != null) predicate = builder.and(predicate,
                    builder.equal(root.get("doctorId"), doctorId));
            if (wardId != null) predicate = builder.and(predicate,
                    builder.equal(root.get("wardId"), wardId));
            if (status != null && !status.isBlank()) predicate = builder.and(predicate,
                    builder.equal(builder.lower(root.get("status")), status.trim().toLowerCase()));
            return predicate;
        };
        return admissionRepository.findAll(specification, pageable);
    }

    public Admission getById(Long id) {
        return admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with id: " + id));
    }

    public Admission create(Admission admission) {
        return admissionRepository.save(admission);
    }

    public Admission update(Long id, Admission details) {
        Admission admission = getById(id);
        admission.setPatientId(details.getPatientId());
        admission.setDoctorId(details.getDoctorId());
        admission.setWardId(details.getWardId());
        admission.setBedId(details.getBedId());
        admission.setAdmissionDate(details.getAdmissionDate());
        admission.setReason(details.getReason());
        admission.setDiagnosis(details.getDiagnosis());
        admission.setStatus(details.getStatus());
        return admissionRepository.save(admission);
    }

    public void delete(Long id) {
        admissionRepository.deleteById(id);
    }
}
