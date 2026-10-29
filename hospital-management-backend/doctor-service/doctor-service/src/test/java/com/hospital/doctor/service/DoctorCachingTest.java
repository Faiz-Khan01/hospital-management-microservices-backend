package com.hospital.doctor.service;

import com.hospital.doctor.dto.DoctorDto;
import org.junit.jupiter.api.Test;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class DoctorCachingTest {
    @Test
    void cachesDoctorReadsAndEvictsOnWrites() throws NoSuchMethodException {
        assertNotNull(DoctorService.class.getMethod("getById", Long.class)
                .getAnnotation(Cacheable.class));
        assertNotNull(DoctorService.class.getMethod("save", DoctorDto.class)
                .getAnnotation(CacheEvict.class));
    }
}
