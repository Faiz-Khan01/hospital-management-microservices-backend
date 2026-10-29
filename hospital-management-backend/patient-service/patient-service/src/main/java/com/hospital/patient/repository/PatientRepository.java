package com.hospital.patient.repository;

import com.hospital.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {

    Optional<Patient> findByContactNumber(String contactNumber);

    List<Patient> findAllByOwnerUserId(Long ownerUserId);

    Optional<Patient> findByIdAndOwnerUserId(Long id, Long ownerUserId);
}