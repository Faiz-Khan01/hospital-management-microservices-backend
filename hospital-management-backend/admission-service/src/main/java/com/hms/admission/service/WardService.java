package com.hms.admission.service;

import com.hms.admission.entity.Ward;
import com.hms.admission.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WardService {

    private final WardRepository wardRepository;

    public List<Ward> getAll() {
        return wardRepository.findAll();
    }

    public Page<Ward> search(String name, String wardType, Long departmentId, Pageable pageable) {
        Specification<Ward> spec = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (name != null && !name.isBlank()) predicate = builder.and(predicate,
                    builder.like(builder.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%"));
            if (wardType != null && !wardType.isBlank()) predicate = builder.and(predicate,
                    builder.equal(builder.lower(root.get("wardType")), wardType.trim().toLowerCase()));
            if (departmentId != null) predicate = builder.and(predicate,
                    builder.equal(root.get("departmentId"), departmentId));
            return predicate;
        };
        return wardRepository.findAll(spec, pageable);
    }

    public Ward getById(Long id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ward not found with id: " + id));
    }

    public Ward create(Ward ward) {
        return wardRepository.save(ward);
    }

    public Ward update(Long id, Ward details) {
        Ward ward = getById(id);
        ward.setName(details.getName());
        ward.setWardType(details.getWardType());
        ward.setDepartmentId(details.getDepartmentId());
        ward.setFloorNumber(details.getFloorNumber());
        ward.setTotalBeds(details.getTotalBeds());
        return wardRepository.save(ward);
    }

    public void delete(Long id) {
        wardRepository.deleteById(id);
    }
}
