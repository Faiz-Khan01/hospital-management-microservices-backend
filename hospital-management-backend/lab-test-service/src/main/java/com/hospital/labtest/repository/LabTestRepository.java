package com.hospital.labtest.repository;

import com.hospital.labtest.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    Optional<LabTest> findByTestName(String testName);
    Optional<LabTest> findByTestCode(String testCode);
}
