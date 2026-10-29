package com.hospital.department.service;

import com.hospital.department.dto.DepartmentDto;
import com.hospital.department.entity.Department;
import com.hospital.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return mapToDto(department);
    }

    public DepartmentDto createDepartment(Department department) {
        Department saved = departmentRepository.save(department);
        return mapToDto(saved);
    }

    public DepartmentDto updateDepartment(Long id, Department details) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        dept.setName(details.getName());
        dept.setDescription(details.getDescription());
        dept.setHeadOfDepartment(details.getHeadOfDepartment());
        dept.setLocation(details.getLocation());
        return mapToDto(departmentRepository.save(dept));
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    private DepartmentDto mapToDto(Department dept) {
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .headOfDepartment(dept.getHeadOfDepartment())
                .location(dept.getLocation())
                .build();
    }
}
