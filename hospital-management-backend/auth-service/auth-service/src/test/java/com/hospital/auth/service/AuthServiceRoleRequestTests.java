package com.hospital.auth.service;

import com.hospital.auth.dto.RegisterRequest;
import com.hospital.auth.dto.UserResponseDto;
import com.hospital.auth.entity.User;
import com.hospital.auth.enums.AccountStatus;
import com.hospital.auth.enums.Role;
import com.hospital.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceRoleRequestTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void doctorRegistrationCreatesAPendingPatientAccount() {
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegisterRequest request = RegisterRequest.builder()
                .username("rahul")
                .name("Dr Rahul Dey")
                .email("rahul@example.com")
                .password("password")
                .role(Role.DOCTOR)
                .build();

        UserResponseDto result = authService.register(request);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User user = userCaptor.getValue();

        assertEquals(Role.PATIENT, result.getRole());
        assertEquals(Role.DOCTOR, result.getRequestedRole());
        assertEquals(AccountStatus.PENDING_APPROVAL, result.getStatus());
        assertEquals(Role.PATIENT, user.getRole());
        assertEquals(Role.DOCTOR, user.getRequestedRole());
        assertEquals(AccountStatus.PENDING_APPROVAL, user.getStatus());
        assertFalse(user.isEnabled());
    }

    @Test
    void approvingRequestActivatesRequestedStaffRole() {
        User user = User.builder()
                .id(7L)
                .username("rahul")
                .name("Dr Rahul Dey")
                .email("rahul@example.com")
                .password("encoded-password")
                .role(Role.PATIENT)
                .requestedRole(Role.DOCTOR)
                .status(AccountStatus.PENDING_APPROVAL)
                .enabled(false)
                .build();
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserResponseDto updated = authService.approveRequestedRole(7L);

        assertEquals(Role.DOCTOR, updated.getRole());
        assertNull(updated.getRequestedRole());
        assertEquals(AccountStatus.ACTIVE, updated.getStatus());
        assertTrue(updated.isEnabled());
        assertEquals(Role.DOCTOR, user.getRole());
        assertNull(user.getRequestedRole());
        assertEquals(AccountStatus.ACTIVE, user.getStatus());
        assertTrue(user.isEnabled());
        verify(userRepository).save(user);
    }

    @Test
    void publicRegistrationCannotRequestAdminRole() {
        RegisterRequest request = RegisterRequest.builder()
                .username("new-admin")
                .name("New Admin")
                .email("new-admin@example.com")
                .password("password")
                .role(Role.ADMIN)
                .build();

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    }
}
