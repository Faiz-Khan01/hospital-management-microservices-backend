package com.hospital.medicine.service;

import com.hospital.medicine.dto.MedicineDto;
import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public List<MedicineDto> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MedicineDto getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        return mapToDto(medicine);
    }

    public MedicineDto createMedicine(Medicine medicine) {
        Medicine saved = medicineRepository.save(medicine);
        return mapToDto(saved);
    }

    public MedicineDto updateMedicine(Long id, Medicine details) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicine.setName(details.getName());
        medicine.setManufacturer(details.getManufacturer());
        medicine.setCategory(details.getCategory());
        medicine.setPrice(details.getPrice());
        medicine.setStockQuantity(details.getStockQuantity());
        medicine.setExpiryDate(details.getExpiryDate());
        return mapToDto(medicineRepository.save(medicine));
    }

    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }

    private MedicineDto mapToDto(Medicine medicine) {
        return MedicineDto.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .manufacturer(medicine.getManufacturer())
                .category(medicine.getCategory())
                .price(medicine.getPrice())
                .stockQuantity(medicine.getStockQuantity())
                .expiryDate(medicine.getExpiryDate())
                .build();
    }
}
