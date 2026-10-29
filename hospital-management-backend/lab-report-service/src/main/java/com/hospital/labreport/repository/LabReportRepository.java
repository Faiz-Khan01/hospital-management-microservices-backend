package com.hospital.labreport.repository;

import com.hospital.labreport.entity.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabReportRepository extends JpaRepository<LabReport, Long> {
    List<LabReport> findByPatientId(Long patientId);
    List<LabReport> findByDoctorId(Long doctorId);
    List<LabReport> findByLabTestId(Long labTestId);
    List<LabReport> findByStatus(String status);
}
