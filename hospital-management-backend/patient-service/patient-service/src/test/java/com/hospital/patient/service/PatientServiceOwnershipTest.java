package com.hospital.patient.service;

import com.hospital.patient.dto.PatientDto;
import com.hospital.patient.entity.Patient;
import com.hospital.patient.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceOwnershipTest {

    @Mock
    private PatientRepository repository;

    @InjectMocks
    private PatientService service;

    @Test
    void ownerOnlyReceivesOwnedPatients() {
        Patient patient = Patient.builder().id(10L).ownerUserId(7L).name("Owned").build();
        when(repository.findAllByOwnerUserId(7L)).thenReturn(List.of(patient));

        List<PatientDto> result = service.getAllForOwner(7L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
        verify(repository).findAllByOwnerUserId(7L);
        verify(repository, never()).findAll();
    }

    @Test
    void newPatientIsLinkedToAuthenticatedOwner() {
        PatientDto request = PatientDto.builder().name("New patient").build();
        Patient saved = Patient.builder().id(11L).ownerUserId(7L).name("New patient").build();
        when(repository.save(any(Patient.class))).thenReturn(saved);

        PatientDto result = service.saveForOwner(request, 7L);

        assertEquals(11L, result.getId());
        verify(repository).save(argThat(patient -> Long.valueOf(7L).equals(patient.getOwnerUserId())));
    }
}
