package com.hms.admission.repository;

import com.hms.admission.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long>, JpaSpecificationExecutor<Bed> {
    List<Bed> findByWardId(Long wardId);
    List<Bed> findByStatus(String status);
}
