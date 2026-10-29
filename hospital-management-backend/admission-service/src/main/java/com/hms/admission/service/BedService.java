package com.hms.admission.service;

import com.hms.admission.entity.Bed;
import com.hms.admission.repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;

    public List<Bed> getAll() {
        return bedRepository.findAll();
    }

    public Page<Bed> search(Long wardId, String status, String bedType, Pageable pageable) {
        Specification<Bed> spec = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (wardId != null) predicate = builder.and(predicate, builder.equal(root.get("wardId"), wardId));
            if (status != null && !status.isBlank()) predicate = builder.and(predicate,
                    builder.equal(builder.lower(root.get("status")), status.trim().toLowerCase()));
            if (bedType != null && !bedType.isBlank()) predicate = builder.and(predicate,
                    builder.equal(builder.lower(root.get("bedType")), bedType.trim().toLowerCase()));
            return predicate;
        };
        return bedRepository.findAll(spec, pageable);
    }

    public List<Bed> getByWard(Long wardId) {
        return bedRepository.findByWardId(wardId);
    }

    public List<Bed> getByStatus(String status) {
        return bedRepository.findByStatus(status);
    }

    public Bed getById(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
    }

    public Bed create(Bed bed) {
        return bedRepository.save(bed);
    }

    public Bed update(Long id, Bed details) {
        Bed bed = getById(id);
        bed.setWardId(details.getWardId());
        bed.setBedNumber(details.getBedNumber());
        bed.setBedType(details.getBedType());
        bed.setStatus(details.getStatus());
        return bedRepository.save(bed);
    }

    public void delete(Long id) {
        bedRepository.deleteById(id);
    }
}
