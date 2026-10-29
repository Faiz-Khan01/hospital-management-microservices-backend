package com.hospital.labreport.service;

import com.hospital.labreport.client.NotificationClient;
import com.hospital.labreport.dto.LabReportDto;
import com.hospital.labreport.entity.LabReport;
import com.hospital.labreport.repository.LabReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LabReportService {

    private final LabReportRepository labReportRepository;
    private final NotificationClient notificationClient;

    public List<LabReportDto> getAllReports() {
        return labReportRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LabReportDto getReportById(Long id) {
        LabReport report = labReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab report not found with id: " + id));
        return mapToDto(report);
    }

    public List<LabReportDto> getReportsByPatientId(Long patientId) {
        return labReportRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LabReportDto createReport(LabReport report) {
        if (report.getReportDate() == null) {
            report.setReportDate(LocalDateTime.now());
        }
        if (report.getStatus() == null) {
            report.setStatus("PENDING");
        }
        LabReport saved = labReportRepository.save(report);
        return mapToDto(saved);
    }

    public LabReportDto updateReport(Long id, LabReport details) {
        LabReport report = labReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab report not found with id: " + id));
        report.setResultValue(details.getResultValue());
        report.setStatus(details.getStatus());
        report.setComments(details.getComments());
        LabReport saved = labReportRepository.save(report);

        // Inter-service event: Trigger LAB_REPORT_AVAILABLE notification when report is completed
        if ("COMPLETED".equalsIgnoreCase(saved.getStatus()) || "AVAILABLE".equalsIgnoreCase(saved.getStatus())) {
            try {
                Map<String, Object> notifRequest = new HashMap<>();
                notifRequest.put("userId", saved.getPatientId());
                notifRequest.put("type", "LAB_REPORT_AVAILABLE");
                notifRequest.put("patientName", "Patient #" + saved.getPatientId());
                notifRequest.put("appointmentDate", saved.getReportDate() != null ? saved.getReportDate().toString() : "Today");
                notifRequest.put("departmentName", "Laboratory & Diagnostics");
                notificationClient.triggerNotification(notifRequest);
                log.info("Lab report available notification dispatched for report id={}", saved.getId());
            } catch (Exception e) {
                log.warn("Notification dispatch failed for lab report id={}: {}", saved.getId(), e.getMessage());
            }
        }

        return mapToDto(saved);
    }

    public void deleteReport(Long id) {
        labReportRepository.deleteById(id);
    }

    private LabReportDto mapToDto(LabReport report) {
        return LabReportDto.builder()
                .id(report.getId())
                .patientId(report.getPatientId())
                .doctorId(report.getDoctorId())
                .labTestId(report.getLabTestId())
                .resultValue(report.getResultValue())
                .status(report.getStatus())
                .comments(report.getComments())
                .reportDate(report.getReportDate())
                .build();
    }
}
