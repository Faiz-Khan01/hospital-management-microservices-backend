package com.hms.admission.repository;

import com.hms.admission.entity.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long>, JpaSpecificationExecutor<Admission> {
    List<Admission> findByPatientId(Long patientId);
    List<Admission> findByStatus(String status);
}
