package com.hospital.patient.service;

import com.hospital.patient.dto.BedDto;
import com.hospital.patient.entity.Bed;
import com.hospital.patient.entity.Ward;
import com.hospital.patient.repository.BedRepository;
import com.hospital.patient.repository.WardRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;
    private final WardRepository wardRepository;

    @PostConstruct
    @Transactional
    public void seedInitialBedsIfEmpty() {
        if (wardRepository.count() == 0) {
            log.info("Seeding initial Hospital Wards...");
            List<Ward> wards = List.of(
                    Ward.builder().name("General Ward A").wardType(Ward.WardType.GENERAL).floorNumber(1).totalBeds(30).build(),
                    Ward.builder().name("ICU Critical Care").wardType(Ward.WardType.ICU).floorNumber(2).totalBeds(10).build(),
                    Ward.builder().name("NICU Pediatrics").wardType(Ward.WardType.NICU).floorNumber(2).totalBeds(8).build(),
                    Ward.builder().name("Maternity Wing").wardType(Ward.WardType.MATERNITY).floorNumber(1).totalBeds(20).build(),
                    Ward.builder().name("Surgical Recovery").wardType(Ward.WardType.SURGICAL).floorNumber(3).totalBeds(15).build(),
                    Ward.builder().name("Isolation Ward").wardType(Ward.WardType.ISOLATION).floorNumber(4).totalBeds(10).build()
            );
            wardRepository.saveAll(wards);
        }

        if (bedRepository.count() == 0) {
            log.info("Seeding initial Hospital Beds with realistic availability...");
            List<Ward> allWards = wardRepository.findAll();
            List<Bed> bedsToSave = new ArrayList<>();

            for (Ward ward : allWards) {
                int total = ward.getTotalBeds() != null ? ward.getTotalBeds() : 10;
                for (int i = 1; i <= total; i++) {
                    String prefix = ward.getName().substring(0, 3).toUpperCase().replaceAll("\\s+", "");
                    String bedNum = String.format("%s-%02d", prefix, i);

                    // Distribute statuses: ~75% available, ~20% occupied, ~5% reserved/maint
                    Bed.BedStatus status;
                    if (i % 5 == 0) {
                        status = Bed.BedStatus.OCCUPIED;
                    } else if (i % 17 == 0) {
                        status = Bed.BedStatus.MAINTENANCE;
                    } else {
                        status = Bed.BedStatus.AVAILABLE;
                    }

                    Bed.BedType type = Bed.BedType.STANDARD;
                    if (ward.getWardType() == Ward.WardType.ICU || ward.getWardType() == Ward.WardType.NICU) {
                        type = Bed.BedType.ICU;
                    } else if (i % 4 == 0) {
                        type = Bed.BedType.DELUXE;
                    }

                    bedsToSave.add(Bed.builder()
                            .wardId(ward.getId())
                            .bedNumber(bedNum)
                            .bedType(type)
                            .status(status)
                            .build());
                }
            }
            bedRepository.saveAll(bedsToSave);
            log.info("Successfully seeded {} hospital beds across {} wards!", bedsToSave.size(), allWards.size());
        }
    }

    public List<BedDto> getAllBeds() {
        Map<Long, String> wardNames = wardRepository.findAll().stream()
                .collect(Collectors.toMap(Ward::getId, Ward::getName, (a, b) -> a));

        return bedRepository.findAll().stream()
                .map(bed -> toDto(bed, wardNames.get(bed.getWardId())))
                .collect(Collectors.toList());
    }

    public List<BedDto> getAvailableBeds() {
        Map<Long, String> wardNames = wardRepository.findAll().stream()
                .collect(Collectors.toMap(Ward::getId, Ward::getName, (a, b) -> a));

        return bedRepository.findByStatus(Bed.BedStatus.AVAILABLE).stream()
                .map(bed -> toDto(bed, wardNames.get(bed.getWardId())))
                .collect(Collectors.toList());
    }

    public long getAvailableBedsCount() {
        return bedRepository.countByStatus(Bed.BedStatus.AVAILABLE);
    }

    public Map<String, Object> getBedsSummary() {
        long total = bedRepository.count();
        long available = bedRepository.countByStatus(Bed.BedStatus.AVAILABLE);
        long occupied = bedRepository.countByStatus(Bed.BedStatus.OCCUPIED);
        long reserved = bedRepository.countByStatus(Bed.BedStatus.RESERVED);
        long maintenance = bedRepository.countByStatus(Bed.BedStatus.MAINTENANCE);

        double utilization = total > 0 ? ((double) (occupied + reserved) / total) * 100.0 : 0.0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalBeds", total);
        summary.put("availableBeds", available);
        summary.put("occupiedBeds", occupied);
        summary.put("reservedBeds", reserved);
        summary.put("maintenanceBeds", maintenance);
        summary.put("utilizationRate", String.format(Locale.US, "%.1f%%", utilization));

        return summary;
    }

    @Transactional
    public BedDto updateBedStatus(Long id, String statusStr) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with ID: " + id));

        Bed.BedStatus newStatus = Bed.BedStatus.valueOf(statusStr.toUpperCase());
        bed.setStatus(newStatus);
        Bed saved = bedRepository.save(bed);

        String wardName = wardRepository.findById(saved.getWardId())
                .map(Ward::getName).orElse("General Ward");

        return toDto(saved, wardName);
    }

    private BedDto toDto(Bed bed, String wardName) {
        return BedDto.builder()
                .id(bed.getId())
                .wardId(bed.getWardId())
                .wardName(wardName != null ? wardName : "Ward #" + bed.getWardId())
                .bedNumber(bed.getBedNumber())
                .bedType(bed.getBedType() != null ? bed.getBedType().name() : "STANDARD")
                .status(bed.getStatus() != null ? bed.getStatus().name() : "AVAILABLE")
                .build();
    }
}
