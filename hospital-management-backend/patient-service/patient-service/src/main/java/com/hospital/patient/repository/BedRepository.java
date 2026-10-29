package com.hospital.patient.repository;

import com.hospital.patient.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    List<Bed> findByStatus(Bed.BedStatus status);

    List<Bed> findByWardId(Long wardId);

    long countByStatus(Bed.BedStatus status);
}
