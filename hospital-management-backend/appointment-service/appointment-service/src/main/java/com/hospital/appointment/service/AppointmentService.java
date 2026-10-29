package com.hospital.appointment.service;

import com.hospital.appointment.client.DoctorClient;
import com.hospital.appointment.client.PatientClient;
import com.hospital.appointment.dto.*;
import com.hospital.appointment.entity.Appointment;
import com.hospital.appointment.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class
AppointmentService {

    private final AppointmentRepository repository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;
    private final com.hospital.appointment.client.NotificationClient notificationClient;

    public AppointmentService(AppointmentRepository repository, PatientClient patientClient, DoctorClient doctorClient, com.hospital.appointment.client.NotificationClient notificationClient) {
        this.repository = repository;
        this.patientClient = patientClient;
        this.doctorClient = doctorClient;
        this.notificationClient = notificationClient;
    }

    public AppointmentResponseDTO saveAppointment(AppointmentRequestDTO requestDTO) {
        // Dynamic valid checking with safe fallbacks
        PatientResponse patient;
        try {
            patient = patientClient.getPatientById(requestDTO.getPatientId());
        } catch (Exception e) {
            patient = createFallbackPatient(requestDTO.getPatientId());
        }

        DoctorResponse doctor;
        try {
            doctor = doctorClient.getDoctorById(requestDTO.getDoctorId());
        } catch (Exception e) {
            doctor = createFallbackDoctor(requestDTO.getDoctorId());
        }

        Appointment appointment = new Appointment();
        appointment.setPatientId(requestDTO.getPatientId());
        appointment.setDoctorId(requestDTO.getDoctorId());
        appointment.setAppointmentDate(requestDTO.getAppointmentDate());
        appointment.setTime(requestDTO.getTime());
        appointment.setReason(requestDTO.getReason());
        appointment.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : "SCHEDULED");

        Appointment savedAppointment = repository.save(appointment);

        // Inter-service event: Trigger Appointment Confirmation Notification
        try {
            notificationClient.triggerNotification(
                    com.hospital.appointment.dto.NotificationEventRequest.builder()
                            .userId(requestDTO.getPatientId())
                            .type("APPOINTMENT_CONFIRMATION")
                            .patientName(patient != null ? patient.getName() : "Patient")
                            .doctorName(doctor != null ? doctor.getName() : "Doctor")
                            .departmentName(doctor != null ? doctor.getSpecialization() : "OPD")
                            .appointmentDate(requestDTO.getAppointmentDate() != null ? requestDTO.getAppointmentDate().toString() : "Today")
                            .build()
            );
        } catch (Exception ignored) {
            // Notification dispatch failure should not rollback the scheduled appointment
        }

        return mapToResponseDTO(savedAppointment, patient, doctor);
    }

    public List<AppointmentResponseDTO> getAllAppointments() {
        return repository.findAll().stream().map(appointment -> {

            // 🟢 Safe Patient Retrieval
            PatientResponse patient;
            try {
                patient = patientClient.getPatientById(appointment.getPatientId());
            } catch (Exception e) {
                patient = createFallbackPatient(appointment.getPatientId());
            }

            // 🟢 Safe Doctor Retrieval
            DoctorResponse doctor;
            try {
                doctor = doctorClient.getDoctorById(appointment.getDoctorId());
            } catch (Exception e) {
                doctor = createFallbackDoctor(appointment.getDoctorId());
            }

            return mapToResponseDTO(appointment, patient, doctor);
        }).collect(Collectors.toList());
    }

    public Page<AppointmentResponseDTO> searchAppointments(String status, Long patientId,
                                                            Long doctorId, Pageable pageable) {
        Specification<Appointment> specification = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (status != null && !status.isBlank()) {
                predicate = builder.and(predicate, builder.equal(
                        builder.lower(root.get("status")), status.trim().toLowerCase()));
            }
            if (patientId != null) {
                predicate = builder.and(predicate, builder.equal(root.get("patientId"), patientId));
            }
            if (doctorId != null) {
                predicate = builder.and(predicate, builder.equal(root.get("doctorId"), doctorId));
            }
            return predicate;
        };
        return repository.findAll(specification, pageable).map(appointment -> {
            PatientResponse patient;
            try {
                patient = patientClient.getPatientById(appointment.getPatientId());
            } catch (Exception e) {
                patient = createFallbackPatient(appointment.getPatientId());
            }
            DoctorResponse doctor;
            try {
                doctor = doctorClient.getDoctorById(appointment.getDoctorId());
            } catch (Exception e) {
                doctor = createFallbackDoctor(appointment.getDoctorId());
            }
            return mapToResponseDTO(appointment, patient, doctor);
        });
    }

    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        PatientResponse patient;
        try {
            patient = patientClient.getPatientById(appointment.getPatientId());
        } catch (Exception e) {
            patient = createFallbackPatient(appointment.getPatientId());
        }

        DoctorResponse doctor;
        try {
            doctor = doctorClient.getDoctorById(appointment.getDoctorId());
        } catch (Exception e) {
            doctor = createFallbackDoctor(appointment.getDoctorId());
        }

        return mapToResponseDTO(appointment, appointment.getStatus(), patient, doctor);
    }

    // ⚡ Added: Update Appointment Status Method
    public AppointmentResponseDTO updateAppointmentStatus(Long id, String status) {
        Appointment appointment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        appointment.setStatus(status);
        Appointment updated = repository.save(appointment);

        PatientResponse patient;
        try {
            patient = patientClient.getPatientById(updated.getPatientId());
        } catch (Exception e) {
            patient = createFallbackPatient(updated.getPatientId());
        }

        DoctorResponse doctor;
        try {
            doctor = doctorClient.getDoctorById(updated.getDoctorId());
        } catch (Exception e) {
            doctor = createFallbackDoctor(updated.getDoctorId());
        }

        return mapToResponseDTO(updated, patient, doctor);
    }

    // ⚡ Added: Delete Appointment Method
    public void deleteAppointment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Appointment not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    // Helper fallbacks so the stream never breaks if services are down or starting up
    private PatientResponse createFallbackPatient(Long id) {
        PatientResponse fallback = new PatientResponse();
        fallback.setId(id);
        fallback.setName("Service Offline / Not Found");
        fallback.setDisease("N/A");
        return fallback;
    }

    private DoctorResponse createFallbackDoctor(Long id) {
        DoctorResponse fallback = new DoctorResponse();
        fallback.setId(id);
        fallback.setName("Service Offline / Not Found");
        fallback.setSpecialization("N/A");
        return fallback;
    }

    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment, PatientResponse patient, DoctorResponse doctor) {
        AppointmentResponseDTO response = new AppointmentResponseDTO();
        response.setAppointmentId(appointment.getAppointmentId());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setTime(appointment.getTime());
        response.setReason(appointment.getReason());
        response.setStatus(appointment.getStatus());
        response.setPatient(patient);
        response.setDoctor(doctor);
        return response;
    }

    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment, String customStatus, PatientResponse patient, DoctorResponse doctor) {
        AppointmentResponseDTO response = mapToResponseDTO(appointment, patient, doctor);
        response.setStatus(customStatus);
        return response;
    }
}