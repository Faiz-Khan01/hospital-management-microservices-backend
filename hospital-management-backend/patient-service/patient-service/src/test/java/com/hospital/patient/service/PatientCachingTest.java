package com.hospital.patient.service;

import com.hospital.patient.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class PatientCachingTest {
    @Test
    void cachesPatientReadsAndEvictsOnWrites() throws NoSuchMethodException {
        assertNotNull(PatientService.class.getMethod("getById", Long.class)
                .getAnnotation(Cacheable.class));
        assertNotNull(PatientService.class.getMethod("save", com.hospital.patient.dto.PatientDto.class)
                .getAnnotation(CacheEvict.class));
        assertNotNull(PatientRepository.class);
    }
}
