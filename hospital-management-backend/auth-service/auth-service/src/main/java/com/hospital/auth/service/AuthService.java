package com.hospital.auth.service;

import com.hospital.auth.dto.*;
import com.hospital.auth.entity.User;
import com.hospital.auth.enums.Role;
import com.hospital.auth.enums.AccountStatus;
import com.hospital.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthResponse authenticate(AuthRequest request) {
        // Find user by username or email
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (user.getStatus() == AccountStatus.PENDING_APPROVAL) {
            throw new DisabledException("Staff account request is pending administrator approval.");
        }
        if (!user.isEnabled() || user.getStatus() != AccountStatus.ACTIVE) {
            throw new DisabledException("Account is not active. Please contact administrator.");
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .enabled(user.isEnabled())
                .message("Login successful")
                .build();
    }

    @Transactional
    public UserResponseDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered");
        }

        Role requestedRole = request.getRole();
        if (requestedRole == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts can only be assigned by an administrator");
        }
        Role assignedRole = (requestedRole != null) ? requestedRole : Role.PATIENT;

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .requestedRole(null)
                .status(AccountStatus.ACTIVE)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No user found with email: " + request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        return resetToken;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserResponseDto updateUserStatus(Long userId, StatusUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        AccountStatus status = request.getStatus();
        if (status == null && request.getEnabled() != null) {
            status = request.getEnabled() ? AccountStatus.ACTIVE : AccountStatus.INACTIVE;
        }
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        user.setStatus(status);
        user.setEnabled(status == AccountStatus.ACTIVE);
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Transactional
    public UserResponseDto approveRequestedRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        if (user.getRequestedRole() == null || user.getStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new IllegalArgumentException("User has no pending staff role request");
        }

        user.setRole(user.getRequestedRole());
        user.setRequestedRole(null);
        user.setStatus(AccountStatus.ACTIVE);
        user.setEnabled(true);
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserResponseDto updateUserRole(Long userId, RoleUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin roles cannot be assigned through this endpoint");
        }

        user.setRole(request.getRole());
        user.setRequestedRole(null);
        if (user.getStatus() == AccountStatus.PENDING_APPROVAL) {
            user.setStatus(AccountStatus.ACTIVE);
            user.setEnabled(true);
        }
        return mapToDto(userRepository.save(user));
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return mapToDto(user);
    }

    private UserResponseDto mapToDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .requestedRole(user.getRequestedRole())
                .status(user.getStatus())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}