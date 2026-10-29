package com.hospital.labtest.service;

import com.hospital.labtest.dto.LabTestDto;
import com.hospital.labtest.entity.LabTest;
import com.hospital.labtest.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabTestService {

    private final LabTestRepository labTestRepository;

    public List<LabTestDto> getAllLabTests() {
        return labTestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LabTestDto getLabTestById(Long id) {
        LabTest labTest = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found with id: " + id));
        return mapToDto(labTest);
    }

    public LabTestDto createLabTest(LabTest labTest) {
        LabTest saved = labTestRepository.save(labTest);
        return mapToDto(saved);
    }

    public LabTestDto updateLabTest(Long id, LabTest details) {
        LabTest labTest = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found with id: " + id));
        labTest.setTestName(details.getTestName());
        labTest.setTestCode(details.getTestCode());
        labTest.setDescription(details.getDescription());
        labTest.setPrice(details.getPrice());
        labTest.setNormalRange(details.getNormalRange());
        return mapToDto(labTestRepository.save(labTest));
    }

    public void deleteLabTest(Long id) {
        labTestRepository.deleteById(id);
    }

    private LabTestDto mapToDto(LabTest labTest) {
        return LabTestDto.builder()
                .id(labTest.getId())
                .testName(labTest.getTestName())
                .testCode(labTest.getTestCode())
                .description(labTest.getDescription())
                .price(labTest.getPrice())
                .normalRange(labTest.getNormalRange())
                .build();
    }
}
